import React from 'react';
import { Activity, ShieldCheck, Cpu, Wifi } from 'lucide-react';
import { SystemStatusResponse } from '../types';

interface Props {
  systemStatus: SystemStatusResponse | null;
  isConnected: boolean;
}

export const SystemStatusCard: React.FC<Props> = ({ systemStatus, isConnected }) => {
  return (
    <div className="mt-auto pt-4 border-t border-[#25323a]">
      <div className="bg-[#141a1d] rounded-xl p-3 border border-[#25323a] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-[#2ec4b6]' : 'bg-[#e5534b]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-[#2ec4b6]' : 'bg-[#e5534b]'}`}></span>
            </span>
            <span className="text-[11px] font-semibold text-[#d6e1e5] uppercase tracking-wider font-mono">System Status</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isConnected ? 'bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/40' : 'bg-[#e5534b]/20 text-[#e5534b] border border-[#e5534b]/50'}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-[#86989f]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#2ec4b6]" />
              <span>Acoustic Net</span>
            </span>
            <span className="text-[#d6e1e5] font-mono text-[10px]">
              {systemStatus?.models[0]?.status === 'ACTIVE' ? 'v2.4.1 Ready' : 'Standby'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#86989f]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#2ec4b6]" />
              <span>Transcript AI</span>
            </span>
            <span className="text-[#d6e1e5] font-mono text-[10px]">
              {systemStatus?.models[1]?.status === 'ACTIVE' ? 'v3.0 Multi' : 'Standby'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#86989f]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#2ec4b6]" />
              <span>Fraud Rules</span>
            </span>
            <span className="text-[#d6e1e5] font-mono text-[10px]">
              {systemStatus?.models[2]?.status === 'ACTIVE' ? 'v3.1 Heuristics' : 'Standby'}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-[#25323a] flex items-center justify-between text-[10px] text-[#86989f]">
          <span className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5 text-[#2ec4b6]" />
            <span>API Latency</span>
          </span>
          <span className="font-mono text-[#2ec4b6] font-medium">18 ms</span>
        </div>
      </div>
    </div>
  );
};
