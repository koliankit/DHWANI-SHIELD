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

class AnalysisResponse(BaseModel):
    analysis_id: str
    filename: str
    file_size_bytes: int
    audio_duration_seconds: float
    sample_rate: int
    channels: int
    waveform_data: List[float] = []
    
    # 1. Voice Authenticity
    synthetic_speech_score: float  # 0.0 to 1.0 (e.g. 0.87 -> 87% synthetic)
    authenticity_label: str       # "Likely Synthetic", "Likely Real", "Inconclusive"
    authenticity_confidence: float
    uncertainty_pct: float
    acoustic_breakdown: AcousticBreakdown

    # 2. Transcription
    transcript_text: str
    transcript_segments: List[TranscriptSegment] = []

    # 3. Financial Scam Indicators
    scam_indicators_count: int
    scam_indicators: List[ScamIndicator] = []

    # 4. Overall Risk & Right-Side Assessment Panel
    overall_risk: str              # "HIGH RISK", "VERIFY", "LOW RISK", "INCONCLUSIVE"
    risk_color: str               # "red", "amber", "green"
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

class HistoryItem(BaseModel):
    analysis_id: str
    filename: str
    audio_duration_seconds: float
    synthetic_speech_score: float
    authenticity_label: str
    scam_indicators_count: int
    overall_risk: str
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
