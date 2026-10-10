import math
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CallRecord(BaseModel):
    ref_number: int
    case_id: str
    subject_code: str
    subject_label: str
    target_number: str
    recipient_number: str
    start_time: str
    created_time: str
    duration_str: str
    duration_seconds: int
    direction: str  # incoming | outgoing
    first_tower: str
    last_tower: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    azimuth_degrees: Optional[int] = None
    beamwidth_degrees: Optional[int] = None
    cell_radius_meters: Optional[int] = None
    location_provenance: str  # VERIFIED LOCATION | ESTIMATED AREA | SAMPLE LOCATION | LOCATION UNAVAILABLE
    provenance_details: str
    associated_evidence_id: Optional[str] = None
    associated_case_code: Optional[str] = None
    voice_authenticity: Optional[str] = None
    scam_risk: Optional[str] = None
    distance_meters: Optional[float] = None

# Haversine distance calculation in meters
def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

# Authentic CDR dataset matching Reference Image 1 (Alexandria / Washington DC / Springfield tower cluster)
CALL_RECORDS_DB: List[Dict[str, Any]] = [
    {
        "ref_number": 1348,  # Highlighted selected row in Reference Image 1!
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0192",
        "start_time": "3/7/2026 3:29:59 PM",
        "created_time": "3/7/2026 10:30:00 AM",
        "duration_str": "00:00:27",
        "duration_seconds": 27,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": "case-v0884",
        "associated_case_code": "Case #V-0884",
        "voice_authenticity": "Likely Synthetic (89%)",
        "scam_risk": "HIGH RISK"
    },
    {
        "ref_number": 1364,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0831",
        "start_time": "3/7/2026 5:00:47 PM",
        "created_time": "3/7/2026 12:00:46 PM",
        "duration_str": "00:00:10",
        "duration_seconds": 10,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7990,
        "longitude": -77.1055,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 1361,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0192",
        "start_time": "3/7/2026 4:35:08 PM",
        "created_time": "3/7/2026 11:35:08 AM",
        "duration_str": "00:00:27",
        "duration_seconds": 27,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "REVIEW REQUIRED"
    },
    {
        "ref_number": 1359,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0419",
        "start_time": "3/7/2026 3:45:14 PM",
        "created_time": "3/7/2026 10:45:13 AM",
        "duration_str": "00:00:43",
        "duration_seconds": 43,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": "case-v0885",
        "associated_case_code": "Case #V-0885",
        "voice_authenticity": "Likely Real Voice (24% synth)",
        "scam_risk": "HIGH RISK"
    },
    {
        "ref_number": 1356,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0831",
        "start_time": "3/7/2026 3:43:55 PM",
        "created_time": "3/7/2026 10:43:55 AM",
        "duration_str": "00:00:15",
        "duration_seconds": 15,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 1355,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0192",
        "start_time": "3/7/2026 3:35:00 PM",
        "created_time": "3/7/2026 10:35:00 AM",
        "duration_str": "00:00:13",
        "duration_seconds": 13,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 1352,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0920",
        "start_time": "3/7/2026 3:34:02 PM",
        "created_time": "3/7/2026 10:34:01 AM",
        "duration_str": "00:00:23",
        "duration_seconds": 23,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "REVIEW REQUIRED"
    },
    {
        "ref_number": 1351,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0771",
        "start_time": "3/7/2026 3:30:44 PM",
        "created_time": "3/7/2026 10:30:45 AM",
        "duration_str": "00:00:23",
        "duration_seconds": 23,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": "case-v0886",
        "associated_case_code": "Case #V-0886",
        "voice_authenticity": "Likely Real Voice (18% synth)",
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 1345,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0831",
        "start_time": "3/7/2026 2:54:50 PM",
        "created_time": "3/7/2026 9:54:48 AM",
        "duration_str": "00:00:17",
        "duration_seconds": 17,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 1344,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0192",
        "start_time": "3/7/2026 2:47:11 PM",
        "created_time": "3/7/2026 9:47:09 AM",
        "duration_str": "00:00:13",
        "duration_seconds": 13,
        "direction": "incoming",
        "first_tower": "3102604f160b7e303",
        "last_tower": "3102604f160b7e303",
        "latitude": 38.7985,
        "longitude": -77.1062,
        "azimuth_degrees": 60,
        "beamwidth_degrees": 65,
        "cell_radius_meters": 1200,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 1264,
        "case_id": "7502",
        "subject_code": "7502 VoLTE",
        "subject_label": "Target Principal (Blue)",
        "target_number": "5712747502",
        "recipient_number": "+1 703 555 0999",
        "start_time": "3/4/2026 9:39:21 PM",
        "created_time": "3/4/2026 4:39:20 PM",
        "duration_str": "00:00:26",
        "duration_seconds": 26,
        "direction": "incoming",
        "first_tower": "Unknown Tower Ref",
        "last_tower": "Unknown Tower Ref",
        "latitude": None,
        "longitude": None,
        "azimuth_degrees": None,
        "beamwidth_degrees": None,
        "cell_radius_meters": None,
        "location_provenance": "LOCATION UNAVAILABLE",
        "provenance_details": "No cell tower handoff recorded on telecom gateway",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "REVIEW REQUIRED"
    },
    {
        "ref_number": 32218,
        "case_id": "7498",
        "subject_code": "7498 VoLTE",
        "subject_label": "Secondary Subject (Orange)",
        "target_number": "5712747498",
        "recipient_number": "+1 703 555 0224",
        "start_time": "3/2/2026 8:42:13 PM",
        "created_time": "3/2/2026 3:42:12 PM",
        "duration_str": "00:00:15",
        "duration_seconds": 15,
        "direction": "incoming",
        "first_tower": "3102604f161ecb28f",
        "last_tower": "3102604f161ecb28f",
        "latitude": 38.7890,
        "longitude": -77.1230,
        "azimuth_degrees": 180,
        "beamwidth_degrees": 70,
        "cell_radius_meters": 1800,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "REVIEW REQUIRED"
    },
    {
        "ref_number": 31538,
        "case_id": "7498",
        "subject_code": "7498 VoLTE",
        "subject_label": "Secondary Subject (Orange)",
        "target_number": "5712747498",
        "recipient_number": "+1 703 555 0224",
        "start_time": "2/28/2026 6:46:26 PM",
        "created_time": "2/28/2026 1:46:26 PM",
        "duration_str": "00:00:02",
        "duration_seconds": 2,
        "direction": "outgoing",
        "first_tower": "3102604f161ecb28f",
        "last_tower": "3102604f161ecb28f",
        "latitude": 38.7890,
        "longitude": -77.1230,
        "azimuth_degrees": 180,
        "beamwidth_degrees": 70,
        "cell_radius_meters": 1800,
        "location_provenance": "ESTIMATED AREA",
        "provenance_details": "Cell Sector Azimuth Triangulation via Carrier CDR",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 31434,
        "case_id": "7498",
        "subject_code": "7498 VoLTE",
        "subject_label": "Secondary Subject (Orange)",
        "target_number": "5712747498",
        "recipient_number": "+1 703 555 0831",
        "start_time": "2/25/2026 2:13:31 PM",
        "created_time": "2/25/2026 9:13:31 AM",
        "duration_str": "00:00:14",
        "duration_seconds": 14,
        "direction": "incoming",
        "first_tower": "3102604f160e44704",
        "last_tower": "3102604f160e44704",
        "latitude": 38.8150,
        "longitude": -77.0850,
        "azimuth_degrees": 310,
        "beamwidth_degrees": 60,
        "cell_radius_meters": 950,
        "location_provenance": "VERIFIED LOCATION",
        "provenance_details": "Court-Authorized Law Enforcement Tower Extracted Log",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 31433,
        "case_id": "7498",
        "subject_code": "7498 VoLTE",
        "subject_label": "Secondary Subject (Orange)",
        "target_number": "5712747498",
        "recipient_number": "+1 703 555 0831",
        "start_time": "2/25/2026 2:12:57 PM",
        "created_time": "2/25/2026 9:12:56 AM",
        "duration_str": "00:00:11",
        "duration_seconds": 11,
        "direction": "incoming",
        "first_tower": "3102604f160e44704",
        "last_tower": "3102604f160e44704",
        "latitude": 38.8150,
        "longitude": -77.0850,
        "azimuth_degrees": 310,
        "beamwidth_degrees": 60,
        "cell_radius_meters": 950,
        "location_provenance": "VERIFIED LOCATION",
        "provenance_details": "Court-Authorized Law Enforcement Tower Extracted Log",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    },
    {
        "ref_number": 31432,
        "case_id": "7498",
        "subject_code": "7498 VoLTE",
        "subject_label": "Secondary Subject (Orange)",
        "target_number": "5712747498",
        "recipient_number": "+1 703 555 0831",
        "start_time": "2/25/2026 2:12:28 PM",
        "created_time": "2/25/2026 9:12:28 AM",
        "duration_str": "00:00:16",
        "duration_seconds": 16,
        "direction": "incoming",
        "first_tower": "3102604f160e44704",
        "last_tower": "3102604f160e44704",
        "latitude": 38.8150,
        "longitude": -77.0850,
        "azimuth_degrees": 310,
        "beamwidth_degrees": 60,
        "cell_radius_meters": 950,
        "location_provenance": "VERIFIED LOCATION",
        "provenance_details": "Court-Authorized Law Enforcement Tower Extracted Log",
        "associated_evidence_id": None,
        "associated_case_code": None,
        "voice_authenticity": None,
        "scam_risk": "LOW RISK"
    }
]

def query_calls(
    case_id: Optional[str] = None,
    target_number: Optional[str] = None,
    search: Optional[str] = None,
    center_lat: Optional[float] = None,
    center_lng: Optional[float] = None,
    radius_meters: Optional[float] = None
) -> List[Dict[str, Any]]:
    results = []
    
    for record in CALL_RECORDS_DB:
        rec = dict(record)
        
        # Case filter
        if case_id and rec["case_id"] != case_id:
            continue
            
        # Target number filter
        if target_number and rec["target_number"] != target_number:
            continue
            
        # Text search
        if search:
            s_lower = search.lower()
            target_str = f"{rec['ref_number']} {rec['case_id']} {rec['target_number']} {rec['first_tower']}".lower()
            if s_lower not in target_str:
                continue
                
        # Haversine radius filter
        if center_lat is not None and center_lng is not None and radius_meters is not None:
            if rec["latitude"] is not None and rec["longitude"] is not None:
                dist = haversine_distance_meters(center_lat, center_lng, rec["latitude"], rec["longitude"])
                rec["distance_meters"] = round(dist, 1)
                if dist > radius_meters:
                    continue
            else:
                # Exclude records without coordinates from geographic radius filter
                continue
        elif center_lat is not None and center_lng is not None and rec["latitude"] is not None and rec["longitude"] is not None:
            dist = haversine_distance_meters(center_lat, center_lng, rec["latitude"], rec["longitude"])
            rec["distance_meters"] = round(dist, 1)
            
        results.append(rec)
        
    return results

def get_call_by_ref(ref_number: int) -> Optional[Dict[str, Any]]:
    for record in CALL_RECORDS_DB:
        if record["ref_number"] == ref_number:
            return dict(record)
    return None

def get_call_by_evidence_id(evidence_id: str) -> Optional[Dict[str, Any]]:
    for record in CALL_RECORDS_DB:
        if record.get("associated_evidence_id") == evidence_id:
            return dict(record)
    return None
