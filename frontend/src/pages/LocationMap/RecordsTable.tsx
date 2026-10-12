import React, { useState } from 'react';
import { Search, MapPinOff } from 'lucide-react';
import { EventRecord } from './types';
import { SRC } from './geoUtils';

interface RecordsTableProps {
  events: EventRecord[];
  selectedEventId?: string | null;
  onSelectRecord: (event: EventRecord) => void;
  isDarkMode?: boolean;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  events,
  selectedEventId,
  onSelectRecord,
  isDarkMode = true,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredEvents = events.filter((e) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      e.id.toLowerCase().includes(q) ||
      e.case_id.toLowerCase().includes(q) ||
      e.caller_id.toLowerCase().includes(q) ||
      e.direction.toLowerCase().includes(q) ||
      e.location_source.toLowerCase().includes(q) ||
      e.status.toLowerCase().includes(q) ||
      (e.verdict && e.verdict.toLowerCase().includes(q))
    );
  });

  return (
    <section
      className={`mx-3 my-3 p-4 rounded-2xl border shadow-xl transition-all ${
        isDarkMode
          ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5]'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-wide">Case records</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a2327] border border-[#25323a] text-[#86989f]">
            {filteredEvents.length} of {events.length} records
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f0a73a]/15 text-[#f0a73a] border border-[#f0a73a]/40">
            DEMO DATA
          </span>
        </div>

        {/* Filter Input */}
        <div
          className={`flex items-center px-3 py-1 rounded-full border text-xs ${
            isDarkMode
              ? 'bg-[#1a2327] border-[#25323a] text-[#d6e1e5] focus-within:border-[#2ec4b6]'
              : 'bg-slate-100 border-slate-300 text-slate-800 focus-within:border-teal-600'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#86989f] mr-1.5" />
          <input
            type="search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter records..."
            aria-label="Filter records"
            className="bg-transparent border-0 outline-none text-xs w-44 placeholder:text-muted/60"
          />
        </div>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#25323a] text-[#86989f] font-semibold">
              <th className="py-2.5 px-3">Event ID</th>
              <th className="py-2.5 px-3">Case ID</th>
              <th className="py-2.5 px-3">Person</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Location source</th>
              <th className="py-2.5 px-3">Coordinates</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Detection Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#25323a]/50">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((e) => {
                const isSelected = selectedEventId === e.id;
                const hasLoc = e.lat !== null && e.lng !== null;
                const srcMeta = SRC[e.location_source] || {
                  label: e.location_source,
                  color: '#8fb3c9',
                };

                return (
                  <tr
                    key={e.id}
                    tabIndex={0}
                    onClick={() => onSelectRecord(e)}
                    onKeyDown={(evt) => {
                      if (evt.key === 'Enter') onSelectRecord(e);
                    }}
                    className={`cursor-pointer transition-colors outline-none ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-[#12312f] text-white font-medium'
                          : 'bg-teal-50 text-teal-900 font-medium'
                        : isDarkMode
                        ? 'hover:bg-[#1a2327]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold">{e.id}</td>
                    <td className="py-2.5 px-3 font-mono text-[#86989f]">{e.case_id}</td>
                    <td className="py-2.5 px-3 font-medium">{e.caller_id}</td>
                    <td className="py-2.5 px-3 font-mono text-[#86989f]">{e.timestamp}</td>
                    <td className="py-2.5 px-3">{e.direction}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-[#0d1113]"
                        style={{ backgroundColor: srcMeta.color }}
                      >
                        {srcMeta.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {hasLoc ? (
                        <span>
                          {e.lat?.toFixed(4)}, {e.lng?.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-[#e5534b] flex items-center gap-1">
                          <MapPinOff className="w-3 h-3" />
                          Unavailable
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{e.status}</td>
                    <td className="py-2.5 px-3">
                      {e.verdict ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.verdict.includes('HIGH')
                              ? 'bg-[#e5534b]/20 text-[#e5534b]'
                              : e.verdict.includes('REVIEW')
                              ? 'bg-[#f0a73a]/20 text-[#f0a73a]'
                              : 'bg-[#2ec4b6]/20 text-[#2ec4b6]'
                          }`}
                        >
                          {e.verdict}
                        </span>
                      ) : (
                        <span className="text-[#86989f]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-6 text-center text-[#86989f]">
                  No records match filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
