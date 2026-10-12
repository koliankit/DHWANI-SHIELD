export interface TranscriptSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  has_scam_flag?: boolean;
  flagged_terms: string[];
  is_suspicious?: boolean;
  flagged_keywords?: string[];
}

export interface ScamIndicator {
  id: string;
  name: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidence_phrase: string;
  explanation: string;
  timestamp_offset?: number;
  keyword?: string;
  confidence?: number;
  description?: string;
}

export interface AcousticBreakdown {
  spectral_centroid_hz: number;
  spectral_flatness: number;
  high_frequency_ratio?: number;
  vocoder_artifact_score?: number;
  pitch_jitter_variance?: number;
  phase_discontinuity_index?: number;
  rolloff_hz?: number;
  jitter_local?: number;
  shimmer_local?: number;
  snr_db?: number;
}

export interface LocationRecord {
  source: 'CARRIER_TOWER_CDR' | 'HANDSET_EMERGENCY' | 'CONSENT_LINK_GPS' | 'LOCATION_UNAVAILABLE' | string;
  source_label: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy_meters?: number | null;
  azimuth_degrees?: number | null;
  beamwidth_degrees?: number | null;
  approximate_address?: string | null;
  timestamp: string;
  provenance_details: string;
  legal_basis: string;
  consent_token?: string | null;
}

export interface AnalysisResponse {
  analysis_id: string;
  case_code?: string;
  event_id: string;
  file_hash: string;
  call_type?: string;
  legal_authority?: string;
  filename: string;
  file_size_bytes: number;
  audio_duration_seconds: number;
  sample_rate: number;
  channels: number;
  waveform_data: number[];
  
  // Voice Authenticity Models: ECAPA-TDNN & AASIST / RawNet2
  speaker_enrolled?: boolean;
  speaker_similarity_model?: string;
  speaker_similarity_score?: number;
  speaker_similarity_threshold?: number;
  voiceprint_status?: 'MATCHING' | 'DIVERGENT' | 'REVIEW REQUIRED' | string;

  anti_spoofing_model?: string;
  anti_spoofing_score?: number;
  synthetic_speech_score: number;
  authenticity_label: 'LIKELY SYNTHETIC' | 'LIKELY GENUINE' | 'REVIEW REQUIRED' | string;
  authenticity_confidence: number;
  uncertainty_pct: number;
  acoustic_breakdown: AcousticBreakdown;

  // Transcription
  transcript_text: string;
  transcript_segments: TranscriptSegment[];

  // Scam Indicators
  scam_indicators_count: number;
  scam_indicators: ScamIndicator[];

  // Lawful Location Record
  location_record?: LocationRecord | null;

  // Strict 3-Tier Risk
  overall_risk: 'LOW RISK' | 'REVIEW REQUIRED' | 'HIGH RISK' | string;
  risk_color: 'teal' | 'amber' | 'red' | string;
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
  event_id?: string;
  file_hash?: string;
  filename: string;
  audio_duration_seconds: number;
  synthetic_speech_score: number;
  authenticity_label: string;
  scam_indicators_count: number;
  overall_risk: 'LOW RISK' | 'REVIEW REQUIRED' | 'HIGH RISK' | string;
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
  event_id?: string;
  file_hash?: string;
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
  accuracy_meters?: number | null;
  source_type?: 'CARRIER_TOWER_CDR' | 'HANDSET_EMERGENCY' | 'CONSENT_LINK_GPS' | 'LOCATION_UNAVAILABLE' | string;
  source_badge?: string;
  approximate_address?: string | null;
  location_provenance: 'VERIFIED LOCATION' | 'ESTIMATED AREA' | 'SAMPLE LOCATION' | 'LOCATION UNAVAILABLE' | string;
  provenance_details: string;
  legal_basis?: string;
  associated_evidence_id?: string | null;
  associated_case_code?: string | null;
  voice_authenticity?: string | null;
  scam_risk?: 'LOW RISK' | 'REVIEW REQUIRED' | 'HIGH RISK' | string | null;
  distance_meters?: number | null;
  consent_token?: string | null;
  category?: 'call' | 'sms' | 'mms' | 'device' | 'internet' | 'social_media' | 'subscriber' | 'audit' | string;
  admin_id?: number;
}

export type ActiveNavTab = 'voice_analysis' | 'geospatial' | 'location_map' | 'dashboard' | 'new_analysis' | 'history' | 'models' | 'settings';

export type LocationSource = 'VERIFIED' | 'ESTIMATED' | 'SAMPLE' | 'UNAVAILABLE';

export interface EventRecord {
  id: string;
  case_id: string;
  caller_id: string;
  timestamp: string;
  direction: 'Incoming' | 'Outgoing' | string;
  location_source: LocationSource;
  lat: number | null;
  lng: number | null;
  status: 'Open' | 'Under review' | 'Closed' | string;
  risk_score?: number | null;
  verdict?: 'LOW RISK' | 'REVIEW REQUIRED' | 'HIGH RISK' | string | null;
  is_demo?: boolean;
}

export interface GeocodePlace {
  place_id?: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  addresstype?: string;
  boundingbox: string[];
  geojson?: {
    type: string;
    coordinates: any;
  };
}

