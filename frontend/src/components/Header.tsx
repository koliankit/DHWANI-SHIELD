import React from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Radio, 
  Bell, 
  Sun,
  Moon,
  Upload,
  MapPin
} from 'lucide-react';
import { ActiveNavTab } from '../types';

interface Props {
  activeTab: ActiveNavTab;
  onRefresh?: () => void;
  isAnalyzing: boolean;
  onTabChange?: (tab: ActiveNavTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<Props> = ({ 
  activeTab, 
  onRefresh, 
  isAnalyzing,
  onTabChange,
  isDarkMode,
  onToggleTheme
}) => {
  return (
    <header className={`px-5 py-2.5 sticky top-0 z-30 flex items-center justify-between select-none backdrop-blur-md transition-colors duration-200 border-b ${
      isDarkMode 
        ? 'bg-[#141a1d]/95 border-[#25323a] text-[#d6e1e5]' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      
      {/* Left: Brand & Breadcrumbs */}
      <div className="flex items-center gap-6">
        {/* Identity Shield Brand Logo */}
        <div 
          onClick={() => onTabChange?.('voice_analysis')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#2ec4b6] flex items-center justify-center text-[#0d1113] font-black shadow-glow-teal border border-[#2ec4b6]/40 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4 text-[#0d1113] stroke-[2.5]" />
          </div>
          <span className={`font-bold text-sm tracking-wide transition-colors ${
            isDarkMode ? 'text-[#d6e1e5] group-hover:text-[#2ec4b6]' : 'text-slate-900 group-hover:text-teal-700'
          }`}>
            Identity Shield
          </span>
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          {activeTab === 'voice_analysis' ? (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Cases</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-700'}`}>Case #V-0884</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>Voice Analysis</span>
            </>
          ) : activeTab === 'geospatial' ? (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Investigation</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-700'}`}>Case #7502 (CDR)</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>Location Intelligence</span>
            </>
          ) : activeTab === 'new_analysis' ? (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Intake</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>New Intake & Audio Upload</span>
            </>
          ) : activeTab === 'dashboard' ? (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Threat Defense</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>Scam & Fraud Scanner</span>
            </>
          ) : activeTab === 'history' ? (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Audit Logs</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>Analysis History</span>
            </>
          ) : activeTab === 'models' ? (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Architecture</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>AI Models & Engines</span>
            </>
          ) : (
            <>
              <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>System</span>
              <span className={isDarkMode ? 'text-[#25323a]' : 'text-slate-400'}>/</span>
              <span className={`font-semibold ${isDarkMode ? 'text-[#2ec4b6]' : 'text-teal-700'}`}>Settings</span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Status, Bell & User Avatar */}
      <div className="flex items-center gap-3">
        
        {/* DAY / DARK MODE TOGGLE SWITCH */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Day / Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all duration-150 ${
            isDarkMode 
              ? 'bg-[#1a2327] hover:bg-[#25323a] border-[#25323a] text-[#f0a73a] hover:text-white shadow-sm' 
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm'
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#f0a73a] animate-spin-slow" />
              <span>Day Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Compliance / Live indicator */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
          isDarkMode 
            ? 'bg-[#1a2327] border-[#25323a] text-[#d6e1e5]' 
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ec4b6] animate-pulse" />
          <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>ECAPA-TDNN</span>
          <span className="text-[#2ec4b6] font-semibold">LIVE</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isAnalyzing}
            title="Refresh System Status"
            className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-[#1a2327] hover:bg-[#25323a] text-[#86989f] hover:text-[#d6e1e5] border-[#25323a]' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-[#2ec4b6]' : ''}`} />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            title="Forensic Notifications"
            className={`p-1.5 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-[#1a2327] hover:bg-[#25323a] text-[#86989f] hover:text-[#d6e1e5] border-[#25323a]' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e5534b] border border-[#0d1113]" />
        </div>

        {/* User Profile Avatar circle JS */}
        <div className="flex items-center gap-2">
          <div 
            title="Security Analyst: JS"
            className="w-7 h-7 rounded-full bg-[#12312f] border border-[#2ec4b6]/60 flex items-center justify-center text-[#2ec4b6] font-bold text-xs shadow cursor-pointer hover:ring-2 hover:ring-[#2ec4b6]/50 transition-all select-none"
          >
            JS
          </div>
        </div>
      </div>

    </header>
  );
};
