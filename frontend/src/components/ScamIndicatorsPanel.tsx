import React from 'react';
import { AlertTriangle, Key, Zap, Building2, Send, ShieldCheck, DownloadCloud } from 'lucide-react';
import { ScamIndicator } from '../types';

interface Props {
  indicators: ScamIndicator[];
  isAnalyzing: boolean;
}

export const ScamIndicatorsPanel: React.FC<Props> = ({ indicators, isAnalyzing }) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'credential harvesting':
        return Key;
      case 'psychological manipulation':
        return Zap;
      case 'financial extraction':
        return Send;
      case 'identity deception':
        return Building2;
      case 'device compromise':
        return DownloadCloud;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-[#e5534b]/20 text-[#e5534b] border-[#e5534b]/50';
      case 'MEDIUM':
        return 'bg-[#f0a73a]/20 text-[#f0a73a] border-[#f0a73a]/50';
      default:
        return 'bg-[#12312f] text-[#2ec4b6] border-[#2ec4b6]/50';
    }
  };

  return (
    <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#25323a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f0a73a]/15 border border-[#f0a73a]/30 flex items-center justify-center text-[#f0a73a]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#d6e1e5] tracking-tight flex items-center gap-2">
              Financial Scam Indicators
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                indicators.length > 0 ? 'bg-[#e5534b]/20 text-[#e5534b] border-[#e5534b]/50' : 'bg-[#12312f] text-[#2ec4b6] border-[#2ec4b6]/50'
              }`}>
                {indicators.length} Found
              </span>
            </h3>
            <p className="text-[11px] text-[#86989f]">Pattern matches against financial fraud and coercion heuristics</p>
          </div>
        </div>
      </div>

      {/* Indicator Cards List */}
      <div className="space-y-3">
        {isAnalyzing ? (
          <div className="py-8 text-center text-[#86989f]">
            <p className="text-xs">Evaluating semantic intent & coercion heuristics...</p>
          </div>
        ) : indicators.length > 0 ? (
          indicators.map((ind) => {
            const Icon = getCategoryIcon(ind.category);
            const severityClass = getSeverityBadge(ind.severity);

            return (
              <div
                key={ind.id}
                className="bg-[#0d1113] rounded-xl p-3.5 border border-[#25323a] hover:border-[#2ec4b6]/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-[#1a2327] border border-[#25323a] text-[#d6e1e5]">
                      <Icon className="w-3.5 h-3.5 text-[#f0a73a]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#d6e1e5]">{ind.name}</h4>
                      <span className="text-[10px] text-[#86989f]">{ind.category}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${severityClass}`}>
                    {ind.severity}
                  </span>
                </div>

                {/* Evidence Quote */}
                {ind.evidence_phrase && (
                  <div className="bg-[#1a2327] rounded-lg p-2 border border-[#25323a] text-xs">
                    <span className="text-[10px] font-mono text-[#86989f] block mb-0.5">Evidence Phrase:</span>
                    <span className="text-[#e5534b] font-mono italic text-[11px]">
                      {ind.evidence_phrase}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                <p className="text-[11px] text-[#d6e1e5] leading-relaxed">
                  {ind.explanation}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-[#86989f] space-y-2 border border-dashed border-[#25323a] rounded-xl p-6">
            <ShieldCheck className="w-8 h-8 text-[#2ec4b6] mx-auto" />
            <p className="text-xs font-semibold text-[#d6e1e5]">No Coercive or Fraudulent Indicators Detected</p>
            <p className="text-[11px] text-[#86989f] max-w-sm mx-auto">
              The conversation does not match known OTP theft, imposter emergency, or unauthorized fund transfer heuristics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
