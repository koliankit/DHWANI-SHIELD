import React from 'react';
import { Volume2, AlertOctagon, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface Props {
  data: AnalysisResponse | null;
  isAnalyzing: boolean;
}

export const MetricCards: React.FC<Props> = ({ data, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] animate-pulse space-y-3">
            <div className="h-4 bg-[#1a2327] rounded w-24"></div>
            <div className="h-8 bg-[#1a2327] rounded w-36"></div>
            <div className="h-3 bg-[#1a2327] rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Voice Authenticity Standby */}
        <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#2ec4b6]" />
                Layer 1: Voice Authenticity
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/40">
                STANDBY
              </span>
            </div>
            <div className="text-2xl font-black text-[#d6e1e5] mt-2 font-mono">Awaiting Audio</div>
            <p className="text-xs text-[#86989f] mt-2">
              ECAPA-TDNN neural network primed for synthetic vocoder spectral discontinuities & pitch jitter.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#25323a] text-[11px] font-mono text-[#86989f]">
            Engine: AcousticNet v2.4 (192-dim)
          </div>
        </div>

        {/* Card 2: Scam Indicators Standby */}
        <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-[#f0a73a]" />
                Layer 2: Intent & Scam Flags
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#f0a73a]/15 text-[#f0a73a] border border-[#f0a73a]/40">
                STANDBY
              </span>
            </div>
            <div className="text-2xl font-black text-[#d6e1e5] mt-2 font-mono">0 Active Flags</div>
            <p className="text-xs text-[#86989f] mt-2">
              Conversational NLP heuristics ready to flag OTP requests, simulated bank urgency, and extortion.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#25323a] text-[11px] font-mono text-[#86989f]">
            Rules: FinFraud Semantic Model
          </div>
        </div>

        {/* Card 3: Overall Risk Standby */}
        <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2ec4b6]" />
                Dual-Layer Assessment
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/40">
                READY
              </span>
            </div>
            <div className="text-2xl font-black text-[#d6e1e5] mt-2 font-mono">Ready for Stream</div>
            <p className="text-xs text-[#86989f] mt-2">
              Evaluates acoustic spoofing and fraudulent semantics concurrently upon intake submission.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#25323a] text-[11px] font-mono text-[#86989f]">
            Latency Benchmark: &lt; 25ms
          </div>
        </div>
      </div>
    );
  }

  // Card 1: Voice Authenticity
  const syntheticScorePct = (data.synthetic_speech_score * 100).toFixed(1);
  const isSynthetic = data.synthetic_speech_score >= 0.65 || data.authenticity_label === 'Likely Synthetic';
  const isReal = data.synthetic_speech_score <= 0.35 || data.authenticity_label === 'Likely Real';

  const authColorClass = isSynthetic
    ? 'text-[#e5534b] bg-[#e5534b]/15 border-[#e5534b]/40'
    : isReal
    ? 'text-[#2ec4b6] bg-[#12312f] border-[#2ec4b6]/50'
    : 'text-[#f0a73a] bg-[#f0a73a]/15 border-[#f0a73a]/40';

  // Card 2: Scam Indicators
  const indicatorCount = data.scam_indicators_count;
  const categories = Array.from(new Set(data.scam_indicators.map((i) => i.category)));

  // Card 3: Overall Risk
  const isHighRisk = data.overall_risk === 'HIGH RISK';
  const isVerify = data.overall_risk === 'VERIFY';

  const riskBadgeStyles = isHighRisk
    ? 'bg-[#e5534b]/20 text-[#e5534b] border-[#e5534b]/50'
    : isVerify
    ? 'bg-[#f0a73a]/20 text-[#f0a73a] border-[#f0a73a]/50'
    : 'bg-[#12312f] text-[#2ec4b6] border-[#2ec4b6]/50';

  const RiskIcon = isHighRisk ? ShieldAlert : isVerify ? AlertTriangle : ShieldCheck;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Voice Authenticity */}
      <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md hover:border-[#2ec4b6]/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#2ec4b6]" />
              Voice Authenticity
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${authColorClass}`}>
              {data.authenticity_label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#d6e1e5] font-mono tracking-tight">
              {syntheticScorePct}%
            </span>
            <span className="text-xs text-[#86989f]">Synthetic Speech Score</span>
          </div>

          <p className="text-xs text-[#86989f] mt-2 leading-relaxed">
            Uncertainty: <span className="font-mono text-[#d6e1e5]">±{data.uncertainty_pct}%</span> • Confidence:{' '}
            <span className="font-mono text-[#d6e1e5]">{(data.authenticity_confidence * 100).toFixed(0)}%</span>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#25323a] flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1113] text-[#86989f] border border-[#25323a]">
            Centroid: {data.acoustic_breakdown.spectral_centroid_hz.toFixed(0)} Hz
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1113] text-[#86989f] border border-[#25323a]">
            Flatness: {data.acoustic_breakdown.spectral_flatness.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Card 2: Scam Indicators */}
      <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md hover:border-[#2ec4b6]/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-[#f0a73a]" />
              Scam Indicators
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0d1113] text-[#d6e1e5] border border-[#25323a] font-semibold">
              NLP Engine v3.1
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-[#d6e1e5] font-mono tracking-tight">
              {indicatorCount}
            </span>
            <span className="text-xs text-[#86989f]">Indicators Detected</span>
          </div>

          <p className="text-xs text-[#86989f] mt-2 leading-relaxed">
            {indicatorCount > 0 ? (
              <span>Flagged across {categories.length} predatory threat categories</span>
            ) : (
              <span>No coercive, OTP, or impersonation patterns found</span>
            )}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#25323a] flex items-center gap-1.5 flex-wrap">
          {categories.length > 0 ? (
            categories.slice(0, 2).map((cat, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#f0a73a]/15 text-[#f0a73a] border border-[#f0a73a]/40 truncate max-w-[130px]">
                {cat}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-[#2ec4b6] flex items-center gap-1">
              ✓ Clean Speech Transcript
            </span>
          )}
        </div>
      </div>

      {/* Card 3: Overall Risk */}
      <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md hover:border-[#2ec4b6]/40 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#86989f] uppercase tracking-wider flex items-center gap-1.5">
              <RiskIcon className="w-3.5 h-3.5 text-[#2ec4b6]" />
              Overall Risk
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${riskBadgeStyles}`}>
              {data.overall_risk}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-2xl font-black tracking-tight font-mono ${isHighRisk ? 'text-[#e5534b]' : isVerify ? 'text-[#f0a73a]' : 'text-[#2ec4b6]'}`}>
              {data.overall_risk}
            </span>
          </div>

          <p className="text-xs text-[#d6e1e5] mt-2 leading-relaxed line-clamp-2">
            {data.risk_explanation}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#25323a] flex items-center justify-between text-[11px] text-[#86989f]">
          <span>Defense Advice:</span>
          <span className="font-semibold text-[#d6e1e5] truncate ml-2">
            {isHighRisk ? 'Reject & Do Not Pay' : isVerify ? 'Verify Independent Channel' : 'Normal Vigilance'}
          </span>
        </div>
      </div>
    </div>
  );
};
