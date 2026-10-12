import React from 'react';
import { RADIUS_PRESETS, fmt } from './geoUtils';

interface RadiusChipsProps {
  currentRadius: number;
  onSelectRadius: (radius: number) => void;
  selectedPerson: string;
  onSelectPerson: (person: string) => void;
  availablePersons: string[];
  isDarkMode?: boolean;
}

export const RadiusChips: React.FC<RadiusChipsProps> = ({
  currentRadius,
  onSelectRadius,
  selectedPerson,
  onSelectPerson,
  availablePersons,
  isDarkMode = true,
}) => {
  return (
    <div
      role="group"
      aria-label="Radius and person filters"
      className="absolute left-3 top-14 right-20 z-10 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none pointer-events-auto"
    >
      {/* Radius Preset Chips */}
      {RADIUS_PRESETS.map((p) => {
        const isSelected = p === currentRadius;
        return (
          <button
            key={p}
            onClick={() => onSelectRadius(p)}
            aria-pressed={isSelected}
            className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
              isSelected
                ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6] font-semibold shadow-sm'
                : isDarkMode
                ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#d6e1e5]'
                : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            {fmt(p)}
          </button>
        );
      })}

      {/* Caller Filter Dropdown */}
      <select
        aria-label="Filter by person"
        value={selectedPerson}
        onChange={(e) => onSelectPerson(e.target.value)}
        className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border outline-none cursor-pointer transition-all ${
          selectedPerson
            ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6] font-semibold'
            : isDarkMode
            ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#d6e1e5]'
            : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-800'
        }`}
      >
        <option value="">All callers</option>
        {availablePersons.map((person) => (
          <option key={person} value={person}>
            {person}
          </option>
        ))}
      </select>
    </div>
  );
};
