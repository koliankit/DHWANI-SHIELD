import React from 'react';
import { CheckCircle2, Circle, Loader2, AlertCircle, FileAudio, Activity, FileText, ShieldAlert } from 'lucide-react';

export type StepState = 'pending' | 'running' | 'completed' | 'failed';

interface Props {
  currentStage: number; // 0: idle, 1: Audio Processing, 2: Voice Analysis, 3: Transcription, 4: Risk Assessment, 5: Done
  hasFailed?: boolean;
  failureMessage?: string;
}

export const AnalysisProgress: React.FC<Props> = ({ currentStage, hasFailed, failureMessage }) => {
  const steps = [
    { id: 1, label: 'Audio Processing', desc: 'Sample rate & spectral extraction', icon: FileAudio },
    { id: 2, label: 'Voice Analysis', desc: 'Acoustic vocoder anti-spoofing', icon: Activity },
    { id: 3, label: 'Transcription', desc: 'Speech phoneme & text alignment', icon: FileText },
    { id: 4, label: 'Risk Assessment', desc: 'Financial fraud heuristics & synthesis', icon: ShieldAlert },
  ];

  const getStepState = (stepId: number): StepState => {
    if (hasFailed && currentStage === stepId) return 'failed';
    if (currentStage > stepId) return 'completed';
    if (currentStage === stepId) return 'running';
    return 'pending';
  };

  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border-subtle shadow-md">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Analysis Pipeline</span>
          <span className="text-[10px] font-mono text-slate-400">
            {currentStage === 0
              ? 'Ready'
              : currentStage >= 5
              ? 'Complete'
              : `Executing Stage ${currentStage} of 4`}
          </span>
        </div>
        {hasFailed && failureMessage && (
          <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {failureMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 relative">
        {steps.map((step, idx) => {
          const state = getStepState(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`rounded-xl p-3 border transition-all duration-200 flex items-start gap-3 relative ${
                state === 'completed'
                  ? 'bg-bg-deep/80 border-emerald-900/40 text-slate-200'
                  : state === 'running'
                  ? 'bg-accent-blue/10 border-accent-blue/50 text-white shadow-glow-blue'
                  : state === 'failed'
                  ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                  : 'bg-bg-deep/40 border-border-subtle/60 text-slate-400'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {state === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {state === 'running' && <Loader2 className="w-4 h-4 text-accent-electric animate-spin" />}
                {state === 'failed' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {state === 'pending' && <Circle className="w-4 h-4 text-slate-400" />}
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold leading-tight truncate">{step.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">{step.desc}</p>
              </div>

              {/* Progress bar connector */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <span className="text-slate-400 text-xs">›</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
