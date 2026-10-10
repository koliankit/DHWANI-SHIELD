import React, { useState } from 'react';
import { UploadCloud, Mic } from 'lucide-react';
import { AudioUploadCard } from '../AudioUploadCard';
import { LiveMicrophoneCard } from '../LiveMicrophoneCard';
import { QuickTestExamples } from '../QuickTestExamples';
import { AnalysisProgress } from '../AnalysisProgress';
import { RealTimeWarningBanner } from '../RealTimeWarningBanner';
import { MetricCards } from '../MetricCards';
import { TranscriptPanel } from '../TranscriptPanel';
import { ScamIndicatorsPanel } from '../ScamIndicatorsPanel';
import { RiskAssessmentPanel } from '../RiskAssessmentPanel';
import { AnalysisResponse } from '../../types';

interface Props {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  onAnalyze: () => void;
  onSelectExample: (exampleId: string) => void;
  onLiveAnalysisComplete: (result: AnalysisResponse) => void;
  isAnalyzing: boolean;
  analysisStage: number;
  hasFailed: boolean;
  failureMessage?: string;
  analysisData: AnalysisResponse | null;
  activeExampleId: string | null;
  onOpenShareModal: () => void;
}

export const DashboardView: React.FC<Props> = ({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
  onSelectExample,
  onLiveAnalysisComplete,
  isAnalyzing,
  analysisStage,
  hasFailed,
  failureMessage,
  analysisData,
  activeExampleId,
  onOpenShareModal,
}) => {
  const [intakeMode, setIntakeMode] = useState<'upload' | 'live'>('upload');

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Left / Center Main Workspace */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Intake Mode Switcher */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2 bg-bg-card p-1 rounded-xl border border-border-subtle shadow-sm">
            <button
              onClick={() => setIntakeMode('upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                intakeMode === 'upload'
                  ? 'bg-accent-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Audio File Upload</span>
            </button>
            <button
              onClick={() => setIntakeMode('live')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                intakeMode === 'live'
                  ? 'bg-accent-blue text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Microphone Mode</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-Layer Engine Ready</span>
          </div>
        </div>

        {/* 1. Main Audio Intake Card (Upload or Live Mic) */}
        {intakeMode === 'upload' ? (
          <AudioUploadCard
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onRemoveFile={onRemoveFile}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            waveformPeaks={analysisData?.waveform_data}
            audioDuration={analysisData?.audio_duration_seconds}
          />
        ) : (
          <LiveMicrophoneCard
            onLiveAnalysisComplete={onLiveAnalysisComplete}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* 2. Real-Time Pause Warning Banner (Displayed when suspicious scam indicators or AI voice detected) */}
        {analysisData?.show_warning && (
          <RealTimeWarningBanner
            showWarning={analysisData.show_warning}
            message={analysisData.warning_message}
            reasons={analysisData.warning_reasons}
            riskLevel={analysisData.overall_risk}
          />
        )}

        {/* 3. Quick Test Examples (3 prompt-mandated benchmark calls) */}
        <QuickTestExamples
          onSelectExample={onSelectExample}
          isAnalyzing={isAnalyzing}
          activeExampleId={activeExampleId}
        />

        {/* 4. Analysis Progress (horizontal 4-stage stepper) */}
        <AnalysisProgress
          currentStage={analysisStage}
          hasFailed={hasFailed}
          failureMessage={failureMessage}
        />

        {/* 5. Three Summary Metric Cards */}
        <MetricCards
          data={analysisData}
          isAnalyzing={isAnalyzing}
        />

        {/* 6. Transcript & Scam Indicators Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TranscriptPanel
            segments={analysisData?.transcript_segments || []}
            fullTranscript={analysisData?.transcript_text || ''}
            isAnalyzing={isAnalyzing}
          />

          <ScamIndicatorsPanel
            indicators={analysisData?.scam_indicators || []}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>

      {/* Right-Side Risk Assessment Panel */}
      <RiskAssessmentPanel
        data={analysisData}
        isAnalyzing={isAnalyzing}
        onOpenShareModal={onOpenShareModal}
      />
    </div>
  );
};
