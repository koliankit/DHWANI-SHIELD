import React, { useState, useEffect } from 'react';
import { History, Search, Download, Trash2, ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { HistoryItem } from '../../types';
import { api } from '../../services/api';

interface Props {
  onLoadAnalysis: (analysisId: string) => void;
}

export const HistoryView: React.FC<Props> = ({ onLoadAnalysis }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const items = await api.getHistory(50, riskFilter, search);
      setHistoryItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis record?')) return;
    try {
      await api.deleteHistory(id);
      setHistoryItems(historyItems.filter((i) => i.analysis_id !== id));
    } catch (err) {
      alert('Failed to delete analysis record.');
    }
  };

  const handleDownloadPdf = (id: string, filename: string) => {
    api.downloadPdfReport(id, `VoiceGuard_${filename.replace(/\.[^/.]+$/, '')}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-accent-electric" />
            Analysis History & Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted forensic records stored in local SQLite database
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-bg-card rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 border border-border-subtle focus:outline-none focus:border-accent-blue w-48 placeholder:text-slate-400"
            />
          </form>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-bg-card rounded-xl px-3 py-1.5 text-xs text-slate-200 border border-border-subtle focus:outline-none focus:border-accent-blue"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH RISK">High Risk</option>
            <option value="VERIFY">Verify</option>
            <option value="LOW RISK">Low Risk</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle shadow-md overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs">Loading historical records...</p>
          </div>
        ) : historyItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-bg-deep text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-border-subtle">
                <tr>
                  <th className="py-3 px-4">Recording</th>
                  <th className="py-3 px-4">Synthetic Score</th>
                  <th className="py-3 px-4">Scam Indicators</th>
                  <th className="py-3 px-4">Risk Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {historyItems.map((item) => {
                  const isHigh = item.overall_risk === 'HIGH RISK';
                  const isVerify = item.overall_risk === 'VERIFY';
                  const badgeClass = isHigh
                    ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                    : isVerify
                    ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';

                  const RiskIcon = isHigh ? ShieldAlert : isVerify ? AlertTriangle : ShieldCheck;

                  return (
                    <tr key={item.analysis_id} className="hover:bg-bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white truncate max-w-[200px]">
                          {item.filename}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.audio_duration_seconds.toFixed(1)}s • ID: {item.analysis_id.slice(0, 8)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-200">
                          {(item.synthetic_speech_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">{item.authenticity_label}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-200">
                          {item.scam_indicators_count} Flags
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          <RiskIcon className="w-2.5 h-2.5" />
                          {item.overall_risk}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onLoadAnalysis(item.analysis_id)}
                            className="p-1.5 rounded-lg bg-accent-blue/15 hover:bg-accent-blue text-accent-electric hover:text-white border border-accent-blue/30 transition-colors"
                            title="Open in Dashboard"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(item.analysis_id, item.filename)}
                            className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-cardHover text-slate-300 hover:text-white border border-border-subtle transition-colors"
                            title="Export PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.analysis_id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-200">No Analysis History Records Found</p>
            <p className="text-[11px] text-slate-400">Upload or run quick tests from the dashboard to populate audit logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};
