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
  FileDown
} from 'lucide-react';
import { AnalysisResponse } from '../types';
import { api } from '../services/api';

interface Props {
  data: AnalysisResponse | null;
  isAnalyzing: boolean;
  onOpenShareModal: () => void;
}

export const RiskAssessmentPanel: React.FC<Props> = ({
  data,
  isAnalyzing,
  onOpenShareModal,
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

  if (!data || isAnalyzing) {
    return (
      <div className="w-full lg:w-96 shrink-0 bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-4">
        <div className="h-6 bg-bg-surface rounded w-32 animate-pulse"></div>
        <div className="h-28 bg-bg-surface rounded-xl animate-pulse"></div>
        <div className="h-40 bg-bg-surface rounded-xl animate-pulse"></div>
        <div className="h-32 bg-bg-surface rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const isHighRisk = data.overall_risk === 'HIGH RISK';
  const isVerify = data.overall_risk === 'VERIFY';

  const riskCardStyles = isHighRisk
    ? 'bg-rose-950/40 border-rose-800/60 shadow-glow-red'
    : isVerify
    ? 'bg-amber-950/40 border-amber-800/60 shadow-glow-amber'
    : 'bg-emerald-950/40 border-emerald-800/60 shadow-glow-green';

  const riskBadgeStyles = isHighRisk
    ? 'bg-rose-500 text-white'
    : isVerify
    ? 'bg-amber-500 text-slate-950 font-bold'
    : 'bg-emerald-500 text-white font-bold';

  const RiskIcon = isHighRisk ? ShieldAlert : isVerify ? AlertTriangle : ShieldCheck;

  return (
    <div className="w-full lg:w-96 shrink-0 bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-5">
      {/* Panel Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <RiskIcon className={`w-4 h-4 ${isHighRisk ? 'text-rose-400' : isVerify ? 'text-amber-400' : 'text-emerald-400'}`} />
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">Risk Assessment</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">ID: {data.analysis_id.slice(0, 8)}</span>
      </div>

      {/* Prominent Risk Status Box */}
      <div className={`rounded-xl p-4 border text-center relative overflow-hidden ${riskCardStyles}`}>
        <div className="flex flex-col items-center gap-2">
          <span className={`text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider ${riskBadgeStyles}`}>
            {data.overall_risk}
          </span>
          <p className="text-xs font-medium text-slate-200 mt-1 leading-snug">
            {data.risk_explanation}
          </p>
        </div>
      </div>

      {/* Evidence Summary */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Executive Evidence Summary</h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-bg-deep/70 rounded-xl p-3 border border-border-subtle/80">
          {data.evidence_summary}
        </p>
      </div>

      {/* Forensic Breakdown Items */}
      <div className="space-y-2.5 text-xs">
        <div className="bg-bg-deep/60 rounded-xl p-3 border border-border-subtle space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Voice Model Result</span>
            <span className="font-mono text-[10px] text-accent-electric">{data.authenticity_label}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.voice_model_result}</p>
        </div>

        <div className="bg-bg-deep/60 rounded-xl p-3 border border-border-subtle space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Transcript Analysis</span>
            <span className="font-mono text-[10px] text-amber-400">{data.scam_indicators_count} Flags</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">{data.transcript_analysis_result}</p>
        </div>

        <div className="bg-bg-deep/60 rounded-xl p-3 border border-border-subtle space-y-1.5">
          <span className="font-semibold text-slate-300 block">Contextual Fraud Vector</span>
          <p className="text-[11px] text-slate-300 leading-tight">{data.contextual_fraud_assessment}</p>
        </div>

        {/* Identity Verification Disclaimer Notice */}
        <div className="bg-blue-950/30 rounded-xl p-3 border border-blue-900/40 text-[11px] text-blue-200/90 leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-accent-electric shrink-0 mt-0.5" />
          <span>{data.identity_verification_status}</span>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-accent-electric" />
          Recommended Action
        </h3>
        <div className="space-y-2">
          {data.recommended_actions.map((act, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
              <span className="text-accent-electric font-bold text-sm leading-none shrink-0">•</span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Details */}
      <div className="bg-bg-deep/80 rounded-xl p-3.5 border border-border-subtle space-y-2 text-[11px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>Model Architecture:</span>
          <span className="font-mono text-slate-200">{data.model_name} {data.model_version}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Processing Latency:</span>
          <span className="font-mono text-slate-200">{data.processing_duration_ms} ms</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Audio Duration:</span>
          <span className="font-mono text-slate-200">{data.audio_duration_seconds.toFixed(1)}s</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Timestamp:</span>
          <span className="font-mono text-slate-300">{new Date(data.created_at).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Save & Share Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleSaveReport}
          disabled={isExportingPdf}
          className="w-full py-2.5 px-3 rounded-xl bg-accent-blue hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-blue disabled:opacity-50"
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
          className="w-full py-2.5 px-3 rounded-xl bg-bg-surface hover:bg-bg-cardHover text-slate-200 border border-border-subtle font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-accent-electric" />
          <span>Share Report</span>
        </button>
      </div>
    </div>
  );
};
