import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, Trash2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { WaveformPlayer } from './WaveformPlayer';

interface Props {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  waveformPeaks?: number[];
  audioDuration?: number;
}

export const AudioUploadCard: React.FC<Props> = ({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
  isAnalyzing,
  waveformPeaks = [],
  audioDuration = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg(`Invalid file type "${ext}". Supported: WAV, MP3, M4A, FLAC.`);
      return;
    }
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size exceeds 25 MB limit (${(file.size / (1024*1024)).toFixed(1)} MB).`);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-accent-electric">
            <FileAudio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Audio Intake & Signal Analysis</h2>
            <p className="text-[11px] text-slate-400">Upload recorded call for forensic acoustic & intent inspection</p>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="text-xs px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-cardHover text-slate-300 border border-border-subtle flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Replace</span>
            </button>
            <button
              onClick={onRemoveFile}
              disabled={isAnalyzing}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".wav,.mp3,.m4a,.flac,.ogg,audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-accent-electric bg-accent-blue/10 scale-[0.99]'
              : 'border-border-subtle hover:border-accent-blue/50 hover:bg-bg-surface/30'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center text-slate-300 group-hover:text-accent-electric shadow-inner">
            <UploadCloud className="w-6 h-6 text-accent-electric" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              Drag & Drop call recording here, or <span className="text-accent-electric underline">browse file</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports WAV, MP3, M4A, FLAC • Up to 25 MB
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
            <span className="px-2 py-0.5 rounded bg-bg-deep border border-border-subtle">16-48 kHz</span>
            <span className="px-2 py-0.5 rounded bg-bg-deep border border-border-subtle">PCM / AAC</span>
            <span className="px-2 py-0.5 rounded bg-bg-deep border border-border-subtle">Mono / Stereo</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File Metadata Pill */}
          <div className="bg-bg-deep/90 rounded-xl p-3 border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileAudio className="w-4 h-4 text-accent-electric shrink-0" />
              <span className="font-medium text-slate-200 truncate">{selectedFile.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-slate-400">
              <span className="bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
                {formatFileSize(selectedFile.size)}
              </span>
              {audioDuration > 0 && (
                <span className="bg-bg-surface px-2 py-0.5 rounded border border-border-subtle text-slate-300">
                  {audioDuration.toFixed(1)}s
                </span>
              )}
            </div>
          </div>

          {/* Waveform Player */}
          <WaveformPlayer
            audioBlob={selectedFile}
            peaks={waveformPeaks}
            duration={audioDuration}
          />

          {/* Analyze Action Button */}
          <div className="pt-1">
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-glow-blue ${
                isAnalyzing
                  ? 'bg-accent-blue/50 text-white cursor-wait'
                  : 'bg-accent-blue hover:bg-blue-600 text-white active:scale-[0.99]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Voice & Intent Forensics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Audio Stream</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
