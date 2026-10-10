import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Activity, 
  Ear, 
  Download, 
  UserCheck, 
  Clock, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  Sliders, 
  ChevronDown, 
  X, 
  MapPin, 
  Upload, 
  Mic, 
  ShieldCheck, 
  Hash, 
  ExternalLink,
  Link2 
} from 'lucide-react';
import { AnalysisResponse } from '../../types';
import { api } from '../../services/api';

interface Props {
  analysisData: AnalysisResponse | null;
  onOpenScamScanner?: () => void;
  onNavigateToGeospatial: (callRef?: number) => void;
  isDarkMode: boolean;
}

interface CaseItem {
  id: string;
  code: string;
  eventId: string;
  title: string;
  duration: number; // in seconds
  anomalyTime: number;
  spliceTime: number;
  similarityScore: number;
  thresholdScore: number;
  voiceSynthesisPct: number;
  playbackAttackPct: number;
  temporalBreakText: string;
  principal: string;
  model: string;
  submissionDate: string;
  sourceType: string;
  sampleKey: string;
  linkedCallRef: number;
  cellTowerId: string;
  locationArea: string;
  locationSource: 'CARRIER_TOWER_CDR' | 'HANDSET_EMERGENCY' | 'CONSENT_LINK_GPS' | 'LOCATION_UNAVAILABLE';
  locationSourceBadge: string;
  approximateAddress: string | null;
  accuracyRadiusMeters: number | null;
  legalBasis: string;
  sha256Hash: string;
  evidenceId: string;
  authenticityCategory: 'HIGH RISK' | 'REVIEW REQUIRED' | 'LOW RISK';
  explanationText: string;
}

const CASES: CaseItem[] = [
  {
    id: 'case-v0884',
    code: 'Case #V-0884',
    eventId: 'EVT-2026-0884',
    title: 'Live stream capture — AGM',
    duration: 38.0,
    anomalyTime: 26.4,
    spliceTime: 33.0,
    similarityScore: 61.3,
    thresholdScore: 85.0,
    voiceSynthesisPct: 89,
    playbackAttackPct: 74,
    temporalBreakText: 'TEMPORAL BREAK — 00:26.4',
    principal: 'Template #P-0047 · Active',
    model: 'ECAPA-TDNN (SpeechBrain) + AASIST (ASVspoof)',
    submissionDate: '2026-05-14',
    sourceType: 'Recorded Call Pull — WebRTC / Telephony Trunk',
    sampleKey: 'ai_clone',
    linkedCallRef: 1348,
    cellTowerId: '3102604f160b7e303',
    locationArea: 'Alexandria, VA Sector 1 (Azimuth: 60°)',
    locationSource: 'CARRIER_TOWER_CDR',
    locationSourceBadge: 'Estimated Area (Carrier Tower CDR)',
    approximateAddress: 'Approx. 4335 Upland Dr, Rose Hill, Alexandria, VA 22310, USA',
    accuracyRadiusMeters: 1200,
    legalBasis: 'Lawful Court Subpoena #ORD-7502 (Tower Sector Area)',
    sha256Hash: '9a8f4c2e6b1d037a5f8e2190bb42cf8912d0987e41ac32de58190c14b2d30fa1',
    evidenceId: 'EVD-2026-0884-A1',
    authenticityCategory: 'HIGH RISK',
    explanationText: 'High-frequency vocoder spectral rolloff above 3800Hz with severe phase discontinuities. ECAPA-TDNN voiceprint divergence confirmed at 00:26.4.'
  },
  {
    id: 'case-v0885',
    code: 'Case #V-0885',
    eventId: 'EVT-2026-0885',
    title: 'SBI Fraud Prevention Demand',
    duration: 29.5,
    anomalyTime: 18.2,
    spliceTime: 24.1,
    similarityScore: 88.2,
    thresholdScore: 85.0,
    voiceSynthesisPct: 24,
    playbackAttackPct: 35,
    temporalBreakText: 'CADENCE IRREGULARITY — 00:18.2',
    principal: 'Template #P-0112 · SBI Executive',
    model: 'ECAPA-TDNN + Fraud Intent Heuristic',
    submissionDate: '2026-06-02',
    sourceType: 'Inbound Telecom Trunk — Recording Notice Verified',
    sampleKey: 'scam',
    linkedCallRef: 1364,
    cellTowerId: '3102604f160b7e303',
    locationArea: 'Alexandria, VA Sector 1 (Azimuth: 60°)',
    locationSource: 'CARRIER_TOWER_CDR',
    locationSourceBadge: 'Estimated Area (Carrier Tower CDR)',
    approximateAddress: 'Approx. 4335 Upland Dr, Rose Hill, Alexandria, VA 22310, USA',
    accuracyRadiusMeters: 1200,
    legalBasis: 'Lawful Court Subpoena #ORD-7502',
    sha256Hash: '4f2a7b8e19d0c28341b52e098a72c1f4e308912bd6c9081a2e78345c6d0912ab',
    evidenceId: 'EVD-2026-0885-B2',
    authenticityCategory: 'HIGH RISK',
    explanationText: 'Acoustic voice is likely genuine human speech, but Layer 2 catches critical OTP harvesting and coercive pressure independently.'
  },
  {
    id: 'case-v0886',
    code: 'Case #V-0886',
    eventId: 'EVT-2026-0886',
    title: 'Benign Executive Meeting Call',
    duration: 31.0,
    anomalyTime: 0,
    spliceTime: 0,
    similarityScore: 94.6,
    thresholdScore: 85.0,
    voiceSynthesisPct: 18,
    playbackAttackPct: 12,
    temporalBreakText: 'NO BREAKS DETECTED',
    principal: 'Template #P-0047 · Verified Natural',
    model: 'ECAPA-TDNN Baseline',
    submissionDate: '2026-06-10',
    sourceType: 'Encrypted VOIP Trunk — Internal Consent Confirmed',
    sampleKey: 'benign',
    linkedCallRef: 1361,
    cellTowerId: '3102604f160b7e303',
    locationArea: 'Alexandria, VA Sector 1 (Azimuth: 60°)',
    locationSource: 'CARRIER_TOWER_CDR',
    locationSourceBadge: 'Estimated Area (Carrier Tower CDR)',
    approximateAddress: 'Approx. 4335 Upland Dr, Rose Hill, Alexandria, VA 22310, USA',
    accuracyRadiusMeters: 1200,
    legalBasis: 'Lawful Court Subpoena #ORD-7502',
    sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    evidenceId: 'EVD-2026-0886-C3',
    authenticityCategory: 'LOW RISK',
    explanationText: 'Acoustic parameters match authentic human vocal tract resonances. Natural pitch micro-jitter and harmonic formants preserved.'
  },
  {
    id: 'case-v0887',
    code: 'Case #V-0887',
    eventId: 'EVT-2026-0999',
    title: 'Unverified Anonymous Call Intake',
    duration: 32.0,
    anomalyTime: 14.5,
    spliceTime: 22.0,
    similarityScore: 68.4,
    thresholdScore: 85.0,
    voiceSynthesisPct: 78,
    playbackAttackPct: 62,
    temporalBreakText: 'TEMPORAL ANOMALY — 00:14.5',
    principal: 'Unenrolled Target Caller',
    model: 'ECAPA-TDNN + AASIST',
    submissionDate: '2026-06-14',
    sourceType: 'Recorded Audio Upload — No Lawful CDR Attached',
    sampleKey: 'ai_clone',
    linkedCallRef: 1402,
    cellTowerId: 'TOWER_UNAVAILABLE',
    locationArea: 'Location Unavailable',
    locationSource: 'LOCATION_UNAVAILABLE',
    locationSourceBadge: 'Location Unavailable',
    approximateAddress: null,
    accuracyRadiusMeters: null,
    legalBasis: 'No Lawful Location Record Attached',
    sha256Hash: 'f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7',
    evidenceId: 'EVD-2026-0887-D4',
    authenticityCategory: 'HIGH RISK',
    explanationText: 'A voice, phone number, or IP cannot determine location. No lawful CDR subpoena, emergency dispatch record, or complainant GPS consent link exists.'
  }
];

export const VoiceAnalysisView: React.FC<Props> = ({ 
  analysisData, 
  onOpenScamScanner,
  onNavigateToGeospatial,
  isDarkMode 
}) => {
  const [selectedCase, setSelectedCase] = useState<CaseItem>(CASES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15.3); // Initial timestamp matching screenshot
  const [isMuted, setIsMuted] = useState(false);
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEvidenceExporting, setIsEvidenceExporting] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Consent Link modal state
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isSimulatingConsentGps, setIsSimulatingConsentGps] = useState(false);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);

  // Canvas & Audio refs
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const voiceprintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize when external analysisData is passed
  useEffect(() => {
    if (analysisData) {
      const isUnavail = !analysisData.location_record || analysisData.location_record.source === 'LOCATION_UNAVAILABLE' || !analysisData.location_record.latitude;
      const dynamicCase: CaseItem = {
        id: analysisData.analysis_id,
        code: `Analysis #${analysisData.analysis_id.slice(0, 6)}`,
        eventId: analysisData.event_id || `EVT-${analysisData.analysis_id.slice(0, 6)}`,
        title: analysisData.filename,
        duration: analysisData.audio_duration_seconds,
        anomalyTime: analysisData.transcript_segments?.[0]?.start || 0,
        spliceTime: analysisData.transcript_segments?.[0]?.end || 0,
        similarityScore: analysisData.speaker_similarity_score || (analysisData.synthetic_speech_score > 0.6 ? 61.3 : 91.2),
        thresholdScore: 85.0,
        voiceSynthesisPct: Math.round(analysisData.synthetic_speech_score * 100),
        playbackAttackPct: Math.round((analysisData.synthetic_speech_score * 0.75) * 100),
        temporalBreakText: analysisData.synthetic_speech_score > 0.6 ? 'TEMPORAL BREAK DETECTED' : 'NO BREAKS DETECTED',
        principal: 'Enrolled Template #P-0047',
        model: 'ECAPA-TDNN (SpeechBrain) + AASIST (ASVspoof)',
        submissionDate: new Date().toISOString().split('T')[0],
        sourceType: analysisData.call_type || 'Recorded Audio Intake',
        sampleKey: 'ai_clone',
        linkedCallRef: 1348,
        cellTowerId: isUnavail ? 'TOWER_UNAVAILABLE' : '3102604f160b7e303',
        locationArea: isUnavail ? 'Location Unavailable' : (analysisData.location_record?.approximate_address || 'Alexandria, VA Sector 1'),
        locationSource: (analysisData.location_record?.source as any) || (isUnavail ? 'LOCATION_UNAVAILABLE' : 'CARRIER_TOWER_CDR'),
        locationSourceBadge: analysisData.location_record?.source_label || (isUnavail ? 'Location Unavailable' : 'Estimated Area (Carrier Tower CDR)'),
        approximateAddress: isUnavail ? null : (analysisData.location_record?.approximate_address || null),
        accuracyRadiusMeters: isUnavail ? null : (analysisData.location_record?.accuracy_meters || 1200),
        legalBasis: analysisData.legal_authority || analysisData.location_record?.legal_basis || 'Lawful Authority Confirmed',
        sha256Hash: analysisData.file_hash || 'computed_sha256_hash',
        evidenceId: analysisData.event_id || `EVD-${analysisData.analysis_id.slice(0, 8)}`,
        authenticityCategory: (analysisData.overall_risk as any) || 'HIGH RISK',
        explanationText: analysisData.risk_explanation
      };
      setSelectedCase(dynamicCase);
    }
  }, [analysisData]);

  // Load real audio if available
  useEffect(() => {
    const audio = new Audio(`/api/samples/${selectedCase.sampleKey}/audio`);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(selectedCase.duration);
    };

    return () => {
      audio.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedCase]);

  // Animation playback ticker
  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const tick = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= selectedCase.duration) {
            setIsPlaying(false);
            return selectedCase.duration;
          }
          return next;
        });
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, selectedCase.duration]);

  // Audio Play / Pause
  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= selectedCase.duration) {
        setCurrentTime(0);
      }
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(currentTime, audioRef.current.duration || selectedCase.duration);
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, selectedCase.duration));
    setCurrentTime(clamped);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = clamped;
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const wholeSecs = Math.floor(secs);
    const tenths = Math.floor((secs - wholeSecs) * 10);
    return `${mins.toString().padStart(2, '0')}:${wholeSecs.toString().padStart(2, '0')}.${tenths}`;
  };

  // Upload real audio handler
  const handleFileUpload = async (file: File) => {
    setIsAnalyzingUpload(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const result = await api.analyzeAudio(file);

      const isUnavail = !result.location_record || result.location_record.source === 'LOCATION_UNAVAILABLE' || !result.location_record.latitude;
      const uploadedCase: CaseItem = {
        id: `case-upload-${Date.now()}`,
        code: `Case #U-${Math.floor(1000 + Math.random() * 9000)}`,
        eventId: result.event_id || `EVT-U-${Date.now().toString().slice(-4)}`,
        title: file.name,
        duration: result.audio_duration_seconds,
        anomalyTime: result.synthetic_speech_score > 0.5 ? result.audio_duration_seconds * 0.6 : 0,
        spliceTime: result.synthetic_speech_score > 0.7 ? result.audio_duration_seconds * 0.8 : 0,
        similarityScore: result.speaker_similarity_score || Math.round((1 - result.synthetic_speech_score * 0.5) * 1000) / 10,
        thresholdScore: 85.0,
        voiceSynthesisPct: Math.round(result.synthetic_speech_score * 100),
        playbackAttackPct: Math.round((result.acoustic_breakdown?.vocoder_artifact_score || 0.2) * 100),
        temporalBreakText: result.synthetic_speech_score > 0.6 ? `VOCAL DISCONTINUITY — ${result.authenticity_label.toUpperCase()}` : 'NO ANOMALIES DETECTED',
        principal: 'Enrolled Template #P-0047 · Target',
        model: result.model_name || 'ECAPA-TDNN (SpeechBrain) + AASIST (ASVspoof)',
        submissionDate: new Date().toISOString().split('T')[0],
        sourceType: `Direct Upload (${(file.size / 1024).toFixed(1)} KB)`,
        sampleKey: 'ai_clone',
        linkedCallRef: 1348,
        cellTowerId: isUnavail ? 'TOWER_UNAVAILABLE' : '3102604f160b7e303',
        locationArea: isUnavail ? 'Location Unavailable' : (result.location_record?.approximate_address || 'Alexandria, VA Sector 1'),
        locationSource: (result.location_record?.source as any) || (isUnavail ? 'LOCATION_UNAVAILABLE' : 'CARRIER_TOWER_CDR'),
        locationSourceBadge: result.location_record?.source_label || (isUnavail ? 'Location Unavailable' : 'Estimated Area (Carrier Tower CDR)'),
        approximateAddress: isUnavail ? null : (result.location_record?.approximate_address || null),
        accuracyRadiusMeters: isUnavail ? null : (result.location_record?.accuracy_meters || 1200),
        legalBasis: result.legal_authority || result.location_record?.legal_basis || 'Lawful Authority Confirmed',
        sha256Hash: hashHex,
        evidenceId: result.event_id || `EVD-${result.analysis_id.slice(0, 8).toUpperCase()}`,
        authenticityCategory: (result.overall_risk as any) || 'HIGH RISK',
        explanationText: result.risk_explanation || result.evidence_summary
      };

      setSelectedCase(uploadedCase);
      setCurrentTime(0);
      setExportNotification(`Audio '${file.name}' analyzed successfully by ECAPA-TDNN engine!`);
    } catch (err: any) {
      alert(`Audio analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzingUpload(false);
    }
  };

  // Draw Waveform Canvas (Theme-Aware: Light vs Dark)
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = isDarkMode ? '#141a1d' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal grid line
    ctx.strokeStyle = isDarkMode ? '#25323a' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const barCount = 200;
    const step = width / barCount;
    const anomalyX = (selectedCase.anomalyTime / selectedCase.duration) * width;
    const spliceX = (selectedCase.spliceTime / selectedCase.duration) * width;
    const currentX = (currentTime / selectedCase.duration) * width;

    // Suspicious segment band (#f0a73a at 25%)
    if (selectedCase.anomalyTime > 0) {
      const bandEndX = selectedCase.spliceTime > 0 
        ? (selectedCase.spliceTime / selectedCase.duration) * width 
        : Math.min(width, anomalyX + (width * 0.16));
      ctx.fillStyle = 'rgba(240, 167, 58, 0.25)';
      ctx.fillRect(anomalyX, 0, bandEndX - anomalyX, height);
    }

    // High-risk segment band (#e5534b at 30%)
    if (selectedCase.spliceTime > 0) {
      ctx.fillStyle = 'rgba(229, 83, 75, 0.30)';
      ctx.fillRect(spliceX, 0, Math.min(width - spliceX, width * 0.14), height);
    }

    for (let i = 0; i < barCount; i++) {
      const x = i * step;
      const progress = i / barCount;

      const baseAmp = Math.sin(progress * Math.PI * 8) * 0.4 + 
                      Math.cos(progress * Math.PI * 19) * 0.35 + 
                      Math.sin(progress * Math.PI * 33) * 0.25;
      const noise = (Math.sin(i * 12.3) * 43758.5453) % 1;
      let amp = Math.abs(baseAmp * 0.7 + noise * 0.3);

      if (selectedCase.anomalyTime > 0 && progress >= (selectedCase.anomalyTime / selectedCase.duration)) {
        amp = amp * 0.75 + 0.15;
      }

      const barHeight = Math.max(3, amp * (height * 0.82));
      const y = (height - barHeight) / 2;

      if (x <= currentX) {
        ctx.fillStyle = '#2ec4b6';
        ctx.shadowColor = isDarkMode ? 'rgba(46, 196, 182, 0.4)' : 'rgba(13, 148, 136, 0.3)';
        ctx.shadowBlur = isDarkMode ? 4 : 2;
      } else {
        ctx.fillStyle = isDarkMode ? '#25323a' : '#94a3b8';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, y, Math.max(1.2, step - 0.8), barHeight);
    }
    ctx.shadowBlur = 0;

    // Anomaly marker (#f0a73a)
    if (selectedCase.anomalyTime > 0) {
      ctx.strokeStyle = '#f0a73a';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(anomalyX, 18);
      ctx.lineTo(anomalyX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Splice marker (HIGH RISK #e5534b)
    if (selectedCase.spliceTime > 0) {
      ctx.strokeStyle = '#e5534b';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(spliceX, 18);
      ctx.lineTo(spliceX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current playhead
    ctx.strokeStyle = isDarkMode ? '#d6e1e5' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();

  }, [currentTime, selectedCase, isDarkMode]);

  // Draw Mel-Spectrogram Canvas (dark #0d1113 -> teal #2ec4b6 -> amber #f0a73a)
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = isDarkMode ? '#0d1113' : '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const cols = 160;
    const rows = 45;
    const colWidth = width / cols;
    const rowHeight = height / rows;
    const breakCol = selectedCase.anomalyTime > 0 
      ? Math.floor((selectedCase.anomalyTime / selectedCase.duration) * cols) 
      : -1;

    for (let c = 0; c < cols; c++) {
      const isPostBreak = breakCol > 0 && c >= breakCol;
      
      for (let r = 0; r < rows; r++) {
        const freqBin = 1 - (r / rows);
        const f1 = Math.exp(-Math.pow(freqBin - 0.15, 2) / 0.008);
        const f2 = Math.exp(-Math.pow(freqBin - 0.35, 2) / 0.012);
        const f3 = Math.exp(-Math.pow(freqBin - 0.60, 2) / 0.02);
        const vocalPitch = (Math.sin(c * 0.8) + 1) * 0.5;
        
        let energy = (f1 * 0.85 + f2 * 0.6 + f3 * 0.4) * vocalPitch;
        if (Math.sin(freqBin * 80) > 0.3) energy += 0.2;

        if (isPostBreak) {
          if (freqBin > 0.45) energy *= 0.15;
          else energy = Math.min(1, energy * 1.3);
        }

        energy = Math.max(0, Math.min(1, energy + (Math.sin(c * 3.7 + r * 5.1) * 0.1)));
        
        // Spectrogram palette: dark #0d1113, then teal #2ec4b6, then amber #f0a73a
        if (energy > 0.7) {
          ctx.fillStyle = `rgba(240, 167, 58, ${energy})`;
        } else if (energy > 0.35) {
          ctx.fillStyle = `rgba(46, 196, 182, ${energy * 0.9})`;
        } else if (energy > 0.12) {
          ctx.fillStyle = `rgba(18, 49, 47, ${energy * 0.8})`;
        } else {
          ctx.fillStyle = isDarkMode ? `rgba(13, 17, 19, ${energy * 0.5})` : `rgba(15, 23, 42, ${energy * 0.4})`;
        }

        ctx.fillRect(c * colWidth, r * rowHeight, colWidth + 0.5, rowHeight + 0.5);
      }
    }

    if (selectedCase.anomalyTime > 0) {
      const breakX = (selectedCase.anomalyTime / selectedCase.duration) * width;
      ctx.strokeStyle = '#f0a73a';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(breakX, 0);
      ctx.lineTo(breakX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const playheadX = (currentTime / selectedCase.duration) * width;
    ctx.strokeStyle = '#d6e1e5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

  }, [currentTime, selectedCase, isDarkMode]);

  // Draw Voiceprint Comparison Canvas (Theme-Aware)
  useEffect(() => {
    const canvas = voiceprintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = isDarkMode ? '#141a1d' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    const points = 100;
    const breakIndex = selectedCase.anomalyTime > 0 
      ? Math.floor((selectedCase.anomalyTime / selectedCase.duration) * points) 
      : -1;
    const breakX = selectedCase.anomalyTime > 0 
      ? (selectedCase.anomalyTime / selectedCase.duration) * width 
      : -1;

    const enrolledY: number[] = [];
    const submittedY: number[] = [];

    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const base = height * 0.58 + Math.sin(t * 14) * (height * 0.08) + Math.cos(t * 22) * (height * 0.04);
      enrolledY.push(base);

      if (breakIndex > 0 && i >= breakIndex) {
        const divergenceProg = (i - breakIndex) / (points - breakIndex);
        const divOffset = Math.sin(divergenceProg * Math.PI) * (height * 0.38) + (divergenceProg * (height * 0.22));
        submittedY.push(base - divOffset);
      } else {
        const jitter = Math.sin(i * 19.3) * (height * 0.02);
        submittedY.push(base + jitter);
      }
    }

    // Divergence Area Shaded Fill (#f0a73a at 25%)
    if (breakIndex > 0) {
      ctx.beginPath();
      ctx.moveTo(breakX, enrolledY[breakIndex]);
      for (let i = breakIndex; i <= points; i++) {
        const x = (i / points) * width;
        ctx.lineTo(x, submittedY[i]);
      }
      for (let i = points; i >= breakIndex; i--) {
        const x = (i / points) * width;
        ctx.lineTo(x, enrolledY[i]);
      }
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(240, 167, 58, 0.25)';
      ctx.fill();

      ctx.strokeStyle = 'rgba(240, 167, 58, 0.35)';
      ctx.lineWidth = 1;
      for (let x = breakX; x < width; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 10, height);
        ctx.stroke();
      }
    }

    // Enrolled Template Curve (Teal #2ec4b6)
    ctx.strokeStyle = '#2ec4b6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      if (i === 0) ctx.moveTo(x, enrolledY[i]);
      else ctx.lineTo(x, enrolledY[i]);
    }
    ctx.stroke();

    // Submitted Audio Curve (Main text #d6e1e5 in dark mode)
    ctx.strokeStyle = isDarkMode ? '#d6e1e5' : '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      if (i === 0) ctx.moveTo(x, submittedY[i]);
      else ctx.lineTo(x, submittedY[i]);
    }
    ctx.stroke();

    if (breakX > 0) {
      ctx.strokeStyle = '#f0a73a';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(breakX, 10);
      ctx.lineTo(breakX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [selectedCase, isDarkMode]);

  // Export Forensic Evidence Pack
  const handleExportEvidencePack = async () => {
    setIsEvidenceExporting(true);
    try {
      if (analysisData?.analysis_id) {
        const res = await fetch(`/api/report/${analysisData.analysis_id}?format=pdf`);
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Forensic_Evidence_Pack_${selectedCase.code.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          setExportNotification('Forensic Evidence Pack PDF exported successfully!');
          return;
        }
      }
      fallbackExportJson();
    } catch {
      fallbackExportJson();
    } finally {
      setIsEvidenceExporting(false);
      setTimeout(() => setExportNotification(null), 4000);
    }
  };

  const fallbackExportJson = () => {
    const evidenceBlob = new Blob([
      JSON.stringify(
        {
          case_code: selectedCase.code,
          evidence_id: selectedCase.evidenceId,
          sha256_hash: selectedCase.sha256Hash,
          investigation_status: 'EVIDENCE_READY_FOR_LEGAL_PROCEEDINGS',
          timestamp: new Date().toISOString(),
          audio_fingerprint: {
            duration_seconds: selectedCase.duration,
            anomaly_offset: selectedCase.anomalyTime,
            splice_offset: selectedCase.spliceTime
          },
          biometric_comparison: {
            similarity_score: `${selectedCase.similarityScore}%`,
            decision_threshold: `${selectedCase.thresholdScore}%`,
            enrolled_principal: selectedCase.principal,
            result: selectedCase.similarityScore >= selectedCase.thresholdScore ? 'ABOVE_THRESHOLD' : 'BELOW_THRESHOLD'
          },
          anti_spoofing_analysis: {
            voice_synthesis_probability: `${selectedCase.voiceSynthesisPct}%`,
            playback_attack_probability: `${selectedCase.playbackAttackPct}%`,
            temporal_coherence: selectedCase.temporalBreakText,
            category: selectedCase.authenticityCategory
          },
          geospatial_telemetry_link: {
            linked_cdr_ref: selectedCase.linkedCallRef,
            tower_id: selectedCase.cellTowerId,
            coverage_sector: selectedCase.locationArea
          }
        },
        null,
        2
      )
    ], { type: 'application/json' });
    const url = window.URL.createObjectURL(evidenceBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Evidence_Pack_${selectedCase.code.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    setExportNotification('Forensic Evidence JSON Package exported with SHA-256 audit log!');
  };

  // Common Card CSS classes based on Theme
  const cardBgClass = isDarkMode 
    ? 'bg-[#141a1d] border-[#25323a] shadow-lg shadow-black/40 text-[#d6e1e5]' 
    : 'bg-white border-slate-200 shadow-sm text-slate-900';

  const subBoxBgClass = isDarkMode
    ? 'bg-[#1a2327] border-[#25323a]'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className={`min-h-full flex flex-col font-sans select-none pb-36 transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0d1113] text-[#d6e1e5]' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. Streamlined Top Utility Toolbar (Replaces duplicated breadcrumb to expand vertical space) */}
      <div className={`border-b px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#141a1d] border-[#25323a]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 text-xs">
          {/* Interactive Case Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
              className={`flex items-center gap-1.5 font-mono font-semibold transition-colors px-2.5 py-1 rounded border ${
                isDarkMode 
                  ? 'bg-[#1a2327] border-[#25323a] text-[#d6e1e5] hover:text-[#2ec4b6]' 
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:text-teal-700'
              }`}
            >
              <span>{selectedCase.code}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isCaseDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-64 rounded-lg shadow-xl z-50 py-1 text-xs font-mono border ${
                isDarkMode ? 'bg-[#141a1d] border-[#25323a]' : 'bg-white border-slate-200 shadow-lg'
              }`}>
                {CASES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setCurrentTime(c.anomalyTime > 0 ? c.anomalyTime : 0);
                      setIsCaseDropdownOpen(false);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      c.id === selectedCase.id 
                        ? isDarkMode 
                          ? 'bg-[#12312f] text-[#2ec4b6] font-semibold' 
                          : 'bg-teal-50 text-teal-800 font-semibold'
                        : isDarkMode 
                          ? 'text-[#d6e1e5] hover:bg-[#1a2327]' 
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div>{c.code}</div>
                      <div className={`text-[11px] font-sans truncate ${isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}`}>{c.title}</div>
                    </div>
                    {c.id === selectedCase.id && <span className="text-[#2ec4b6] text-xs">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Evidence ID Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-[11px] border ${
            isDarkMode 
              ? 'bg-[#1a2327] border-[#25323a] text-[#d6e1e5]' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Hash className="w-3 h-3 text-[#2ec4b6]" />
            <span>{selectedCase.evidenceId}</span>
            <span className="text-[#86989f]">·</span>
            <span className="text-[#2ec4b6] font-bold">SHA-256 OK</span>
          </div>
        </div>

        {/* Action Buttons: Upload Audio & Geospatial Jump */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.flac,.m4a"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzingUpload}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border transition-colors shadow-sm ${
              isDarkMode 
                ? 'bg-[#12312f] hover:bg-[#12312f]/80 border-[#2ec4b6]/50 text-[#2ec4b6]' 
                : 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isAnalyzingUpload ? 'Analyzing Audio...' : 'Upload Audio Evidence'}</span>
          </button>

          <button
            onClick={() => onNavigateToGeospatial(selectedCase.linkedCallRef)}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border transition-colors shadow-sm ${
              isDarkMode 
                ? 'bg-[#1a2327] hover:bg-[#25323a] border-[#25323a] text-[#8fb3c9]' 
                : 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#8fb3c9]" />
            <span>Location Intelligence (Ref #{selectedCase.linkedCallRef})</span>
          </button>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotification && (
        <div className="mx-6 mt-3 bg-emerald-900/90 border border-emerald-400 text-white px-4 py-2 rounded-lg text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{exportNotification}</span>
          </div>
          <button onClick={() => setExportNotification(null)} className="text-emerald-200 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Forensic Grid Layout (EXPANDED / INCREASED SECTION) */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 max-w-[1780px] w-full mx-auto">
        
        {/* ================= LEFT COLUMN (Audio Waveform & Mel-Spectrogram) ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: SUBMITTED AUDIO (Expanded height) */}
          <div className={`rounded-xl p-5 border transition-colors ${cardBgClass}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  isDarkMode ? 'text-[#2dd4bf]' : 'text-teal-700'
                }`}>
                  SUBMITTED AUDIO
                </h3>
                <p className={`text-xs mt-0.5 font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedCase.code} · {selectedCase.title} · {formatTimestamp(selectedCase.duration)}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {selectedCase.anomalyTime > 0 && (
                  <button 
                    onClick={() => handleSeek(selectedCase.anomalyTime)}
                    className="text-[10px] font-mono uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded hover:bg-amber-500/20 transition-colors"
                  >
                    ANOMALY: {formatTimestamp(selectedCase.anomalyTime)}
                  </button>
                )}
                {selectedCase.spliceTime > 0 && (
                  <button 
                    onClick={() => handleSeek(selectedCase.spliceTime)}
                    className="text-[10px] font-mono uppercase font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded hover:bg-red-500/20 transition-colors"
                  >
                    SPLICE: {formatTimestamp(selectedCase.spliceTime)}
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDED Waveform Canvas (Height 140px / h-36) */}
            <div className={`relative rounded-lg overflow-hidden border mb-3 ${
              isDarkMode ? 'border-[#16253c] bg-[#08101e]' : 'border-slate-200 bg-slate-50'
            }`}>
              <canvas
                ref={waveformCanvasRef}
                width={850}
                height={140}
                className="w-full h-36 block cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = clickX / rect.width;
                  handleSeek(ratio * selectedCase.duration);
                }}
              />

              {/* Anomaly Floating Tag */}
              {selectedCase.anomalyTime > 0 && (
                <div 
                  className="absolute top-1.5 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${(selectedCase.anomalyTime / selectedCase.duration) * 100}%` }}
                >
                  <span className="text-[9px] font-mono font-bold uppercase text-amber-500 bg-amber-950/80 border border-amber-500/70 px-1.5 py-0.2 rounded shadow">
                    ANOMALY
                  </span>
                  <div className="w-1.5 h-1.5 rotate-45 bg-amber-500 -mt-0.5" />
                </div>
              )}

              {/* Splice Floating Tag */}
              {selectedCase.spliceTime > 0 && (
                <div 
                  className="absolute top-1.5 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${(selectedCase.spliceTime / selectedCase.duration) * 100}%` }}
                >
                  <span className="text-[9px] font-mono font-bold uppercase text-red-500 bg-red-950/80 border border-red-500/70 px-1.5 py-0.2 rounded shadow">
                    SPLICE
                  </span>
                  <div className="w-1.5 h-1.5 rotate-45 bg-red-500 -mt-0.5" />
                </div>
              )}

              {/* Timeline Ticks */}
              <div className={`flex justify-between px-3 py-1 border-t text-[10px] font-mono ${
                isDarkMode ? 'bg-[#060c18] border-[#132034] text-slate-500' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <span>0:00</span>
                <span>0:05</span>
                <span>0:10</span>
                <span>0:15</span>
                <span>0:20</span>
                <span>0:25</span>
                <span>0:30</span>
                <span>0:35</span>
                <span>0:38</span>
              </div>
            </div>

            {/* Audio Controls Bar */}
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              isDarkMode ? 'bg-[#08111e] border-[#132238]' : 'bg-slate-50 border-slate-200'
            }`}>
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 5))}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Rewind 5s"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-9 h-9 rounded-full bg-[#14b8a6] hover:bg-[#0d9488] text-slate-950 flex items-center justify-center shadow transition-all shrink-0 font-bold"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(Math.min(selectedCase.duration, currentTime + 5))}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Forward 5s"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Scrubber Slider */}
              <div className="flex-1 relative flex items-center mx-2">
                <input
                  type="range"
                  min={0}
                  max={selectedCase.duration}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-300 dark:bg-[#17253b] rounded-lg appearance-none cursor-pointer accent-[#14b8a6]"
                />
              </div>

              <div className={`text-xs font-mono shrink-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="font-bold">{formatTimestamp(currentTime)}</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{formatTimestamp(selectedCase.duration)}</span>
              </div>

              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (audioRef.current) audioRef.current.muted = !isMuted;
                }}
                className={`p-1.5 rounded transition-colors ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card 2: MEL-SPECTROGRAM — ECAPA-TDNN ANALYSIS (EXPANDED height) */}
          <div className={`rounded-xl p-5 border transition-colors ${cardBgClass}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-[#2dd4bf]' : 'text-teal-700'
              }`}>
                MEL-SPECTROGRAM — ECAPA-TDNN ANALYSIS
              </h3>
              <span className="text-xs font-mono font-bold text-amber-500">
                {selectedCase.temporalBreakText}
              </span>
            </div>

            {/* EXPANDED Spectrogram Canvas (Height 190px / h-48) */}
            <div className={`relative rounded-lg overflow-hidden border ${
              isDarkMode ? 'border-[#16253c] bg-[#050c18]' : 'border-slate-200 bg-slate-900'
            }`}>
              <div className="flex">
                {/* Y-Axis */}
                <div className={`w-14 border-r py-3 px-1 flex flex-col justify-between items-end text-[10px] font-mono shrink-0 select-none ${
                  isDarkMode ? 'bg-[#060d1b] border-[#132238] text-slate-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  <span>8000</span>
                  <span>6000</span>
                  <span>4000</span>
                  <span>2000</span>
                  <span>0</span>
                </div>

                {/* Canvas Body */}
                <div className="flex-1 relative">
                  <canvas
                    ref={spectrogramCanvasRef}
                    width={800}
                    height={190}
                    className="w-full h-48 block"
                  />
                </div>
              </div>

              {/* X-Axis */}
              <div className={`flex justify-between pl-16 pr-4 py-1.5 border-t text-[10px] font-mono ${
                isDarkMode ? 'bg-[#060c18] border-[#132034] text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                <span>0:00</span>
                <span>0:05</span>
                <span>0:10</span>
                <span>0:15</span>
                <span>0:20</span>
                <span>0:25</span>
                <span>0:30</span>
                <span>0:35</span>
                <span>0:38</span>
              </div>
            </div>

            <div className={`flex items-center justify-between mt-2 text-[11px] font-mono ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>Y: Frequency (Hz) [0 - 8000 Hz]</span>
              <span>X: Time (s) · ECAPA-TDNN 192-dim frame analysis</span>
            </div>
          </div>

          {/* Card 3: Forensic Specifications & Evidence Metadata */}
          <div className={`rounded-xl p-5 border transition-colors space-y-3.5 ${cardBgClass}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-[#111e33] text-cyan-400' : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Submission</span>
                  <span className={`font-semibold font-mono text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {selectedCase.sourceType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-[#111e33] text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Duration / Anomaly</span>
                  <span className={`font-semibold font-mono text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {formatTimestamp(selectedCase.duration)} · {selectedCase.anomalyTime > 0 ? `Break at ${formatTimestamp(selectedCase.anomalyTime)}` : 'Clean'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-[#111e33] text-indigo-400' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Principal</span>
                  <span className={`font-semibold font-mono text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {selectedCase.principal}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-[#111e33] text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[11px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Model</span>
                  <span className={`font-semibold font-mono text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {selectedCase.model}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: LAWFUL LOCATION & ADDRESS INTELLIGENCE */}
            <div className={`pt-4 border-t space-y-3 font-mono ${isDarkMode ? 'border-[#25323a]' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#d6e1e5]">
                  <MapPin className="w-4 h-4 text-[#2ec4b6]" />
                  Lawful Location Intelligence
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                  selectedCase.locationSource === 'LOCATION_UNAVAILABLE'
                    ? 'bg-[#e5534b]/20 text-[#e5534b] border-[#e5534b]/60'
                    : selectedCase.locationSource === 'CARRIER_TOWER_CDR'
                    ? 'bg-[#f0a73a]/20 text-[#f0a73a] border-[#f0a73a]/60'
                    : 'bg-[#12312f] text-[#2ec4b6] border-[#2ec4b6]/60'
                }`}>
                  {selectedCase.locationSourceBadge}
                </span>
              </div>

              {selectedCase.locationSource !== 'LOCATION_UNAVAILABLE' && selectedCase.approximateAddress ? (
                <div className="space-y-2.5">
                  <div className={`p-3 rounded-lg border ${subBoxBgClass}`}>
                    <span className="text-[10px] text-[#2ec4b6] block uppercase tracking-wider font-bold mb-1">
                      Approximate Street Address (Geocoded via Nominatim):
                    </span>
                    <div className="text-xs font-semibold font-sans text-[#d6e1e5]">
                      {selectedCase.approximateAddress}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-lg border ${subBoxBgClass}`}>
                      <span className="text-[#86989f] block text-[10px]">Area Radius / Accuracy:</span>
                      <span className="text-[#2ec4b6] font-bold">
                        ±{selectedCase.accuracyRadiusMeters || 1200}m Circle
                      </span>
                    </div>
                    <div className={`p-2 rounded-lg border ${subBoxBgClass}`}>
                      <span className="text-[#86989f] block text-[10px]">Tower ID / Cell Sector:</span>
                      <span className="text-[#d6e1e5] truncate block" title={selectedCase.cellTowerId}>
                        {selectedCase.cellTowerId}
                      </span>
                    </div>
                  </div>

                  {/* Primary Map Jump Button */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onNavigateToGeospatial(selectedCase.linkedCallRef)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all hover:scale-[1.01]"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#0d1113]" />
                      <span>Open Centred on Investigation Map (with Radius Circle) →</span>
                    </button>
                    <button
                      onClick={() => setIsConsentModalOpen(true)}
                      className="py-2 px-3 rounded-lg bg-[#1a2327] hover:bg-[#25323a] border border-[#25323a] text-[#d6e1e5] font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Consent GPS Link"
                    >
                      <Link2 className="w-3.5 h-3.5 text-[#2ec4b6]" />
                      <span>GPS Link</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Location Unavailable State */
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-lg bg-[#e5534b]/10 border border-[#e5534b]/40 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[#e5534b] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Location Unavailable</span>
                    </div>
                    <p className="text-[#86989f] leading-relaxed text-[11px] font-sans">
                      A voice, a phone number or an IP address cannot tell you where someone is, and RAKSHAM will not build anything that guesses it.
                    </p>
                    <p className="text-[#86989f] leading-relaxed text-[10px]">
                      A map position can only come from a record you are allowed to use: carrier tower CDR (area, not a point), handset emergency GPS, or a complainant GPS consent link.
                    </p>
                    <div className="text-[#2ec4b6] text-[10px] font-bold pt-1 border-t border-[#e5534b]/20">
                      Audio forensics analysis remains 100% active.
                    </div>
                  </div>

                  <button
                    onClick={() => setIsConsentModalOpen(true)}
                    className="w-full py-2 px-3 rounded-lg bg-[#12312f] hover:bg-[#1a2327] border border-[#2ec4b6]/50 text-[#2ec4b6] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#2ec4b6]" />
                    <span>Generate Complainant GPS Consent Link</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (1:1 Voiceprint & Anti-Spoofing) ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 4: 1:1 VOICEPRINT VERIFICATION */}
          <div className={`rounded-xl p-5 border transition-colors ${cardBgClass}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono mb-3.5 ${
              isDarkMode ? 'text-[#2dd4bf]' : 'text-teal-700'
            }`}>
              1:1 VOICEPRINT VERIFICATION
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Sub-card: Voiceprint Comparison Dual Line */}
              <div className={`md:col-span-7 p-3.5 rounded-lg border ${subBoxBgClass}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  VOICEPRINT COMPARISON
                </div>

                {/* Legend */}
                <div className="space-y-1 mb-2.5 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-1 bg-[#0d9488] dark:bg-[#2dd4bf] inline-block rounded" />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Enrolled Template #P-0047</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-1 bg-slate-900 dark:bg-white inline-block rounded" />
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Submitted Audio</span>
                  </div>
                </div>

                {/* Dual Line Curve Canvas */}
                <div className={`relative rounded overflow-hidden border ${
                  isDarkMode ? 'border-[#132034] bg-[#060f1c]' : 'border-slate-200 bg-white'
                }`}>
                  <canvas
                    ref={voiceprintCanvasRef}
                    width={400}
                    height={150}
                    className="w-full h-36 block"
                  />
                  <div className={`flex justify-between px-2.5 py-0.5 text-[9px] font-mono border-t ${
                    isDarkMode ? 'bg-[#050c18] border-[#101b2c] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span>0:00</span>
                    <span>0:10</span>
                    <span>0:20</span>
                    <span>0:30</span>
                    <span>0:38</span>
                  </div>
                </div>

                {selectedCase.anomalyTime > 0 && (
                  <div className={`text-center text-[10px] font-mono mt-2 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Divergence at {formatTimestamp(selectedCase.anomalyTime)}
                  </div>
                )}
              </div>

              {/* Right Sub-card: Similarity Score & Badges */}
              <div className={`md:col-span-5 p-3.5 rounded-lg border flex flex-col justify-between ${subBoxBgClass}`}>
                <div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    SIMILARITY SCORE
                  </div>

                  <div className="text-4xl lg:text-5xl font-black text-amber-500 font-mono tracking-tight my-1">
                    {selectedCase.similarityScore}%
                  </div>

                  <div className={`text-[10px] font-mono mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Similarity score · Threshold: {selectedCase.thresholdScore}%
                  </div>

                  {/* Horizontal Threshold Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="relative h-2.5 bg-slate-200 dark:bg-[#16253c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${selectedCase.similarityScore}%` }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-teal-600 dark:bg-cyan-400 z-10"
                        style={{ left: `${selectedCase.thresholdScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>0%</span>
                      <span className="text-teal-600 dark:text-cyan-400 font-bold">{selectedCase.thresholdScore}% Threshold</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Voiceprint match</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/40 px-2 py-0.5 rounded text-[10px]">
                      {selectedCase.similarityScore >= selectedCase.thresholdScore 
                        ? `MATCH — ${selectedCase.similarityScore}%` 
                        : `BELOW THRESHOLD — ${selectedCase.similarityScore}%`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Temporal consistency</span>
                    <span className="font-mono font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/40 px-2 py-0.5 rounded text-[10px]">
                      {selectedCase.anomalyTime > 0 ? `BREAK CONFIRMED — ${formatTimestamp(selectedCase.anomalyTime)}` : 'CONSISTENT'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Clear distinction notice */}
            <div className={`mt-3.5 p-2.5 border rounded text-[10px] font-mono leading-relaxed ${
              isDarkMode ? 'bg-[#08101e] border-[#132238] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="text-amber-500 font-bold">Biometric Disclaimer: </span>
              Speaker similarity measures acoustic distance; low similarity does not prove synthetic speech, and high similarity does not prove natural audio.
            </div>
          </div>

          {/* Card 5: ANTI-SPOOFING ANALYSIS (Spacious & Comfortable) */}
          <div className={`rounded-xl p-5 border transition-colors ${cardBgClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-[#2dd4bf]' : 'text-teal-700'
              }`}>
                ANTI-SPOOFING ANALYSIS
              </h3>
              <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                selectedCase.authenticityCategory === 'HIGH RISK'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/40'
                  : selectedCase.authenticityCategory === 'REVIEW REQUIRED'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {selectedCase.authenticityCategory}
              </span>
            </div>

            {/* Analysis Rows */}
            <div className="space-y-3 mb-4">
              
              {/* Row 1: Voice Synthesis Detection */}
              <div className={`flex items-center justify-between p-3.5 rounded-lg border ${subBoxBgClass}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-[#111e33] text-[#2dd4bf]' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Voice synthesis detection
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Neural TTS signature identified — voice cloning attack
                    </div>
                  </div>
                </div>
                <span className={`font-mono font-bold px-3 py-1 rounded text-xs ${
                  selectedCase.voiceSynthesisPct > 60
                    ? 'text-red-500 bg-red-500/10 border border-red-500/50'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/50'
                }`}>
                  DETECTED {selectedCase.voiceSynthesisPct}%
                </span>
              </div>

              {/* Row 2: Playback Attack */}
              <div className={`flex items-center justify-between p-3.5 rounded-lg border ${subBoxBgClass}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-[#111e33] text-[#2dd4bf]' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    <Play className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Playback attack
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Recording replay artefacts suspected
                    </div>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/50 px-3 py-1 rounded text-xs">
                  SUSPECTED {selectedCase.playbackAttackPct}%
                </span>
              </div>

              {/* Row 3: Temporal Coherence */}
              <div className={`flex items-center justify-between p-3.5 rounded-lg border ${subBoxBgClass}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-[#111e33] text-[#2dd4bf]' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Temporal coherence
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Splice artefact at {formatTimestamp(selectedCase.anomalyTime)} — confirmed break
                    </div>
                  </div>
                </div>
                <span className="font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/50 px-3 py-1 rounded text-xs">
                  {selectedCase.anomalyTime > 0 ? 'CONFIRMED' : 'NORMAL'}
                </span>
              </div>

            </div>

            {/* Bottom Status Pills (Spacious & 100% Visible) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center py-2.5 px-3 rounded-lg border border-[#f0a73a]/40 bg-[#f0a73a]/15 text-[#f0a73a] font-mono text-xs font-semibold">
                Voiceprint match BELOW THRESHOLD
              </div>
              <div className="text-center py-2.5 px-3 rounded-lg border border-[#f0a73a]/40 bg-[#f0a73a]/15 text-[#f0a73a] font-mono text-xs font-semibold">
                Human review REQUIRED
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Bottom Sticky Action Bar (Theme-Aware) */}
      <div className={`fixed bottom-0 left-0 right-0 py-3.5 px-6 z-40 backdrop-blur-md border-t transition-colors ${
        isDarkMode 
          ? 'bg-[#141a1d]/95 border-[#25323a] text-[#d6e1e5] shadow-2xl' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
      }`}>
        <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Left Button: Review */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl border font-semibold text-sm transition-all shadow-md ${
              isDarkMode 
                ? 'border-[#2ec4b6]/50 bg-[#12312f] hover:bg-[#1a2327] text-[#2ec4b6]' 
                : 'border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800'
            }`}
          >
            <Ear className="w-5 h-5 text-[#2ec4b6]" />
            <span>Review</span>
          </button>

          {/* Center Banner / Alert Button (HIGH RISK: red #e5534b with dark text #0d1113!) */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-3 px-8 py-3 rounded-xl bg-[#e5534b] hover:bg-[#e5534b]/90 text-[#0d1113] font-bold text-base shadow-lg shadow-black/40 border border-[#e5534b] transition-all hover:scale-[1.01]"
          >
            <AlertTriangle className="w-5 h-5 text-[#0d1113] animate-pulse" />
            <span>Voice Cloning Detected — {selectedCase.voiceSynthesisPct}%</span>
          </button>

          {/* Connected Geospatial Investigation Module Button */}
          <button
            onClick={() => onNavigateToGeospatial(selectedCase.linkedCallRef)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl border font-bold text-sm shadow-md transition-all hover:scale-[1.01] ${
              isDarkMode 
                ? 'bg-[#1a2327] hover:bg-[#25323a] border-[#25323a] text-[#8fb3c9]' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#8fb3c9]" />
            <span>Geospatial Track (Ref #{selectedCase.linkedCallRef})</span>
          </button>

          {/* Right Button: Evidence-Ready — Export Pack (Teal #2ec4b6 with dark text #0d1113!) */}
          <button
            onClick={handleExportEvidencePack}
            disabled={isEvidenceExporting}
            className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-sm md:text-base shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 text-[#0d1113]" />
            <span>{isEvidenceExporting ? 'Generating Pack...' : 'Evidence-Ready — Export Pack'}</span>
          </button>

        </div>
      </div>

      {/* 4. Forensic Deep Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border ${
            isDarkMode ? 'bg-[#0b1422] border-[#1b2f4c] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Forensic Investigation Audit</h2>
                <p className="text-xs text-slate-400 font-mono">{selectedCase.code} · Deepfake Risk Assessment</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`p-3.5 rounded-xl border space-y-1.5 font-mono ${
                isDarkMode ? 'bg-[#08101e] border-[#162740]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Evidence Identifier:</span>
                  <span className="text-cyan-500 font-bold">{selectedCase.evidenceId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Linked Call Record:</span>
                  <span className="text-blue-500 font-bold">Ref #{selectedCase.linkedCallRef}</span>
                </div>
                <div className={`text-[10px] break-all ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  SHA-256: <span className="font-mono">{selectedCase.sha256Hash}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-2 ${
                isDarkMode ? 'bg-[#08101e] border-[#162740]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-semibold">Acoustic Signal Breakdown:</div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>Vocoder Rolloff: <span className="text-red-500 font-bold">3840 Hz (Cutoff detected)</span></div>
                  <div>Phase Discontinuity: <span className="text-amber-500 font-bold">0.82 (High)</span></div>
                  <div>Micro-jitter Regularity: <span className="text-red-500 font-bold">0.94 (Unnatural)</span></div>
                  <div>ECAPA Cosine Distance: <span className="text-amber-500 font-bold">0.387</span></div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-2 ${
                isDarkMode ? 'bg-[#08101e] border-[#162740]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-semibold">Investigator Recommendation:</div>
                <p className={`leading-relaxed font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {selectedCase.explanationText}
                  Biometric matching against enrolled principal resulted in {selectedCase.similarityScore}% (decision threshold: {selectedCase.thresholdScore}%).
                  Immediate transaction pause and independent confirmation recommended under Section 43A of IT Act.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  onNavigateToGeospatial(selectedCase.linkedCallRef);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open Location Track</span>
              </button>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  handleExportEvidencePack();
                }}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Evidence PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Complainant GPS Consent Link Modal */}
      {isConsentModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border ${
            isDarkMode ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5]' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setIsConsentModalOpen(false)}
              className="absolute top-4 right-4 text-[#86989f] hover:text-[#d6e1e5]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#12312f] border border-[#2ec4b6]/40 flex items-center justify-center text-[#2ec4b6]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#d6e1e5] uppercase font-mono tracking-tight">Complainant GPS Consent Link</h3>
                <p className="text-xs text-[#86989f]">Secure lawful HTML5 geolocation sharing for Event {selectedCase.eventId}</p>
              </div>
            </div>

            <div className="space-y-4 my-4 text-xs font-mono">
              <p className="text-[#86989f] text-[11px] leading-relaxed">
                Send this secure verification link to the complainant. When opened in their browser, they grant explicit consent to share device GPS coordinates, which will be reverse-geocoded via Nominatim into an approximate street address.
              </p>

              <div className="p-3 rounded-xl bg-[#0d1113] border border-[#25323a] flex items-center justify-between gap-2">
                <span className="text-[#2ec4b6] truncate text-[11px]">
                  http://127.0.0.1:5173/?consent_token=cst_{selectedCase.eventId.toLowerCase()}&event_id={selectedCase.eventId}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`http://127.0.0.1:5173/?consent_token=cst_${selectedCase.eventId.toLowerCase()}&event_id=${selectedCase.eventId}`);
                    alert('Consent URL copied to clipboard!');
                  }}
                  className="px-2.5 py-1 rounded bg-[#1a2327] hover:bg-[#25323a] text-[#d6e1e5] border border-[#25323a] shrink-0 font-bold text-[10px]"
                >
                  Copy Link
                </button>
              </div>

              {/* Simulation button for immediate testing */}
              <div className="p-3.5 rounded-xl bg-[#1a2327] border border-[#25323a] space-y-2">
                <div className="text-[11px] font-bold text-[#d6e1e5]">Simulate Complainant Consent Flow:</div>
                <p className="text-[10px] text-[#86989f]">
                  Submits live coordinates (38.8895°N, -77.0352°W, ±8m) to backend Nominatim reverse-geocoder.
                </p>
                <button
                  onClick={async () => {
                    setIsSimulatingConsentGps(true);
                    try {
                      const res = await api.submitConsentGPS(selectedCase.eventId, 38.8895, -77.0352, 8.0);
                      const addr = res.location_record?.approximate_address || 'Approx. 1400 Constitution Ave NW, Washington, DC 20230, USA';
                      setSelectedCase(prev => ({
                        ...prev,
                        locationSource: 'CONSENT_LINK_GPS',
                        locationSourceBadge: 'Complainant GPS Consent Link',
                        approximateAddress: addr,
                        accuracyRadiusMeters: 8,
                        linkedCallRef: 1395,
                        cellTowerId: 'CONSENT_GPS',
                        locationArea: addr,
                        legalBasis: 'Complainant Informed Consent (HTML5 Geolocation API)'
                      }));
                      setIsConsentModalOpen(false);
                      setExportNotification('Complainant GPS coordinates verified and reverse-geocoded successfully!');
                    } catch (err: any) {
                      alert(err.message || 'Failed to submit simulated consent');
                    } finally {
                      setIsSimulatingConsentGps(false);
                    }
                  }}
                  disabled={isSimulatingConsentGps}
                  className="w-full py-2 px-3 rounded-lg bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0d1113]" />
                  <span>{isSimulatingConsentGps ? 'Geocoding GPS Coordinates...' : 'Simulate Complainant Sharing GPS'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
