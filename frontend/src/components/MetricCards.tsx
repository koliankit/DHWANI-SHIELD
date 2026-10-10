import React from 'react';
import { Volume2, AlertOctagon, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface Props {
  data: AnalysisResponse | null;
  isAnalyzing: boolean;
}

export const MetricCards: React.FC<Props> = ({ data, isAnalyzing }) => {
  if (isAnalyzing || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-card rounded-2xl p-5 border border-border-subtle animate-pulse space-y-3">
            <div className="h-4 bg-bg-surface rounded w-24"></div>
            <div className="h-8 bg-bg-surface rounded w-36"></div>
            <div className="h-3 bg-bg-surface rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Card 1: Voice Authenticity
  const syntheticScorePct = (data.synthetic_speech_score * 100).toFixed(1);
  const isSynthetic = data.synthetic_speech_score >= 0.65 || data.authenticity_label === 'Likely Synthetic';
  const isReal = data.synthetic_speech_score <= 0.35 || data.authenticity_label === 'Likely Real';

  const authColorClass = isSynthetic
    ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
    : isReal
    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
    : 'text-amber-400 bg-amber-950/40 border-amber-800/40';

  // Card 2: Scam Indicators
  const indicatorCount = data.scam_indicators_count;
  const categories = Array.from(new Set(data.scam_indicators.map((i) => i.category)));

  // Card 3: Overall Risk
  const isHighRisk = data.overall_risk === 'HIGH RISK';
  const isVerify = data.overall_risk === 'VERIFY';

  const riskBadgeStyles = isHighRisk
    ? 'bg-rose-950/70 text-rose-400 border-rose-800/60 shadow-glow-red'
    : isVerify
    ? 'bg-amber-950/70 text-amber-400 border-amber-800/60 shadow-glow-amber'
    : 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60 shadow-glow-green';

  const RiskIcon = isHighRisk ? ShieldAlert : isVerify ? AlertTriangle : ShieldCheck;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Voice Authenticity */}
      <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md hover:border-border-active transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-accent-electric" />
              Voice Authenticity
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${authColorClass}`}>
              {data.authenticity_label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {syntheticScorePct}%
            </span>
            <span className="text-xs text-slate-400">Synthetic Speech Score</span>
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Uncertainty: <span className="font-mono text-slate-300">±{data.uncertainty_pct}%</span> • Confidence:{' '}
            <span className="font-mono text-slate-300">{(data.authenticity_confidence * 100).toFixed(0)}%</span>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-deep text-slate-400 border border-border-subtle">
            Centroid: {data.acoustic_breakdown.spectral_centroid_hz.toFixed(0)} Hz
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-deep text-slate-400 border border-border-subtle">
            Flatness: {data.acoustic_breakdown.spectral_flatness.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Card 2: Scam Indicators */}
      <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md hover:border-border-active transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              Scam Indicators
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-deep text-slate-300 border border-border-subtle font-semibold">
              NLP Engine v3.1
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {indicatorCount}
            </span>
            <span className="text-xs text-slate-400">Indicators Detected</span>
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {indicatorCount > 0 ? (
              <span>Flagged across {categories.length} predatory threat categories</span>
            ) : (
              <span>No coercive, OTP, or impersonation patterns found</span>
            )}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center gap-1.5 flex-wrap">
          {categories.length > 0 ? (
            categories.slice(0, 2).map((cat, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 truncate max-w-[130px]">
                {cat}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              ✓ Clean Speech Transcript
            </span>
          )}
        </div>
      </div>

      {/* Card 3: Overall Risk */}
      <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md hover:border-border-active transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <RiskIcon className="w-3.5 h-3.5 text-accent-electric" />
              Overall Risk
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${riskBadgeStyles}`}>
              {data.overall_risk}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-2xl font-black tracking-tight font-mono ${isHighRisk ? 'text-rose-400' : isVerify ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.overall_risk}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">
            {data.risk_explanation}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Defense Advice:</span>
          <span className="font-semibold text-slate-200 truncate ml-2">
            {isHighRisk ? 'Reject & Do Not Pay' : isVerify ? 'Verify Independent Channel' : 'Normal Vigilance'}
          </span>
        </div>
      </div>
    </div>
  );
};
