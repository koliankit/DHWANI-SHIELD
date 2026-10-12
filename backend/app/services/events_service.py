import math
import time
import asyncio
import urllib.parse
import logging
from typing import List, Optional, Dict, Any, Tuple
import httpx

from app.schemas import EventRecord
from app.database import get_analysis_by_id

logger = logging.getLogger(__name__)

# -------------------------------------------------------------
# 1. Spatial Geometry Helpers (Matching Reference Implementation)
# -------------------------------------------------------------

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two coordinate pairs in meters.
    """
    R = 6371000.0  # Earth's radius in meters
    r = math.pi / 180.0
    p = (lat2 - lat1) * r
    l = (lon2 - lon1) * r
    x = math.sin(p / 2.0) ** 2 + math.cos(lat1 * r) * math.cos(lat2 * r) * math.sin(l / 2.0) ** 2
    return 2.0 * R * math.asin(math.sqrt(x))


def point_in_ring(x: float, y: float, ring: List[List[float]]) -> bool:
    """
    Ray-casting algorithm to test whether point (x=lng, y=lat) is inside a linear ring.
    """
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def point_in_polygon_geojson(lng: float, lat: float, geo: Optional[Dict[str, Any]]) -> bool:
    """
    Checks if point (lng, lat) is within a GeoJSON Polygon or MultiPolygon.
    Accounts for polygon boundaries and negative holes.
    """
    if not geo or not isinstance(geo, dict):
        return False
    
    geo_type = geo.get("type", "")
    coordinates = geo.get("coordinates", [])

    if geo_type == "Polygon":
        polygons = [coordinates]
    elif geo_type == "MultiPolygon":
        polygons = coordinates
    else:
        return False

    for poly in polygons:
        if not poly:
            continue
        outer_ring = poly[0]
        if point_in_ring(lng, lat, outer_ring):
            # Check holes
            in_hole = False
            for hole in poly[1:]:
                if point_in_ring(lng, lat, hole):
                    in_hole = True
                    break
            if not in_hole:
                return True
    return False


# -------------------------------------------------------------
# 2. Seeded Demo Data (Reference File EV array, 7 records)
# -------------------------------------------------------------
# Linked with VoiceGuard detection results (risk scores & verdicts)
DEMO_EVENTS_RAW: List[Dict[str, Any]] = [
    {
        "id": "EVT-0001",
        "case_id": "CASE-DEMO-01",
        "caller_id": "SAMPLE-A",
        "timestamp": "2026-10-01 09:12",
        "direction": "Outgoing",
        "location_source": "SAMPLE",
        "lat": 28.6129,
        "lng": 77.2295,
        "status": "Open",
        "risk_score": 0.15,
        "verdict": "LOW RISK",
        "is_demo": True
    },
    {
        "id": "EVT-0002",
        "case_id": "CASE-DEMO-01",
        "caller_id": "SAMPLE-A",
        "timestamp": "2026-10-01 14:40",
        "direction": "Incoming",
        "location_source": "ESTIMATED",
        "lat": 19.0760,
        "lng": 72.8777,
        "status": "Under review",
        "risk_score": 0.65,
        "verdict": "REVIEW REQUIRED",
        "is_demo": True
    },
    {
        "id": "EVT-0003",
        "case_id": "CASE-DEMO-01",
        "caller_id": "SAMPLE-C",
        "timestamp": "2026-10-02 11:05",
        "direction": "Outgoing",
        "location_source": "SAMPLE",
        "lat": 28.6229,
        "lng": 77.2395,
        "status": "Open",
        "risk_score": 0.12,
        "verdict": "LOW RISK",
        "is_demo": True
    },
    {
        "id": "EVT-0004",
        "case_id": "CASE-DEMO-02",
        "caller_id": "SAMPLE-A",
        "timestamp": "2026-10-03 08:15",
        "direction": "Outgoing",
        "location_source": "SAMPLE",
        "lat": 25.2048,
        "lng": 55.2708,
        "status": "Under review",
        "risk_score": 0.58,
        "verdict": "REVIEW REQUIRED",
        "is_demo": True
    },
    {
        "id": "EVT-0005",
        "case_id": "CASE-DEMO-02",
        "caller_id": "SAMPLE-E",
        "timestamp": "2026-10-03 16:47",
        "direction": "Incoming",
        "location_source": "UNAVAILABLE",
        "lat": None,
        "lng": None,
        "status": "Open",
        "risk_score": 0.89,
        "verdict": "HIGH RISK",
        "is_demo": True
    },
    {
        "id": "EVT-0006",
        "case_id": "CASE-DEMO-02",
        "caller_id": "SAMPLE-E",
        "timestamp": "2026-10-04 10:30",
        "direction": "Incoming",
        "location_source": "SAMPLE",
        "lat": 51.5074,
        "lng": -0.1278,
        "status": "Closed",
        "risk_score": 0.20,
        "verdict": "LOW RISK",
        "is_demo": True
    },
    {
        "id": "EVT-0007",
        "case_id": "CASE-DEMO-03",
        "caller_id": "SAMPLE-C",
        "timestamp": "2026-10-04 19:30",
        "direction": "Outgoing",
        "location_source": "ESTIMATED",
        "lat": 12.9716,
        "lng": 77.5946,
        "status": "Open",
        "risk_score": 0.74,
        "verdict": "HIGH RISK",
        "is_demo": True
    }
]

def enrich_event_with_db(event_dict: Dict[str, Any]) -> EventRecord:
    """
    Enriches an event with real database detection results if available.
    """
    event_id = event_dict["id"]
    db_analysis = get_analysis_by_id(event_id)
    if db_analysis:
        event_dict = dict(event_dict)
        event_dict["verdict"] = db_analysis.get("overall_risk", event_dict.get("verdict"))
        event_dict["risk_score"] = db_analysis.get("synthetic_speech_score", event_dict.get("risk_score"))
        event_dict["is_demo"] = False
    return EventRecord(**event_dict)

def get_events() -> List[EventRecord]:
    """
    Returns all events enriched with analysis outcomes.
    """
    return [enrich_event_with_db(e) for e in DEMO_EVENTS_RAW]

def get_event_by_id(event_id: str) -> Optional[EventRecord]:
    """
    Returns a single event by ID or None.
    """
    for e in DEMO_EVENTS_RAW:
        if e["id"].upper() == event_id.upper():
            return enrich_event_with_db(e)
    return None


# -------------------------------------------------------------
# 3. Nominatim Geocoding Proxy (1 req/sec rate limit & caching)
# -------------------------------------------------------------
_GEOCODE_CACHE: Dict[str, Tuple[float, List[Dict[str, Any]]]] = {}
_CACHE_TTL_SECONDS = 600.0  # 10 minutes cache
_LAST_NOMINATIM_REQUEST = 0.0
_NOMINATIM_LOCK = asyncio.Lock()

async def search_places_proxy(query: str) -> List[Dict[str, Any]]:
    """
    Proxies place search to OpenStreetMap Nominatim:
    - User-Agent header following Nominatim usage policy
    - Strictly 1 request per second rate limiting
    - In-memory TTL caching to prevent redundant upstream calls
    - Safe error handling and timeout protection
    """
    global _LAST_NOMINATIM_REQUEST
    q_norm = query.strip().lower()
    if not q_norm:
        return []

    # Check cache first
    now = time.time()
    if q_norm in _GEOCODE_CACHE:
        cached_time, cached_data = _GEOCODE_CACHE[q_norm]
        if now - cached_time < _CACHE_TTL_SECONDS:
            return cached_data

    # Enforce 1 req/second rate limit
    async with _NOMINATIM_LOCK:
        elapsed = now - _LAST_NOMINATIM_REQUEST
        if elapsed < 1.0:
            await asyncio.sleep(1.0 - elapsed)
        _LAST_NOMINATIM_REQUEST = time.time()

    url = (
        f"https://nominatim.openstreetmap.org/search?"
        f"format=jsonv2&limit=6&polygon_geojson=1&q={urllib.parse.quote(query.strip())}"
    )
    headers = {
        "User-Agent": "VoiceGuard-RAKSHAM-Forensics/2.5 (contact: forensics@voiceguard.ai)",
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    _GEOCODE_CACHE[q_norm] = (time.time(), data)
                    return data
            logger.warning(f"Nominatim returned status {resp.status_code} for query '{query}'")
            return []
    except Exception as exc:
        logger.error(f"Nominatim proxy request failed for query '{query}': {exc}")
        return []
