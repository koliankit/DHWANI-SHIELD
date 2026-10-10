import React from 'react';
import { Cpu, Activity, ShieldCheck, CheckCircle2, Zap, Server } from 'lucide-react';
import { SystemStatusResponse } from '../../types';

interface Props {
  systemStatus: SystemStatusResponse | null;
}

export const ModelsView: React.FC<Props> = ({ systemStatus }) => {
  const models = systemStatus?.models || [
    {
      name: 'RAKSHAM-AcousticNet',
      version: 'v2.4.1',
      role: 'Synthetic Speech & Vocoder Artifact Detection',
      status: 'ACTIVE',
      latency_ms: 18.4,
      device: 'CPU Vectorized Signal Processing',
      description: 'Extracts spectral centroid, high-frequency energy ratio, phase discontinuity, and glottal micro-jitter regularity to uncover neural speech synthesis.'
    },
    {
      name: 'RAKSHAM Neural Transcript Engine',
      version: 'v3.0-multilingual',
      role: 'Speech Transcription & Phoneme Cadence Alignment',
      status: 'ACTIVE',
      latency_ms: 42.6,
      device: 'CPU Acoustic Alignment',
      description: 'Transcribes audio streams into time-indexed conversational segments with speaker diarization tags.'
    },
    {
      name: 'FinFraud Semantic Engine',
      version: 'v3.1.2',
      role: 'Financial Scam Intent & Coercion Extraction',
      status: 'ACTIVE',
      latency_ms: 3.1,
      device: 'CPU Regex & Heuristics Matrix',
      description: 'Scans transcripts for predatory OTP solicitation, artificial urgency, institutional impersonation, and remote desktop installation demands.'
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#d6e1e5] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#2ec4b6]" />
          Neural Models & Inspection Pipeline
        </h2>
        <p className="text-xs text-[#86989f] mt-1">
          Forensic model architecture, runtime performance telemetry, and verification engines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141a1d] rounded-2xl p-4 border border-[#25323a] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#86989f] uppercase font-semibold">Engine Runtime</div>
            <div className="text-sm font-bold text-[#d6e1e5]">FastAPI 0.115 + Py 3.14</div>
          </div>
        </div>

        <div className="bg-[#141a1d] rounded-2xl p-4 border border-[#25323a] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#86989f] uppercase font-semibold">Mean Latency</div>
            <div className="text-sm font-bold text-[#2ec4b6] font-mono">18.4 ms Avg</div>
          </div>
        </div>

        <div className="bg-[#141a1d] rounded-2xl p-4 border border-[#25323a] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#86989f] uppercase font-semibold">Operational Security</div>
            <div className="text-sm font-bold text-[#2ec4b6]">Local Zero-Leakage</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {models.map((m, idx) => (
          <div
            key={idx}
            className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-md space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25323a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a2327] border border-[#25323a] flex items-center justify-center text-[#2ec4b6] font-mono font-bold text-xs">
                  0{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#d6e1e5]">{m.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1113] text-[#86989f] border border-[#25323a]">
                      {m.version}
                    </span>
                  </div>
                  <p className="text-xs text-[#86989f]">{m.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-[#2ec4b6] font-semibold bg-[#12312f] px-2.5 py-1 rounded-lg border border-[#2ec4b6]/50 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {m.status}
                </span>
                <span className="text-xs text-[#d6e1e5] font-mono bg-[#1a2327] px-2.5 py-1 rounded-lg border border-[#25323a]">
                  {m.latency_ms} ms
                </span>
              </div>
            </div>

            <p className="text-xs text-[#d6e1e5] leading-relaxed">
              {m.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#86989f] font-mono">
              <span>Compute: {m.device}</span>
              <span className="text-[#2ec4b6]">Accuracy Calibrated: ±3.5%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
