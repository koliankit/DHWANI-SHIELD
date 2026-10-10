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
    <div className="bg-[#141a1d] rounded-2xl p-4 border border-[#25323a] shadow-md">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#d6e1e5] uppercase tracking-wider font-mono">Analysis Pipeline</span>
          <span className="text-[10px] font-mono text-[#86989f]">
            {currentStage === 0
              ? 'Ready'
              : currentStage >= 5
              ? 'Complete'
              : `Executing Stage ${currentStage} of 4`}
          </span>
        </div>
        {hasFailed && failureMessage && (
          <span className="text-xs text-[#e5534b] font-medium flex items-center gap-1 font-mono">
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
                  ? 'bg-[#12312f]/40 border-[#2ec4b6]/40 text-[#d6e1e5]'
                  : state === 'running'
                  ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6] shadow-sm'
                  : state === 'failed'
                  ? 'bg-[#e5534b]/15 border-[#e5534b]/50 text-[#e5534b]'
                  : 'bg-[#0d1113] border-[#25323a] text-[#86989f]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {state === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#2ec4b6]" />}
                {state === 'running' && <Loader2 className="w-4 h-4 text-[#2ec4b6] animate-spin" />}
                {state === 'failed' && <AlertCircle className="w-4 h-4 text-[#e5534b]" />}
                {state === 'pending' && <Circle className="w-4 h-4 text-[#86989f]" />}
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold leading-tight truncate">{step.label}</span>
                </div>
                <p className="text-[10px] text-[#86989f] truncate mt-0.5 leading-tight">{step.desc}</p>
              </div>

              {/* Progress bar connector */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <span className="text-[#86989f] text-xs">›</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
