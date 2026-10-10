import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, Trash2, RefreshCw, AlertCircle, Sparkles, Hash, PhoneForwarded, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { WaveformPlayer } from './WaveformPlayer';
import { api } from '../services/api';

interface Props {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  waveformPeaks?: number[];
  audioDuration?: number;
  onTelephonyIngestComplete?: (data: any) => void;
}

export const AudioUploadCard: React.FC<Props> = ({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
  isAnalyzing,
  waveformPeaks = [],
  audioDuration = 0,
  onTelephonyIngestComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'telephony'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileSha256, setFileSha256] = useState<string | null>(null);
  const [stableEventId, setStableEventId] = useState<string>(() => `EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [legalAuthorityConfirmed, setLegalAuthorityConfirmed] = useState(true);
  const [telephonyProvider, setTelephonyProvider] = useState<'Twilio' | 'Exotel' | 'WebRTC'>('Twilio');
  const [isPullingTelephony, setIsPullingTelephony] = useState(false);

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  const computeFileSha256 = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileSha256(hashHex);
    } catch {
      setFileSha256(null);
    }
  };

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
    computeFileSha256(file);
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

  const handlePullTelephonyRecording = async () => {
    setIsPullingTelephony(true);
    setErrorMsg(null);
    try {
      const result = await api.ingestTelephonyCall({
        eventId: stableEventId,
        telephonyProvider,
        legalAuthority: 'Telephony recording notice & lawful authority verified',
        cdrRef: 1348,
        sampleKey: 'ai_clone'
      });
      if (onTelephonyIngestComplete) {
        onTelephonyIngestComplete(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Telephony recording pull failed');
    } finally {
      setIsPullingTelephony(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md space-y-4 font-sans">
      
      {/* Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#12312f] border border-[#2ec4b6]/40 flex items-center justify-center text-[#2ec4b6]">
            <FileAudio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#d6e1e5] tracking-tight">Recorded Call Intake & Forensics</h2>
            <p className="text-[11px] text-[#86989f]">Upload file or pull recordings automatically when a call ends</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#1a2327] border border-[#25323a] rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg transition-all font-semibold ${
              activeTab === 'upload'
                ? 'bg-[#2ec4b6] text-[#0d1113] shadow'
                : 'text-[#86989f] hover:text-[#d6e1e5]'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('telephony')}
            className={`px-3 py-1 rounded-lg transition-all font-semibold ${
              activeTab === 'telephony'
                ? 'bg-[#2ec4b6] text-[#0d1113] shadow'
                : 'text-[#86989f] hover:text-[#d6e1e5]'
            }`}
          >
            Telephony Pull
          </button>
        </div>
      </div>

      {/* Stable Event ID Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1a2327] border border-[#25323a] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-[#2ec4b6]" />
          <span className="text-[#86989f]">Stable Event ID:</span>
          <span className="text-[#2ec4b6] font-bold">{stableEventId}</span>
        </div>
        {fileSha256 && (
          <div className="text-[11px] text-[#86989f] truncate max-w-xs" title={fileSha256}>
            SHA-256: <span className="text-[#d6e1e5]">{fileSha256.slice(0, 16)}...</span>
          </div>
        )}
      </div>

      {activeTab === 'upload' ? (
        <>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a,.flac,.ogg,audio/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!selectedFile ? (
            /* Drag & Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#2ec4b6] bg-[#12312f]/40'
                  : 'border-[#25323a] hover:border-[#2ec4b6]/60 bg-[#1a2327]/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#12312f] border border-[#2ec4b6]/30 text-[#2ec4b6] flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#d6e1e5] mb-1">
                Drop audio recording here or <span className="text-[#2ec4b6]">Browse</span>
              </h3>
              <p className="text-xs text-[#86989f] font-mono">
                WAV (recommended 16kHz PCM), MP3, FLAC, M4A up to 25MB
              </p>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="p-4 rounded-xl bg-[#1a2327] border border-[#25323a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#12312f] text-[#2ec4b6] flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono text-[#d6e1e5] truncate max-w-xs">{selectedFile.name}</h4>
                    <p className="text-[11px] text-[#86989f] font-mono">
                      {formatFileSize(selectedFile.size)} · SHA-256 Calculated
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="p-1.5 rounded bg-[#141a1d] hover:bg-[#25323a] text-[#86989f] hover:text-[#d6e1e5] border border-[#25323a] transition-colors"
                    title="Replace file"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onRemoveFile}
                    disabled={isAnalyzing}
                    className="p-1.5 rounded bg-[#141a1d] hover:bg-[#e5534b]/20 text-[#86989f] hover:text-[#e5534b] border border-[#25323a] transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {waveformPeaks.length > 0 && (
                <WaveformPlayer peaks={waveformPeaks} duration={audioDuration} />
              )}
            </div>
          )}
        </>
      ) : (
        /* Telephony Automated Pull Tab */
        <div className="p-5 rounded-xl bg-[#1a2327] border border-[#25323a] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#86989f]">Telephony Stream Provider:</span>
            <div className="flex items-center gap-1.5">
              {(['Twilio', 'Exotel', 'WebRTC'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setTelephonyProvider(prov)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                    telephonyProvider === prov
                      ? 'bg-[#2ec4b6] text-[#0d1113] border-[#2ec4b6]'
                      : 'bg-[#141a1d] text-[#86989f] border-[#25323a] hover:text-[#d6e1e5]'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141a1d] border border-[#25323a] text-xs font-mono space-y-1.5 text-[#86989f]">
            <div className="flex items-center justify-between text-[#d6e1e5]">
              <span>Inbound Webhook:</span>
              <span className="text-[#2ec4b6]">POST /api/telephony/webhook</span>
            </div>
            <div>Action: Pull recording automatically upon call completion (status: completed).</div>
            <div>Security: Cryptographic SHA-256 hash stored and immutable audit trail created.</div>
          </div>

          <button
            onClick={handlePullTelephonyRecording}
            disabled={isPullingTelephony}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs font-mono flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <PhoneForwarded className="w-4 h-4 text-[#0d1113]" />
            <span>{isPullingTelephony ? 'Pulling Telephony Recording...' : `Pull Call Recording from ${telephonyProvider}`}</span>
          </button>
        </div>
      )}

      {/* Legal Authority & Consent Checkbox */}
      <div 
        onClick={() => setLegalAuthorityConfirmed(!legalAuthorityConfirmed)}
        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#1a2327] border border-[#25323a] cursor-pointer text-xs select-none"
      >
        {legalAuthorityConfirmed ? (
          <CheckSquare className="w-4 h-4 text-[#2ec4b6] shrink-0 mt-0.5" />
        ) : (
          <Square className="w-4 h-4 text-[#86989f] shrink-0 mt-0.5" />
        )}
        <div className="text-[11px] font-mono leading-tight">
          <span className="text-[#d6e1e5] font-semibold">Recording Notice & Lawful Authority: </span>
          <span className="text-[#86989f]">
            Confirmed that this call audio is obtained via appropriate authority or consent (recording notice or legal order).
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-[#e5534b]/15 border border-[#e5534b]/50 text-[#e5534b] text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analyze Trigger (Upload tab) */}
      {activeTab === 'upload' && selectedFile && (
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !legalAuthorityConfirmed}
          className="w-full py-3 px-4 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-[#0d1113]" />
          <span>{isAnalyzing ? 'Executing ECAPA-TDNN & AASIST Analysis...' : 'Run Forensic Voice & Intent Analysis'}</span>
        </button>
      )}

    </div>
  );
};
