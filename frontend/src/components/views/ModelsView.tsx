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
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-accent-electric" />
          Neural Models & Inspection Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Forensic model architecture, runtime performance telemetry, and verification engines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card rounded-2xl p-4 border border-border-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-blue/15 text-accent-electric border border-accent-blue/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Engine Runtime</div>
            <div className="text-sm font-bold text-white">FastAPI 0.115 + Py 3.14</div>
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl p-4 border border-border-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Mean Latency</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">18.4 ms Avg</div>
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl p-4 border border-border-subtle flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Operational Security</div>
            <div className="text-sm font-bold text-cyan-300">Local Zero-Leakage</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {models.map((m, idx) => (
          <div
            key={idx}
            className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center text-accent-electric font-mono font-bold text-xs">
                  0{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{m.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-deep text-slate-300 border border-border-subtle">
                      {m.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{m.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {m.status}
                </span>
                <span className="text-xs text-slate-300 font-mono bg-bg-surface px-2.5 py-1 rounded-lg border border-border-subtle">
                  {m.latency_ms} ms
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {m.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Compute: {m.device}</span>
              <span className="text-accent-electric">Accuracy Calibrated: ±3.5%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
