import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, XOctagon } from 'lucide-react';

interface Props {
  showWarning: boolean;
  message?: string;
  reasons?: string[];
  riskLevel?: string;
}

export const RealTimeWarningBanner: React.FC<Props> = ({
  showWarning,
  message = "PAUSE. Do not transfer money or share your OTP. Verify the caller using an independent, trusted channel.",
  reasons = [],
  riskLevel = "HIGH RISK",
}) => {
  if (!showWarning) return null;

  const isHighRisk = riskLevel === 'HIGH RISK';

  return (
    <div
      className={`rounded-2xl p-5 border shadow-xl transition-all duration-300 animate-fadeIn ${
        isHighRisk
          ? 'bg-rose-950/40 border-rose-600/60 shadow-rose-950/30'
          : 'bg-amber-950/40 border-amber-600/60 shadow-amber-950/30'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Pulsing warning icon container */}
        <div
          className={`p-3 rounded-xl border flex-shrink-0 animate-pulse ${
            isHighRisk
              ? 'bg-rose-900/60 border-rose-500/80 text-rose-300 shadow-glow-red'
              : 'bg-amber-900/60 border-amber-500/80 text-amber-300 shadow-glow-amber'
          }`}
        >
          {isHighRisk ? (
            <ShieldAlert className="w-7 h-7 text-rose-400" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[10px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full border ${
                isHighRisk
                  ? 'bg-rose-900/80 text-rose-200 border-rose-500/60'
                  : 'bg-amber-900/80 text-amber-200 border-amber-500/60'
              }`}
            >
              CRITICAL INTERCEPTION WARNING
            </span>
            <span className="text-xs text-slate-400 font-mono">
              RAKSHAM VoiceGuard AI • Two-Layer Security Active
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug mt-1">
            {message}
          </h2>

          {reasons && reasons.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-rose-800/30">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Why this warning appeared:
              </span>
              <ul className="space-y-1.5">
                {reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs text-slate-200"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isHighRisk ? 'bg-rose-400' : 'bg-amber-400'
                      }`}
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-slate-300 bg-bg-deep/60 px-3 py-2 rounded-lg border border-border-subtle/50">
            <span className="font-bold text-accent-electric">DEFENSE ADVICE:</span>
            <span>
              Never share OTPs, UPI PINs, or card details. Hang up and contact your bank using the official number on your card.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
