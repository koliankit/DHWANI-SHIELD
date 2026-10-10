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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-bg-card border border-border-subtle rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-accent-electric">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Forensic Audit Report</h3>
              <p className="text-[11px] text-slate-400">Sanitized summary for security response & fraud teams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Confidential Audit Reference</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="w-full bg-bg-deep rounded-xl px-3 py-2 text-xs font-mono text-slate-300 border border-border-subtle focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Sanitized Text Summary Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Sanitized Incident Summary</label>
            <button
              onClick={handleCopySummary}
              className="text-[11px] text-accent-electric hover:underline flex items-center gap-1"
            >
              {copiedSummary ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSummary ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="bg-bg-deep/90 rounded-xl p-3 border border-border-subtle text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {sanitizedSummary}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <button
            onClick={handleDownloadJson}
            className="px-3 py-2 rounded-xl bg-bg-surface hover:bg-bg-cardHover border border-border-subtle text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent-electric" />
            <span>Export Raw JSON</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg-surface hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
