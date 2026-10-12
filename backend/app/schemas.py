from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TranscriptSegment(BaseModel):
    id: int
    start: float
    end: float
    text: str
    speaker: str = "Caller"
    has_scam_flag: bool = False
    flagged_terms: List[str] = []

class ScamIndicator(BaseModel):
    id: str
    name: str
    category: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    evidence_phrase: str
    explanation: str
    timestamp_offset: Optional[float] = None

class AcousticBreakdown(BaseModel):
    spectral_centroid_hz: float
    spectral_flatness: float
    high_frequency_ratio: float
    vocoder_artifact_score: float
    pitch_jitter_variance: float
    phase_discontinuity_index: float

class LocationRecord(BaseModel):
    source: str  # "CARRIER_TOWER_CDR" | "HANDSET_EMERGENCY" | "CONSENT_LINK_GPS" | "LOCATION_UNAVAILABLE"
    source_label: str  # Human-readable title
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy_meters: Optional[float] = None  # Tower area radius (e.g. 1200m), Handset GPS (15m), Consent GPS (8m)
    azimuth_degrees: Optional[int] = None
    beamwidth_degrees: Optional[int] = None
    approximate_address: Optional[str] = None  # Looked up via Nominatim or Geocoding API
    timestamp: str
    provenance_details: str
    legal_basis: str  # Lawful subpoena, E911 emergency dispatch, or Complainant consent
    consent_token: Optional[str] = None

class AnalysisResponse(BaseModel):
    analysis_id: str
    event_id: str  # Stable event identifier (e.g., EVT-2026-0884)
    file_hash: str  # Cryptographic SHA-256 hash of audio file
    call_type: str = "recorded_upload"  # "recorded_upload" | "telephony_pull" | "live_webrtc" | "microphone_test"
    legal_authority: str = "Recording notice / Lawful authority"

    filename: str
    file_size_bytes: int
    audio_duration_seconds: float
    sample_rate: int
    channels: int
    waveform_data: List[float] = []
    
    # 1. Voice Forensics Models: ECAPA-TDNN & AASIST / RawNet2
    speaker_similarity_model: str = "ECAPA-TDNN (SpeechBrain)"
    speaker_similarity_score: float = 61.3  # Cosine similarity % against reference voiceprint
    speaker_similarity_threshold: float = 85.0
    voiceprint_status: str = "DIVERGENT"  # "MATCHING" or "DIVERGENT"

    anti_spoofing_model: str = "AASIST / RawNet2 (ASVspoof 2021)"
    anti_spoofing_score: float = 0.89  # Synthetic speech probability score (0.0 to 1.0)
    synthetic_speech_score: float  # Legacy alias matching anti_spoofing_score
    authenticity_label: str  # "LIKELY SYNTHETIC", "LIKELY GENUINE", "REVIEW REQUIRED"
    authenticity_confidence: float
    uncertainty_pct: float
    acoustic_breakdown: AcousticBreakdown

    # 2. Transcription
    transcript_text: str
    transcript_segments: List[TranscriptSegment] = []

    # 3. Financial Scam Indicators
    scam_indicators_count: int
    scam_indicators: List[ScamIndicator] = []

    # 4. Lawful Location with Approximate Address
    location_record: Optional[LocationRecord] = None

    # 5. Overall Risk (Strict 3-Tier: LOW RISK, REVIEW REQUIRED, HIGH RISK)
    overall_risk: str  # "LOW RISK", "REVIEW REQUIRED", "HIGH RISK"
    risk_color: str   # "teal" (#2ec4b6), "amber" (#f0a73a), "red" (#e5534b)
    risk_explanation: str
    evidence_summary: str
    voice_model_result: str
    transcript_analysis_result: str
    contextual_fraud_assessment: str
    identity_verification_status: str
    recommended_actions: List[str] = []
    
    # Real-Time Warning Alert
    show_warning: bool = False
    warning_message: Optional[str] = None
    warning_reasons: List[str] = []

    # Metadata & Auditing
    model_name: str
    model_version: str
    stt_engine: str
    fraud_engine: str
    processing_duration_ms: float
    created_at: str
    warnings: List[str] = []

class IngestCallRequest(BaseModel):
    event_id: Optional[str] = None
    caller_number: Optional[str] = "+1 571 274 7502"
    recipient_number: Optional[str] = "+1 703 555 0192"
    telephony_provider: str = "Twilio"  # "Twilio", "Exotel", "WebRTC"
    legal_authority: str = "Telephony recording notice & consent banner active"
    cdr_ref: Optional[int] = 1348
    sample_key: Optional[str] = "ai_clone"

class ConsentGPSRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy_meters: float

class HistoryItem(BaseModel):
    analysis_id: str
    event_id: Optional[str] = None
    file_hash: Optional[str] = None
    filename: str
    audio_duration_seconds: float
    synthetic_speech_score: float
    authenticity_label: str
    scam_indicators_count: int
    overall_risk: str  # "LOW RISK", "REVIEW REQUIRED", "HIGH RISK"
    created_at: str

class SystemModelDetail(BaseModel):
    name: str
    version: str
    role: str
    status: str
    latency_ms: float
    device: str
    description: str

class SystemStatusResponse(BaseModel):
    status: str
    backend_version: str
    uptime_seconds: float
    database_connected: bool
    models: List[SystemModelDetail]
    active_analyses_count: int

class EventRecord(BaseModel):
    id: str
    case_id: str
    caller_id: str
    timestamp: str
    direction: str  # "Incoming" | "Outgoing"
    location_source: str  # "VERIFIED" | "ESTIMATED" | "SAMPLE" | "UNAVAILABLE"
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str  # "Open" | "Under review" | "Closed"
    risk_score: Optional[float] = None
    verdict: Optional[str] = None  # "LOW RISK" | "REVIEW REQUIRED" | "HIGH RISK"
    is_demo: bool = True

