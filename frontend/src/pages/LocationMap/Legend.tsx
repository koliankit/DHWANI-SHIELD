import React from 'react';
import { SRC } from './geoUtils';
import { LocationSource } from './types';

interface LegendProps {
  isDarkMode?: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isDarkMode = true }) => {
  const sources: LocationSource[] = ['VERIFIED', 'ESTIMATED', 'SAMPLE', 'UNAVAILABLE'];

  return (
    <div className="space-y-2 text-xs">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#86989f]">
        Legend
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-[#86989f]">
        {sources.map((srcKey) => (
          <div key={srcKey} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{ backgroundColor: SRC[srcKey].color }}
            />
            <span className={isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-800'}>
              {SRC[srcKey].label}
              {srcKey === 'VERIFIED' && ' (none in demo)'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-[#2ec4b6] font-bold">▭</span>
          <span className={isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-800'}>Search area</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#f0a73a] font-bold">○</span>
          <span className={isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-800'}>Radius</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#8fb3c9] font-bold">╌╌</span>
          <span className={isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-800'}>Time track</span>
        </div>
      </div>
    </div>
  );
};
