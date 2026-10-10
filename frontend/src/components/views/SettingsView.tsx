import React, { useState } from 'react';
import { Settings, Shield, HardDrive, Bell, Check, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [sensitivity, setSensitivity] = useState<'strict' | 'balanced' | 'relaxed'>('balanced');
  const [autoDeleteAudio, setAutoDeleteAudio] = useState(true);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [backendUrl, setBackendUrl] = useState('http://127.0.0.1:8000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent-electric" />
          System Settings & Defense Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure acoustic sensitivity, privacy policies, and threat thresholds
        </p>
      </div>

      <div className="space-y-4">
        {/* Sensitivity */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-accent-electric" />
            <h3 className="text-sm font-bold text-white">Detection Sensitivity Profile</h3>
          </div>
          <p className="text-xs text-slate-400">
            Adjust the threshold required to categorize synthetic speech and fraud intent.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { id: 'relaxed', label: 'Relaxed (60%)', desc: 'Fewer false positives on low-quality line audio' },
              { id: 'balanced', label: 'Balanced (70%)', desc: 'Standard production fintech threshold' },
              { id: 'strict', label: 'Strict (80%)', desc: 'Maximum sensitivity for high-value transactions' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSensitivity(s.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sensitivity === s.id
                    ? 'bg-accent-blue/15 border-accent-blue/50 text-white shadow-glow-blue'
                    : 'bg-bg-deep border-border-subtle text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-white mb-1">{s.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Retention */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Data Privacy & Local Storage</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-deep border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">Ephemeral Audio Disposal</div>
              <div className="text-[11px] text-slate-400">
                Immediately delete temporary uploaded audio files after computing features.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoDeleteAudio}
                onChange={(e) => setAutoDeleteAudio(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-deep border border-border-subtle">
            <div>
              <div className="text-xs font-semibold text-slate-200">Critical Threat Alerting</div>
              <div className="text-[11px] text-slate-400">
                Display immediate full-screen modal alert when HIGH RISK composite scam is detected.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCritical}
                onChange={(e) => setNotifyCritical(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-blue"></div>
            </label>
          </div>
        </div>

        {/* API Connection */}
        <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle shadow-md space-y-3">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Backend Connection URI</h3>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1.5 font-medium">FastAPI Server Endpoint</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full bg-bg-deep rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 border border-border-subtle focus:outline-none focus:border-accent-blue"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-glow-blue"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
