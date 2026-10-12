import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { GeocodePlace } from './types';
import { api } from '../../services/api';

interface SearchBarProps {
  onSelectPlace: (place: GeocodePlace) => void;
  isDarkMode?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectPlace, isDarkMode = true }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GeocodePlace[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close results popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError(null);
    setIsOpen(true);
    setResults([]);

    try {
      const data = await api.geocode(trimmed);
      setResults(data);
      if (data.length === 1) {
        onSelectPlace(data[0]);
        setIsOpen(false);
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handlePick = (place: GeocodePlace) => {
    onSelectPlace(place);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="absolute left-3 top-3 z-20 w-[min(440px,calc(100%-80px))]">
      {/* Search Input Bar */}
      <div
        className={`flex items-center px-3.5 py-1.5 rounded-full border shadow-xl transition-all ${
          isDarkMode
            ? 'bg-[#141a1d]/95 border-[#25323a] text-[#d6e1e5] focus-within:border-[#2ec4b6]'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-md focus-within:border-teal-600'
        }`}
      >
        <Search className={`w-4 h-4 shrink-0 mr-2 ${isDarkMode ? 'text-[#86989f]' : 'text-slate-400'}`} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search any place, city or area on Earth"
          aria-label="Search places"
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-inherit placeholder:text-muted/60"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="ml-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
        >
          {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Search</span>
        </button>
      </div>

      {/* Suggestion Dropdown Listbox */}
      {isOpen && (
        <div
          role="listbox"
          className={`mt-1.5 max-h-60 overflow-y-auto rounded-xl border p-1 shadow-2xl backdrop-blur-md ${
            isDarkMode
              ? 'bg-[#141a1d]/95 border-[#25323a] text-[#d6e1e5]'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-lg'
          }`}
        >
          {isSearching && (
            <div className="p-3 text-xs text-[#86989f] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2ec4b6]" />
              <span>Searching OpenStreetMap Nominatim...</span>
            </div>
          )}

          {!isSearching && searchError && (
            <div className="p-3 text-xs text-[#e5534b]">
              Search error ({searchError}). Please check connection and try again.
            </div>
          )}

          {!isSearching && !searchError && results.length === 0 && (
            <div className="p-3 text-xs text-[#86989f]">
              No places found. Try adding the country or checking spelling.
            </div>
          )}

          {!isSearching &&
            results.map((place, idx) => {
              const shortName = place.display_name.split(',').slice(0, 2).join(',');
              return (
                <div
                  key={place.place_id || idx}
                  tabIndex={0}
                  role="option"
                  aria-selected={false}
                  onClick={() => handlePick(place)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePick(place);
                  }}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs outline-none ${
                    isDarkMode
                      ? 'hover:bg-[#1a2327] focus:bg-[#1a2327]'
                      : 'hover:bg-slate-100 focus:bg-slate-100'
                  }`}
                >
                  <div className="font-semibold">{shortName}</div>
                  <small className="block truncate text-[#86989f] mt-0.5">{place.display_name}</small>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
