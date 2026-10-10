export interface TranscriptSegment {
  id: number;
  start: floatNumber;
  end: floatNumber;
  text: string;
  speaker: string;
  has_scam_flag: boolean;
  flagged_terms: string[];
}

type floatNumber = number;

export interface ScamIndicator {
  id: string;
  name: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidence_phrase: string;
  explanation: string;
  timestamp_offset?: number;
}

export interface AcousticBreakdown {
  spectral_centroid_hz: number;
  spectral_flatness: number;
  high_frequency_ratio: number;
  vocoder_artifact_score: number;
  pitch_jitter_variance: number;
  phase_discontinuity_index: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  filename: string;
  file_size_bytes: number;
  audio_duration_seconds: number;
  sample_rate: number;
  channels: number;
  waveform_data: number[];
  
  // Voice Authenticity
  synthetic_speech_score: number;
  authenticity_label: 'Likely Synthetic' | 'Likely Real' | 'Inconclusive' | string;
  authenticity_confidence: number;
  uncertainty_pct: number;
  acoustic_breakdown: AcousticBreakdown;

  // Transcription
  transcript_text: string;
  transcript_segments: TranscriptSegment[];

  // Scam Indicators
  scam_indicators_count: number;
  scam_indicators: ScamIndicator[];

  // Overall Risk
  overall_risk: 'HIGH RISK' | 'VERIFY' | 'LOW RISK' | string;
  risk_color: 'red' | 'amber' | 'green' | string;
  risk_explanation: string;
  evidence_summary: string;
  voice_model_result: string;
  transcript_analysis_result: string;
  contextual_fraud_assessment: string;
  identity_verification_status: string;
  recommended_actions: string[];
  show_warning?: boolean;
  warning_message?: string;
  warning_reasons?: string[];

  // Metadata
  model_name: string;
  model_version: string;
  stt_engine: string;
  fraud_engine: string;
  processing_duration_ms: number;
  created_at: string;
  warnings: string[];
}

export interface HistoryItem {
  analysis_id: string;
  filename: string;
  audio_duration_seconds: number;
  synthetic_speech_score: number;
  authenticity_label: string;
  scam_indicators_count: number;
  overall_risk: string;
  created_at: string;
}

export interface SystemModelDetail {
  name: string;
  version: string;
  role: string;
  status: string;
  latency_ms: number;
  device: string;
  description: string;
}

export interface SystemStatusResponse {
  status: string;
  backend_version: string;
  uptime_seconds: number;
  database_connected: boolean;
  models: SystemModelDetail[];
  active_analyses_count: number;
}

export interface CallRecord {
  ref_number: number;
  case_id: string;
  subject_code: string;
  subject_label: string;
  target_number: string;
  recipient_number: string;
  start_time: string;
  created_time: string;
  duration_str: string;
  duration_seconds: number;
  direction: 'incoming' | 'outgoing' | string;
  first_tower: string;
  last_tower: string;
  latitude?: number | null;
  longitude?: number | null;
  azimuth_degrees?: number | null;
  beamwidth_degrees?: number | null;
  cell_radius_meters?: number | null;
  location_provenance: 'VERIFIED LOCATION' | 'ESTIMATED AREA' | 'SAMPLE LOCATION' | 'LOCATION UNAVAILABLE' | string;
  provenance_details: string;
  associated_evidence_id?: string | null;
  associated_case_code?: string | null;
  voice_authenticity?: string | null;
  scam_risk?: string | null;
  distance_meters?: number | null;
}

export type ActiveNavTab = 'voice_analysis' | 'geospatial' | 'dashboard' | 'new_analysis' | 'history' | 'models' | 'settings';
