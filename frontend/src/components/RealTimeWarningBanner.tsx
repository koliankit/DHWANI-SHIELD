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
          ? 'bg-[#e5534b]/15 border-[#e5534b]/50'
          : 'bg-[#f0a73a]/15 border-[#f0a73a]/50'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Pulsing warning icon container */}
        <div
          className={`p-3 rounded-xl border flex-shrink-0 animate-pulse ${
            isHighRisk
              ? 'bg-[#e5534b]/20 border-[#e5534b]/60 text-[#e5534b]'
              : 'bg-[#f0a73a]/20 border-[#f0a73a]/60 text-[#f0a73a]'
          }`}
        >
          {isHighRisk ? (
            <ShieldAlert className="w-7 h-7 text-[#e5534b]" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-[#f0a73a]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[10px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full border ${
                isHighRisk
                  ? 'bg-[#e5534b] text-[#0d1113] border-[#e5534b]'
                  : 'bg-[#f0a73a] text-[#0d1113] border-[#f0a73a]'
              }`}
            >
              CRITICAL INTERCEPTION WARNING
            </span>
            <span className="text-xs text-[#86989f] font-mono">
              RAKSHAM VoiceGuard AI • Two-Layer Security Active
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-[#d6e1e5] tracking-tight leading-snug mt-1">
            {message}
          </h2>

          {reasons && reasons.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-[#25323a]">
              <span className="text-xs font-semibold text-[#86989f] block mb-2">
                Why this warning appeared:
              </span>
              <ul className="space-y-1.5">
                {reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs text-[#d6e1e5]"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isHighRisk ? 'bg-[#e5534b]' : 'bg-[#f0a73a]'
                      }`}
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-[#d6e1e5] bg-[#0d1113] px-3 py-2 rounded-lg border border-[#25323a]">
            <span className="font-bold text-[#2ec4b6]">DEFENSE ADVICE:</span>
            <span>
              Never share OTPs, UPI PINs, or card details. Hang up and contact your bank using the official number on your card.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
