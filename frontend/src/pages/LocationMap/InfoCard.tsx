import React from 'react';
import { ExternalLink, ShieldAlert, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { EventRecord, FocusState, SearchArea, NearbyRecord } from './types';
import { SRC, fmt } from './geoUtils';
import { Legend } from './Legend';

interface InfoCardProps {
  focus: FocusState;
  area: SearchArea | null;
  radius: number;
  nearbyRecords: NearbyRecord[];
  selectedPerson: string;
  allEvents: EventRecord[];
  onSelectRecord: (record: EventRecord) => void;
  onOpenVoiceAnalysis: (event: EventRecord) => void;
  isDarkMode?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  focus,
  area,
  radius,
  nearbyRecords,
  selectedPerson,
  allEvents,
  onSelectRecord,
  onOpenVoiceAnalysis,
  isDarkMode = true,
}) => {
  const personRecords = selectedPerson
    ? allEvents.filter((e) => e.caller_id === selectedPerson)
    : [];
  const personWithCoords = personRecords.filter((e) => e.lat !== null && e.lng !== null);

  const getVerdictBadge = (verdict?: string | null, score?: number | null) => {
    if (!verdict) return null;
    const isHigh = verdict.includes('HIGH') || (score && score > 0.7);
    const isMed = verdict.includes('REVIEW') || verdict.includes('AMBER') || (score && score >= 0.35);

    if (isHigh) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#e5534b]/20 border border-[#e5534b]/60 text-[#e5534b]">
          <ShieldAlert className="w-3 h-3" />
          {verdict} {score ? `(${Math.round(score * 100)}%)` : ''}
        </span>
      );
    }
    if (isMed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#f0a73a]/20 border border-[#f0a73a]/60 text-[#f0a73a]">
          <AlertTriangle className="w-3 h-3" />
          {verdict} {score ? `(${Math.round(score * 100)}%)` : ''}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#2ec4b6]/20 border border-[#2ec4b6]/60 text-[#2ec4b6]">
        <CheckCircle2 className="w-3 h-3" />
        {verdict}
      </span>
    );
  };

  return (
    <aside
      aria-live="polite"
      className={`absolute left-3 top-28 z-10 w-[350px] max-h-[calc(100%-140px)] overflow-y-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all text-xs space-y-4 max-[760px]:left-2 max-[760px]:right-2 max-[760px]:top-auto max-[760px]:bottom-6 max-[760px]:w-auto max-[760px]:max-h-[44%] ${
        isDarkMode
          ? 'bg-[#141a1d]/95 border-[#25323a] text-[#d6e1e5]'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      {/* 1. Place Search Focus */}
      {focus && focus.type === 'place' && area && (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">Search area</h2>
            <div className="text-xs text-[#86989f] mt-0.5 leading-relaxed break-words">
              {area.name}
            </div>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 py-2 border-y border-[#25323a]/50 text-xs">
            <dt className="text-[#86989f]">Type</dt>
            <dd className="font-mono">{area.type}</dd>
            <dt className="text-[#86989f]">Centre</dt>
            <dd className="font-mono">
              {focus.lat.toFixed(5)}, {focus.lng.toFixed(5)}
            </dd>
            <dt className="text-[#86989f]">Boundary</dt>
            <dd className="font-mono">
              {area.geo ? 'Drawn on the map' : `Point only. Using ${fmt(radius)} radius`}
            </dd>
          </dl>

          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#86989f]">
              Case records {area.geo ? 'inside this area' : `within ${fmt(radius)}`}
            </h3>
            {nearbyRecords.length > 0 ? (
              <div className="space-y-1.5">
                {nearbyRecords.map((o) => (
                  <div
                    key={o.e.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      isDarkMode ? 'bg-[#1a2327]/60 border-[#25323a]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs">{o.e.id}</div>
                      <div className="text-[11px] text-[#86989f]">
                        {o.e.caller_id} · {fmt(o.d)} from centre
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectRecord(o.e)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#2ec4b6]/20 hover:bg-[#2ec4b6] text-[#2ec4b6] hover:text-[#0d1113] transition-colors"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[#86989f] italic py-1">
                No case records with coordinates here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Event Record Focus */}
      {focus && focus.type === 'rec' && focus.e && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-bold font-mono tracking-tight">{focus.e.id}</h2>
              <div className="text-xs text-[#86989f] mt-0.5">{focus.e.case_id}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-[#0d1113]"
                style={{ backgroundColor: SRC[focus.e.location_source]?.color || '#8fb3c9' }}
              >
                {SRC[focus.e.location_source]?.label || focus.e.location_source}
              </span>
              {getVerdictBadge(focus.e.verdict, focus.e.risk_score)}
            </div>
          </div>

          {/* Location status or Unavailable notice */}
          {focus.e.lat !== null && focus.e.lng !== null ? (
            <div className="text-xs font-medium text-[#86989f]">
              <span className="text-[#f0a73a] font-bold">Radius {fmt(radius)}</span> ·{' '}
              {nearbyRecords.length} other record{nearbyRecords.length === 1 ? '' : 's'} inside
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-[#e5534b]/15 border border-[#e5534b]/40 text-[#f3b8b4] leading-relaxed">
              <strong className="block text-[#e5534b] font-bold mb-0.5">Location unavailable.</strong>
              No authorised location record exists for this event, so nothing is placed on the map.
            </div>
          )}

          {/* Record Metadata Details */}
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 py-2 border-y border-[#25323a]/50 text-xs">
            <dt className="text-[#86989f]">Person</dt>
            <dd className="font-semibold">{focus.e.caller_id}</dd>
            <dt className="text-[#86989f]">Time</dt>
            <dd className="font-mono">{focus.e.timestamp}</dd>
            <dt className="text-[#86989f]">Direction</dt>
            <dd>{focus.e.direction}</dd>
            <dt className="text-[#86989f]">Status</dt>
            <dd>{focus.e.status}</dd>
            <dt className="text-[#86989f]">Coordinates</dt>
            <dd className="font-mono">
              {focus.e.lat !== null && focus.e.lng !== null
                ? `${focus.e.lat.toFixed(5)}, ${focus.e.lng.toFixed(5)}`
                : 'Not available'}
            </dd>
          </dl>

          {/* Open voice analysis action */}
          <button
            onClick={() => onOpenVoiceAnalysis(focus.e)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs shadow-md hover:shadow-glow-teal transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open voice analysis</span>
          </button>

          {/* Nearby records within radius */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#86989f]">
              Other records within {fmt(radius)}
            </h3>
            {focus.e.lat !== null && focus.e.lng !== null ? (
              nearbyRecords.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {nearbyRecords.map((o) => (
                    <div
                      key={o.e.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                        isDarkMode ? 'bg-[#1a2327]/60 border-[#25323a]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold">{o.e.id}</div>
                        <div className="text-[11px] text-[#86989f]">{fmt(o.d)} away</div>
                      </div>
                      <button
                        onClick={() => onSelectRecord(o.e)}
                        className="px-2 py-0.5 text-xs font-semibold rounded bg-[#2ec4b6]/20 hover:bg-[#2ec4b6] text-[#2ec4b6] hover:text-[#0d1113] transition-colors"
                      >
                        select
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[#86989f] italic">None.</div>
              )
            ) : (
              <div className="text-[#86989f] italic">
                Needs coordinates from an authorised source.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Default Earth View */}
      {(!focus || (focus.type === 'rec' && !focus.e)) && (
        <div className="space-y-2">
          <h2 className="text-base font-bold tracking-tight">Earth view</h2>
          <p className="text-xs text-[#86989f] leading-relaxed">
            Search any place, city or area on Earth to fly there and see its boundary. Pick a case
            record to see its radius. Choose a caller to see all of that caller's recorded
            locations in time order.
          </p>
        </div>
      )}

      {/* 4. Active Person Track Summary */}
      {selectedPerson && (
        <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
          isDarkMode ? 'bg-[#1a2327]/60 border-[#25323a]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="font-bold text-[#8fb3c9]">{selectedPerson}: recorded locations</div>
          <div className="text-[#86989f] text-[11px]">
            {personWithCoords.length} of {personRecords.length} records have a location
            {personWithCoords.length > 1
              ? '. Dashed line on map shows the order in time.'
              : '.'}
          </div>
        </div>
      )}

      {/* 5. Map Legend */}
      <div className="pt-2 border-t border-[#25323a]/50">
        <Legend isDarkMode={isDarkMode} />
      </div>

      {/* 6. Legal and Safety Disclaimer (Preserved verbatim from reference file) */}
      <div className="pt-2 border-t border-[#25323a]/50 text-[11px] text-[#86989f] leading-relaxed space-y-1">
        <div className="font-bold text-[#f0a73a]/90 flex items-center gap-1">
          <span>⚠️</span> Safety & Privacy Notice
        </div>
        <div>
          This tool only shows places you search and location records attached to cases from
          authorised sources. It cannot find a person from a name, phone number, voice or IP
          address. Radius and area filtering does not show that anyone was at a point or
          committed a crime. Records here are DEMO DATA.
        </div>
      </div>
    </aside>
  );
};
