import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Share2, 
  Clock, 
  Cpu, 
  Info, 
  CheckCircle2, 
  XCircle,
  FileDown,
  MapPin,
  Hash
} from 'lucide-react';
import { AnalysisResponse } from '../types';
import { api } from '../services/api';

interface Props {
  data: AnalysisResponse | null;
  isAnalyzing: boolean;
  onOpenShareModal: () => void;
  onNavigateToMap?: () => void;
}

export const RiskAssessmentPanel: React.FC<Props> = ({
  data,
  isAnalyzing,
  onOpenShareModal,
  onNavigateToMap,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleSaveReport = async () => {
    if (!data) return;
    try {
      setIsExportingPdf(true);
      await api.downloadPdfReport(data.analysis_id, `VoiceGuard_Report_${data.filename.replace(/\.[^/.]+$/, "")}.pdf`);
    } catch (err) {
      alert("Error generating PDF report. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="w-full lg:w-96 shrink-0 bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2ec4b6] animate-ping" />
          <span className="text-xs font-mono font-bold text-[#2ec4b6]">ANALYZING 2-4s CHUNKS...</span>
        </div>
        <div className="h-6 bg-[#1a2327] rounded w-32 animate-pulse"></div>
        <div className="h-28 bg-[#1a2327] rounded-xl animate-pulse"></div>
        <div className="h-40 bg-[#1a2327] rounded-xl animate-pulse"></div>
        <div className="h-32 bg-[#1a2327] rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full lg:w-96 shrink-0 bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md flex flex-col justify-between space-y-5">
        <div>
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#25323a]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ec4b6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2ec4b6]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d6e1e5] font-mono">
                Engine Ready
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/40">
              STANDBY
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-[#d6e1e5] tracking-tight">
              Awaiting Call Intake
            </h3>
            <p className="text-xs text-[#86989f] mt-1 leading-relaxed">
              Upload an audio evidence recording or start a live microphone stream to initiate real-time inspection.
            </p>
          </div>

          {/* Stepper Breakdown */}
          <div className="mt-5 space-y-3">
            <div className="p-3 rounded-xl bg-[#0d1113] border border-[#25323a]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2ec4b6]">
                <span className="w-4 h-4 rounded-full bg-[#12312f] border border-[#2ec4b6]/60 text-[10px] flex items-center justify-center text-[#2ec4b6] font-mono">1</span>
                <span>Layer 1: ECAPA-TDNN & AASIST</span>
              </div>
              <p className="text-[11px] text-[#86989f] mt-1 pl-6 leading-relaxed">
                Extracts 192-dim speaker embeddings and neural vocoder artifacts (&gt;3.8 kHz) to detect voice cloning.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0d1113] border border-[#25323a]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#f0a73a]">
                <span className="w-4 h-4 rounded-full bg-[#f0a73a]/20 border border-[#f0a73a]/60 text-[10px] flex items-center justify-center text-[#f0a73a] font-mono">2</span>
                <span>Layer 2: Scam Intent Extraction</span>
              </div>
              <p className="text-[11px] text-[#86989f] mt-1 pl-6 leading-relaxed">
                Scans transcript for OTP harvesting, artificial urgency, account freeze coercion, and remote access apps.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0d1113] border border-[#25323a]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8fb3c9]">
                <span className="w-4 h-4 rounded-full bg-[#8fb3c9]/20 border border-[#8fb3c9]/60 text-[10px] flex items-center justify-center text-[#8fb3c9] font-mono">3</span>
                <span>Layer 3: Lawful Geocoded Location</span>
              </div>
              <p className="text-[11px] text-[#86989f] mt-1 pl-6 leading-relaxed">
                Links authorized carrier tower CDR area or complainant consent GPS with reverse-geocoded street address.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Specs */}
        <div className="pt-3 border-t border-[#25323a] text-[11px] text-[#86989f] space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span>Risk Categories:</span>
            <span className="text-[#2ec4b6] font-bold">LOW · REVIEW · HIGH</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span>Sampling Window:</span>
            <span className="text-[#d6e1e5]">2 to 4 Second Chunks</span>
          </div>
        </div>
      </div>
    );
  }

  const isHighRisk = data.overall_risk === 'HIGH RISK';
  const isReview = data.overall_risk === 'REVIEW REQUIRED' || data.overall_risk === 'VERIFY';

  const riskCardStyles = isHighRisk
    ? 'bg-[#e5534b]/15 border border-[#e5534b]/50'
    : isReview
    ? 'bg-[#f0a73a]/15 border border-[#f0a73a]/50'
    : 'bg-[#12312f]/40 border border-[#2ec4b6]/50';

  const riskBadgeStyles = isHighRisk
    ? 'bg-[#e5534b] text-[#0d1113] font-bold'
    : isReview
    ? 'bg-[#f0a73a] text-[#0d1113] font-bold'
    : 'bg-[#2ec4b6] text-[#0d1113] font-bold';

  const RiskIcon = isHighRisk ? ShieldAlert : isReview ? AlertTriangle : ShieldCheck;

  return (
    <div className="w-full lg:w-96 shrink-0 bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md space-y-5 font-sans">
      {/* Panel Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#25323a]">
        <div className="flex items-center gap-2">
          <RiskIcon className={`w-4 h-4 ${isHighRisk ? 'text-[#e5534b]' : isReview ? 'text-[#f0a73a]' : 'text-[#2ec4b6]'}`} />
          <h2 className="text-sm font-bold text-[#d6e1e5] tracking-tight uppercase">Risk Assessment</h2>
        </div>
        <span className="text-[10px] font-mono text-[#86989f]">
          {data.event_id || data.analysis_id.slice(0, 8)}
        </span>
      </div>

      {/* Prominent Risk Status Box */}
      <div className={`rounded-xl p-4 border text-center relative overflow-hidden ${riskCardStyles}`}>
        <div className="flex flex-col items-center gap-2">
          <span className={`text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider ${riskBadgeStyles}`}>
            {data.overall_risk}
          </span>
          <p className="text-xs font-medium text-[#d6e1e5] mt-1 leading-snug">
            {data.risk_explanation}
          </p>
        </div>
      </div>

      {/* Lawful Location Intelligence Box */}
      {data.location_record && (
        <div className="p-3 rounded-xl bg-[#0d1113] border border-[#25323a] text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#86989f] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2ec4b6]" />
              Lawful Location
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
              data.location_record.source === 'LOCATION_UNAVAILABLE'
                ? 'bg-[#e5534b]/20 text-[#e5534b] border border-[#e5534b]/50'
                : 'bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/50'
            }`}>
              {data.location_record.source_label}
            </span>
          </div>

          {data.location_record.approximate_address ? (
            <div className="text-[11px] text-[#d6e1e5] font-sans">
              {data.location_record.approximate_address}
            </div>
          ) : (
            <div className="text-[10px] text-[#86989f]">
              No authorized location record attached. Audio forensics remains operational.
            </div>
          )}

          {data.location_record.accuracy_meters && (
            <div className="text-[10px] text-[#86989f]">
              Radius: ±{data.location_record.accuracy_meters}m
            </div>
          )}
        </div>
      )}

      {/* Evidence Summary */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-bold font-mono text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#2ec4b6]" />
          Forensic Evidence Summary
        </h3>
        <p className="text-xs text-[#d6e1e5] bg-[#0d1113] p-3 rounded-xl border border-[#25323a] leading-relaxed">
          {data.evidence_summary}
        </p>
      </div>

      {/* Recommended Action */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold font-mono text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#2ec4b6]" />
          Recommended Action
        </h3>
        <div className="space-y-2">
          {data.recommended_actions.map((act, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#86989f] leading-relaxed">
              <span className="text-[#2ec4b6] font-bold text-sm leading-none shrink-0">•</span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Details */}
      <div className="bg-[#0d1113] rounded-xl p-3.5 border border-[#25323a] space-y-2 text-[11px] font-mono">
        <div className="flex items-center justify-between text-[#86989f]">
          <span>Speaker Similarity:</span>
          <span className="text-[#2ec4b6]">{data.speaker_similarity_model || 'ECAPA-TDNN'}</span>
        </div>
        <div className="flex items-center justify-between text-[#86989f]">
          <span>Anti-Spoofing:</span>
          <span className="text-[#d6e1e5]">{data.anti_spoofing_model || 'AASIST'}</span>
        </div>
        <div className="flex items-center justify-between text-[#86989f]">
          <span>Audio Duration:</span>
          <span className="text-[#d6e1e5]">{data.audio_duration_seconds.toFixed(1)}s</span>
        </div>
      </div>

      {/* Save & Share Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleSaveReport}
          disabled={isExportingPdf}
          className="w-full py-2.5 px-3 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow disabled:opacity-50"
        >
          {isExportingPdf ? (
            <span className="animate-spin text-xs">⌛</span>
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Save Report</span>
        </button>

        <button
          onClick={onOpenShareModal}
          className="w-full py-2.5 px-3 rounded-xl bg-[#1a2327] hover:bg-[#25323a] text-[#d6e1e5] border border-[#25323a] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-[#2ec4b6]" />
          <span>Share Report</span>
        </button>
      </div>
    </div>
  );
};
