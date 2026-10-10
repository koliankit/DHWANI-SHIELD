import React, { useState } from 'react';
import { FileText, Search, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import { TranscriptSegment } from '../types';

interface Props {
  segments: TranscriptSegment[];
  fullTranscript: string;
  isAnalyzing: boolean;
  onHighlightClick?: (term: string) => void;
}

export const TranscriptPanel: React.FC<Props> = ({
  segments,
  fullTranscript,
  isAnalyzing,
  onHighlightClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSegments = segments.filter((seg) =>
    seg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render text with highlight pill tokens for flagged scam terms
  const renderHighlightedText = (text: string, flaggedTerms: string[]) => {
    if (!flaggedTerms || flaggedTerms.length === 0) {
      return <span>{text}</span>;
    }

    // Build regex pattern matching all flagged terms
    const cleanTerms = flaggedTerms.map((t) => t.replace(/["']/g, '').trim()).filter(Boolean);
    if (cleanTerms.length === 0) return <span>{text}</span>;

    const regex = new RegExp(`(${cleanTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = cleanTerms.some((t) => t.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            return (
              <span
                key={i}
                onClick={() => onHighlightClick?.(part)}
                className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 text-xs cursor-pointer hover:bg-rose-500/30 transition-colors"
                title="Potential Financial Fraud Keyword Trigger"
              >
                <AlertTriangle className="w-2.5 h-2.5 mr-1 text-rose-400 inline" />
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-accent-electric">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Recognized Speech Transcript
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-surface text-slate-300 border border-border-subtle font-normal">
                {segments.length} turns
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Time-aligned dialogue with fraud keyword highlights</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg-deep rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 border border-border-subtle focus:outline-none focus:border-accent-blue w-36 sm:w-48 placeholder:text-slate-400"
            />
          </div>

          {/* Toggle Timestamps */}
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showTimestamps
                ? 'bg-accent-blue/15 border-accent-blue/40 text-accent-electric'
                : 'bg-bg-surface border-border-subtle text-slate-400'
            }`}
            title="Toggle Timestamps"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!fullTranscript}
            className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-cardHover border border-border-subtle text-slate-300 transition-colors"
            title="Copy full transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {isAnalyzing ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <div className="animate-spin w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full mx-auto"></div>
            <p className="text-xs">Transcribing and parsing acoustic phonemes...</p>
          </div>
        ) : filteredSegments.length > 0 ? (
          filteredSegments.map((seg) => (
            <div
              key={seg.id}
              className={`rounded-xl p-3 border transition-colors ${
                seg.has_scam_flag
                  ? 'bg-rose-950/20 border-rose-900/40'
                  : 'bg-bg-deep/60 border-border-subtle/70'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{seg.speaker}</span>
                  {seg.has_scam_flag && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      FLAGGED
                    </span>
                  )}
                </div>
                {showTimestamps && (
                  <span className="font-mono text-slate-400 text-[10px]">
                    [{formatTimestamp(seg.start)} - {formatTimestamp(seg.end)}]
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-sans">
                {renderHighlightedText(seg.text, seg.flagged_terms)}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            {searchTerm ? 'No segments match search query.' : 'Upload or select audio to view transcription.'}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500/50"></span>
          <span>Red Highlights: Predatory keywords (OTP, UPI demand, urgency)</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">STT Model: RAKSHAM Neural v3.0</span>
      </div>
    </div>
  );
};
