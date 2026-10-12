import React from 'react';
import { 
  Folder, 
  MapPin,
  Globe,
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
      id: 'location_map' as ActiveNavTab, 
      label: 'Location Map', 
      subtitle: '3D Earth & Search',
      icon: Globe, 
      badge: '3D' 
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
        ? 'bg-[#0d1113] border-[#25323a] text-[#d6e1e5]' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      
      {/* Top Logo Badge Matching Reference Image 2 */}
      <div className={`p-3.5 border-b flex items-center gap-3 ${
        isDarkMode ? 'border-[#25323a]' : 'border-slate-200'
      }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform ${
          isDarkMode 
            ? 'bg-[#141a1d] border border-[#25323a] text-[#2ec4b6]' 
            : 'bg-teal-50 border border-teal-200 text-teal-700'
        }`}>
          <Brain className="w-5 h-5" />
        </div>
        <div className="hidden md:block group-hover:block overflow-hidden whitespace-nowrap transition-opacity">
          <div className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
            <span className={isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-900'}>RAKSHAM</span>
            <span className={`text-[10px] font-mono px-1 rounded border ${
              isDarkMode 
                ? 'bg-[#12312f] text-[#2ec4b6] border-[#2ec4b6]/60' 
                : 'bg-teal-50 text-teal-800 border-teal-300'
            }`}>
              AI
            </span>
          </div>
          <div className={`text-[11px] ${isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}`}>
            Forensics & Intelligence
          </div>
        </div>
      </div>

      {/* Nav Items List */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
        <div className={`hidden md:block group-hover:block px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${
          isDarkMode ? 'text-[#86989f]' : 'text-slate-400'
        }`}>
          Investigation Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          let btnClass = '';
          if (isActive) {
            btnClass = isDarkMode
              ? 'bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6] shadow-sm'
              : 'bg-teal-700 text-white shadow-md border border-teal-800';
          } else {
            btnClass = isDarkMode
              ? 'text-[#86989f] hover:text-[#d6e1e5] hover:bg-[#1a2327] border border-transparent'
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
                    ? 'text-[#2ec4b6]' 
                    : isDarkMode 
                    ? 'text-[#86989f] group-hover/btn:text-[#2ec4b6]' 
                    : 'text-slate-500 group-hover/btn:text-teal-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="hidden md:block group-hover:block text-left overflow-hidden whitespace-nowrap">
                  <div className={`text-xs font-semibold ${
                    isActive 
                      ? 'text-[#2ec4b6]' 
                      : isDarkMode 
                      ? 'text-[#d6e1e5]' 
                      : 'text-slate-800'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] ${
                    isActive 
                      ? 'text-[#2ec4b6]/80' 
                      : isDarkMode 
                      ? 'text-[#86989f]' 
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
                        ? 'bg-[#141a1d] text-[#2ec4b6] border border-[#2ec4b6]/60' 
                        : 'bg-teal-800 text-teal-100'
                      : isDarkMode 
                        ? 'bg-[#1a2327] text-[#86989f] border border-[#25323a]' 
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
        isDarkMode ? 'border-[#25323a]' : 'border-slate-200'
      }`}>
        <div className={`hidden md:block group-hover:block rounded-xl p-2.5 border ${
          isDarkMode 
            ? 'bg-[#141a1d] border-[#25323a]' 
            : 'bg-slate-50 border-slate-200 shadow-inner'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className={`font-medium flex items-center gap-1.5 ${
              isDarkMode ? 'text-[#86989f]' : 'text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#2ec4b6] animate-pulse' : 'bg-[#e5534b]'}`} />
              System Status
            </span>
            <span className="font-mono text-[#2ec4b6] font-bold text-[10px]">OPERATIONAL</span>
          </div>
          <p className={`text-[10px] font-mono truncate ${
            isDarkMode ? 'text-[#86989f]' : 'text-slate-400'
          }`}>
            FastAPI · SQLite · Leaflet
          </p>
        </div>
      </div>

    </aside>
  );
};
