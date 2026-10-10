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
        return 'bg-rose-950/70 text-rose-400 border-rose-800/60';
      case 'HIGH':
        return 'bg-orange-950/70 text-orange-400 border-orange-800/60';
      case 'MEDIUM':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/60';
      default:
        return 'bg-blue-950/70 text-blue-400 border-blue-800/60';
    }
  };

  return (
    <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Financial Scam Indicators
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                indicators.length > 0 ? 'bg-rose-950/50 text-rose-400 border-rose-800/40' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
              }`}>
                {indicators.length} Found
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Pattern matches against financial fraud and coercion heuristics</p>
          </div>
        </div>
      </div>

      {/* Indicator Cards List */}
      <div className="space-y-3">
        {isAnalyzing ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-xs">Evaluating semantic intent & coercion heuristics...</p>
          </div>
        ) : indicators.length > 0 ? (
          indicators.map((ind) => {
            const Icon = getCategoryIcon(ind.category);
            const severityClass = getSeverityBadge(ind.severity);

            return (
              <div
                key={ind.id}
                className="bg-bg-deep/70 rounded-xl p-3.5 border border-border-subtle/80 hover:border-border-active transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-bg-surface border border-border-subtle text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ind.name}</h4>
                      <span className="text-[10px] text-slate-400">{ind.category}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${severityClass}`}>
                    {ind.severity}
                  </span>
                </div>

                {/* Evidence Quote */}
                {ind.evidence_phrase && (
                  <div className="bg-bg-surface/50 rounded-lg p-2 border border-border-subtle/50 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Evidence Phrase:</span>
                    <span className="text-rose-300 font-mono italic text-[11px]">
                      {ind.evidence_phrase}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {ind.explanation}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2 border border-dashed border-border-subtle rounded-xl p-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-200">No Coercive or Fraudulent Indicators Detected</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              The conversation does not match known OTP theft, imposter emergency, or unauthorized fund transfer heuristics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
