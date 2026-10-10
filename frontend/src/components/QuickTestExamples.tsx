import React, { useState } from 'react';
import { Play, Pause, ShieldCheck, AlertTriangle, Cpu, Zap, ArrowRight } from 'lucide-react';

interface Props {
  onSelectExample: (exampleId: string) => void;
  isAnalyzing: boolean;
  activeExampleId?: string | null;
}

interface ExampleItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: 'green' | 'amber' | 'red';
  duration: string;
  icon: React.ElementType;
  description: string;
  layerHighlight: string;
}

export const QuickTestExamples: React.FC<Props> = ({
  onSelectExample,
  isAnalyzing,
  activeExampleId,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const examples: ExampleItem[] = [
    {
      id: 'benign_conversation',
      title: '1. Benign Conversation',
      subtitle: 'Safe Peer Planning Call',
      tag: 'SAFE • LOW RISK',
      tagColor: 'green',
      duration: '14.2s',
      icon: ShieldCheck,
      description: 'Legitimate colleague call discussing schedule and design review. No banking credentials solicited.',
      layerHighlight: 'Layer 1: Real Voice (8.4%) • Layer 2: 0 Scam Flags',
    },
    {
      id: 'financial_scam_script',
      title: '2. Financial Scam Script',
      subtitle: 'Human Bank Impersonation Scam',
      tag: 'CRITICAL • LAYER 2 PROOF',
      tagColor: 'red',
      duration: '16.5s',
      icon: AlertTriangle,
      description: 'Human scammer posing as SBI fraud officer threatening account freeze and demanding immediate OTP disclosure.',
      layerHighlight: 'Layer 1: Real Voice (12.1%) • Layer 2: 3 Flags (OTP/Threat/Imp.)',
    },
    {
      id: 'synthetic_speech_sample',
      title: '3. Synthetic Speech Sample',
      subtitle: 'AI Cloned Voice Urgent Scam',
      tag: 'AI CLONE • HIGH RISK',
      tagColor: 'red',
      duration: '17.2s',
      icon: Cpu,
      description: 'AI-generated synthetic voice clone mimicking a relative requesting emergency 50k UPI transfer and OTP approval.',
      layerHighlight: 'Layer 1: Synthetic (94.2%) • Layer 2: 3 Flags (OTP/UPI/Urgency)',
    },
  ];

  const handlePreviewPlay = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (playingId === id) {
      audioElement?.pause();
      setPlayingId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(`/api/samples/${id}/audio`);
      audio.onended = () => setPlayingId(null);
      audio.play().then(() => {
        setPlayingId(id);
        setAudioElement(audio);
      }).catch((err) => {
        console.warn('Audio preview playback error:', err);
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-accent-electric" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Standard Verification Test Scenarios
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Click card to run full two-layer analysis</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {examples.map((ex) => {
          const Icon = ex.icon;
          const isSelected = activeExampleId === ex.id;
          const isPlaying = playingId === ex.id;

          const tagStyles = {
            green: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50',
            amber: 'bg-amber-950/70 text-amber-400 border-amber-800/50',
            red: 'bg-rose-950/70 text-rose-400 border-rose-800/50',
          }[ex.tagColor];

          return (
            <div
              key={ex.id}
              onClick={() => onSelectExample(ex.id)}
              className={`group bg-bg-card hover:bg-bg-cardHover rounded-xl p-3.5 border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-accent-blue shadow-glow-blue bg-bg-surface/50'
                  : 'border-border-subtle hover:border-border-active'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-bg-surface border border-border-subtle text-slate-300 flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-accent-electric" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-accent-electric transition-colors truncate">
                      {ex.title}
                    </span>
                  </div>

                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ml-1 ${tagStyles}`}>
                    {ex.tag}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                  {ex.description}
                </p>

                <div className="text-[10px] font-mono text-slate-400 bg-bg-deep/70 px-2 py-1 rounded border border-border-subtle/50 mb-2 truncate">
                  {ex.layerHighlight}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handlePreviewPlay(e, ex.id)}
                    className="w-6 h-6 rounded-full bg-bg-surface hover:bg-accent-blue text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title={isPlaying ? "Pause preview" : "Listen to audio preview"}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </button>
                  <span className="font-mono text-[10px] text-slate-400">{ex.duration}</span>
                </div>

                <button
                  disabled={isAnalyzing}
                  className="text-[11px] font-semibold text-accent-electric group-hover:underline flex items-center gap-1"
                >
                  <span>Run Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
