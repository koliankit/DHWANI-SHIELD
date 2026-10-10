import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Download, Link2 } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisResponse | null;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !data) return null;

  const sanitizedSummary = `[RAKSHAM VoiceGuard AI Report]
File: ${data.filename}
Overall Risk: ${data.overall_risk}
Voice Authenticity: ${data.authenticity_label} (${(data.synthetic_speech_score * 100).toFixed(1)}% Synthetic Probability)
Scam Indicators: ${data.scam_indicators_count} Detected
Assessment: ${data.risk_explanation}
Recommendations:
${data.recommended_actions.map(a => `• ${a}`).join('\n')}`;

  const shareableUrl = `${window.location.origin}/#report-${data.analysis_id.slice(0, 8)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(sanitizedSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `VoiceGuard_Analysis_${data.analysis_id.slice(0, 8)}.json`);
    dl.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141a1d] border border-[#25323a] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#25323a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#12312f] border border-[#2ec4b6]/30 flex items-center justify-center text-[#2ec4b6]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#d6e1e5]">Share Forensic Audit Report</h3>
              <p className="text-[11px] text-[#86989f]">Sanitized summary for security response & fraud teams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#86989f] hover:text-[#d6e1e5] hover:bg-[#1a2327] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#86989f]">Confidential Audit Reference</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="w-full bg-[#0d1113] rounded-xl px-3 py-2 text-xs font-mono text-[#d6e1e5] border border-[#25323a] focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Sanitized Text Summary Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#86989f]">Sanitized Incident Summary</label>
            <button
              onClick={handleCopySummary}
              className="text-[11px] text-[#2ec4b6] hover:underline flex items-center gap-1 font-bold"
            >
              {copiedSummary ? <Check className="w-3 h-3 text-[#2ec4b6]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSummary ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="bg-[#0d1113] rounded-xl p-3 border border-[#25323a] text-[11px] font-mono text-[#d6e1e5] whitespace-pre-wrap max-h-40 overflow-y-auto">
            {sanitizedSummary}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#25323a]">
          <button
            onClick={handleDownloadJson}
            className="px-3 py-2 rounded-xl bg-[#1a2327] hover:bg-[#25323a] border border-[#25323a] text-[#d6e1e5] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#2ec4b6]" />
            <span>Export Raw JSON</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1a2327] hover:bg-[#25323a] text-[#d6e1e5] border border-[#25323a] text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
