import React from 'react';
import { 
  Folder, 
  MapPin,
  ShieldAlert, 
  PlusCircle, 
  History, 
  Cpu, 
  Settings, 
  Brain
} from 'lucide-react';
import { ActiveNavTab, SystemStatusResponse } from '../types';

interface Props {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  systemStatus: SystemStatusResponse | null;
  isConnected: boolean;
  historyCount: number;
  isDarkMode: boolean;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  systemStatus,
  isConnected,
  historyCount,
  isDarkMode
}) => {
  const navItems = [
    { 
      id: 'voice_analysis' as ActiveNavTab, 
      label: 'Voice Forensics', 
      subtitle: 'ECAPA-TDNN Analysis',
      icon: Folder, 
      badge: 'Hero' 
    },
    { 
      id: 'geospatial' as ActiveNavTab, 
      label: 'Location Intelligence', 
      subtitle: 'Cell Tower & CDR Map',
      icon: MapPin, 
      badge: '16 CDR' 
    },
    { 
      id: 'dashboard' as ActiveNavTab, 
      label: 'Scam & Fraud Scanner', 
      subtitle: 'Two-Layer Real-Time Engine',
      icon: ShieldAlert, 
      badge: 'Live' 
    },
    { 
      id: 'new_analysis' as ActiveNavTab, 
      label: 'New Intake', 
      subtitle: 'Audio Upload & Mic',
      icon: PlusCircle 
    },
    { 
      id: 'history' as ActiveNavTab, 
      label: 'Analysis History', 
      subtitle: 'Recorded Cases',
      icon: History, 
      badge: historyCount > 0 ? historyCount.toString() : undefined 
    },
    { 
      id: 'models' as ActiveNavTab, 
      label: 'AI Models', 
      subtitle: 'Vocoder & STT Rules',
      icon: Cpu, 
      badge: '3 Active' 
    },
    { 
      id: 'settings' as ActiveNavTab, 
      label: 'Settings', 
      subtitle: 'Thresholds & Engine',
      icon: Settings 
    },
  ];

  return (
    <aside className={`w-16 hover:w-64 md:w-64 group flex flex-col h-screen shrink-0 sticky top-0 z-40 select-none transition-all duration-200 border-r ${
      isDarkMode 
        ? 'bg-[#070e1a] border-[#142033] text-slate-100' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      
      {/* Top Logo Badge Matching Reference Image 2 */}
      <div className={`p-3.5 border-b flex items-center gap-3 ${
        isDarkMode ? 'border-[#142033]' : 'border-slate-200'
      }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform ${
          isDarkMode 
            ? 'bg-[#0f1b2d] border border-[#1b2f4d] text-cyan-400' 
            : 'bg-teal-50 border border-teal-200 text-teal-700'
        }`}>
          <Brain className="w-5 h-5" />
        </div>
        <div className="hidden md:block group-hover:block overflow-hidden whitespace-nowrap transition-opacity">
          <div className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>RAKSHAM</span>
            <span className={`text-[10px] font-mono px-1 rounded border ${
              isDarkMode 
                ? 'bg-cyan-950 text-cyan-400 border-cyan-800' 
                : 'bg-teal-50 text-teal-800 border-teal-300'
            }`}>
              AI
            </span>
          </div>
          <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Forensics & Intelligence
          </div>
        </div>
      </div>

      {/* Nav Items List */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
        <div className={`hidden md:block group-hover:block px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Investigation Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          let btnClass = '';
          if (isActive) {
            btnClass = isDarkMode
              ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-950/80 border border-teal-400/40'
              : 'bg-teal-700 text-white shadow-md border border-teal-800';
          } else {
            btnClass = isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-[#0c1626] border border-transparent'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent';
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all group/btn ${btnClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1 rounded-lg shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : isDarkMode 
                    ? 'text-slate-400 group-hover/btn:text-cyan-400' 
                    : 'text-slate-500 group-hover/btn:text-teal-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="hidden md:block group-hover:block text-left overflow-hidden whitespace-nowrap">
                  <div className={`text-xs font-semibold ${
                    isActive 
                      ? 'text-white' 
                      : isDarkMode 
                      ? 'text-slate-200' 
                      : 'text-slate-800'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] ${
                    isActive 
                      ? 'text-teal-100' 
                      : isDarkMode 
                      ? 'text-slate-500' 
                      : 'text-slate-400'
                  }`}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`hidden md:inline-block group-hover:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? isDarkMode 
                        ? 'bg-teal-900/80 text-teal-200 border border-teal-500/50' 
                        : 'bg-teal-800 text-teal-100'
                      : isDarkMode 
                        ? 'bg-[#0a1424] text-slate-400 border border-[#162740]' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status Card */}
      <div className={`p-3 border-t mt-auto ${
        isDarkMode ? 'border-[#142033]' : 'border-slate-200'
      }`}>
        <div className={`hidden md:block group-hover:block rounded-xl p-2.5 border ${
          isDarkMode 
            ? 'bg-[#0a1322] border-[#14233a]' 
            : 'bg-slate-50 border-slate-200 shadow-inner'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className={`font-medium flex items-center gap-1.5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              System Status
            </span>
            <span className="font-mono text-emerald-600 font-bold text-[10px]">OPERATIONAL</span>
          </div>
          <p className={`text-[10px] font-mono truncate ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            FastAPI · SQLite · Leaflet
          </p>
        </div>
      </div>

    </aside>
  );
};
