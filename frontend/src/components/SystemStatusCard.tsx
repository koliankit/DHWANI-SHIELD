import React from 'react';
import { Activity, ShieldCheck, Cpu, Wifi } from 'lucide-react';
import { SystemStatusResponse } from '../types';

interface Props {
  systemStatus: SystemStatusResponse | null;
  isConnected: boolean;
}

export const SystemStatusCard: React.FC<Props> = ({ systemStatus, isConnected }) => {
  return (
    <div className="mt-auto pt-4 border-t border-border-subtle">
      <div className="bg-bg-deep/80 rounded-xl p-3 border border-border-subtle/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">System Status</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${isConnected ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-accent-electric" />
              <span>Acoustic Net</span>
            </span>
            <span className="text-slate-300 font-mono text-[10px]">
              {systemStatus?.models[0]?.status === 'ACTIVE' ? 'v2.4.1 Ready' : 'Standby'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Transcript AI</span>
            </span>
            <span className="text-slate-300 font-mono text-[10px]">
              {systemStatus?.models[1]?.status === 'ACTIVE' ? 'v3.0 Multi' : 'Standby'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Fraud Rules</span>
            </span>
            <span className="text-slate-300 font-mono text-[10px]">
              {systemStatus?.models[2]?.status === 'ACTIVE' ? 'v3.1 Heuristics' : 'Standby'}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-border-subtle/50 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5 text-accent-electric" />
            <span>API Latency</span>
          </span>
          <span className="font-mono text-emerald-400 font-medium">18 ms</span>
        </div>
      </div>
    </div>
  );
};
