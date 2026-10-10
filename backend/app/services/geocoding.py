import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# In-memory geocoding cache to avoid repeated HTTP calls and respect Nominatim rate-limits
_GEOCODE_CACHE: Dict[str, str] = {
    # High-precision pre-cached points for our lawful investigation cell tower clusters
    "38.7985,-77.1062": "Approx. 4335 Upland Dr, Rose Hill, Alexandria, VA 22310, USA",
    "38.7990,-77.1055": "Approx. 4335 Upland Dr, Rose Hill, Alexandria, VA 22310, USA",
    "38.7970,-77.1070": "Approx. 6112 Franconia Rd, Alexandria, VA 22310, USA",
    "38.7758,-77.1824": "Approx. 6800 Backlick Rd, Springfield, VA 22150, USA",
    "38.7760,-77.1820": "Approx. 6800 Backlick Rd, Springfield, VA 22150, USA",
    "38.7755,-77.1830": "Approx. 6815 Industrial Dr, Springfield, VA 22151, USA",
    "38.8895,-77.0352": "Approx. 1400 Constitution Ave NW, Washington, DC 20230, USA",
    "38.8900,-77.0345": "Approx. 1300 Pennsylvania Ave NW, Washington, DC 20004, USA",
    "19.0760,72.8777": "Approx. Bandra Kurla Complex, G Block, Bandra East, Mumbai, Maharashtra 400051, India",
    "28.6139,77.2090": "Approx. Rajpath, Central Secretariat, New Delhi, Delhi 110001, India",
}

def _cache_key(lat: float, lon: float) -> str:
    return f"{lat:.4f},{lon:.4f}"

async def reverse_geocode_async(lat: float, lon: float) -> str:
    """
    Looks up approximate street address for coordinates using OpenStreetMap Nominatim.
    Uses in-memory cache and falls back gracefully to formatted coordinate approximation.
    """
    key = _cache_key(lat, lon)
    if key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[key]

    url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
    headers = {
        "User-Agent": "VoiceGuard-RAKSHAM-Forensics/2.4 (forensics@voiceguard.ai)",
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                display_name = data.get("display_name")
                if display_name:
                    # Clean up address into concise approximate street location
                    addr = data.get("address", {})
                    road = addr.get("road") or addr.get("pedestrian") or addr.get("suburb") or ""
                    city = addr.get("city") or addr.get("town") or addr.get("county") or ""
                    state = addr.get("state") or ""
                    postcode = addr.get("postcode") or ""
                    country = addr.get("country") or ""
                    
                    parts = [p for p in [road, city, state, postcode, country] if p]
                    approx_text = f"Approx. {', '.join(parts)}" if parts else f"Approx. {display_name[:75]}"
                    _GEOCODE_CACHE[key] = approx_text
                    return approx_text
    except Exception as exc:
        logger.warning(f"Nominatim geocode request failed for ({lat}, {lon}): {exc}")

    fallback = f"Approx. Coordinates [{lat:.4f}°N, {lon:.4f}°E] (Geocoding network unavailable)"
    _GEOCODE_CACHE[key] = fallback
    return fallback

def reverse_geocode_sync(lat: float, lon: float) -> str:
    """
    Synchronous version for static datasets or quick lookups.
    """
    key = _cache_key(lat, lon)
    if key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[key]

    url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
    headers = {
        "User-Agent": "VoiceGuard-RAKSHAM-Forensics/2.4 (forensics@voiceguard.ai)",
        "Accept": "application/json"
    }

    try:
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                display_name = data.get("display_name")
                if display_name:
                    addr = data.get("address", {})
                    road = addr.get("road") or addr.get("pedestrian") or addr.get("suburb") or ""
                    city = addr.get("city") or addr.get("town") or addr.get("county") or ""
                    state = addr.get("state") or ""
                    postcode = addr.get("postcode") or ""
                    country = addr.get("country") or ""
                    parts = [p for p in [road, city, state, postcode, country] if p]
                    approx_text = f"Approx. {', '.join(parts)}" if parts else f"Approx. {display_name[:75]}"
                    _GEOCODE_CACHE[key] = approx_text
                    return approx_text
    except Exception:
        pass

    fallback = f"Approx. Coordinates [{lat:.4f}°N, {lon:.4f}°E]"
    _GEOCODE_CACHE[key] = fallback
    return fallback
