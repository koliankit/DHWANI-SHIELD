import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useEvents } from './useEvents';
import { EarthMap } from './EarthMap';
import { SearchBar } from './SearchBar';
import { RadiusChips } from './RadiusChips';
import { InfoCard } from './InfoCard';
import { RecordsTable } from './RecordsTable';
import { EventRecord, FocusState, SearchArea, GeocodePlace, NearbyRecord } from './types';
import { hav, inGeo, zoomFor } from './geoUtils';

interface LocationMapProps {
  onNavigateToVoiceForensics?: (caseCode: string, evidenceId?: string, locationSource?: string) => void;
  isDarkMode?: boolean;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  onNavigateToVoiceForensics,
  isDarkMode = true,
}) => {
  const { events, loading, error } = useEvents();

  let searchParams: URLSearchParams;
  let setSearchParams: any;
  try {
    [searchParams, setSearchParams] = useSearchParams();
  } catch {
    // Fallback if router context is mounting
    searchParams = new URLSearchParams(window.location.search);
    setSearchParams = () => {};
  }

  const navigate = useNavigate ? (() => {
    try {
      return useNavigate();
    } catch {
      return null;
    }
  })() : null;

  const [focus, setFocus] = useState<FocusState>(null);
  const [area, setArea] = useState<SearchArea | null>(null);
  const [radius, setRadius] = useState<number>(1000);
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  const stageRef = useRef<HTMLDivElement>(null);

  // Available callers list
  const availablePersons = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.caller_id))).filter(Boolean);
  }, [events]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pick Event Record
  const pickRecord = useCallback((e: EventRecord) => {
    setArea(null);
    const hasCoords = e.lat !== null && e.lng !== null;
    setFocus(
      hasCoords
        ? { type: 'rec', e, lat: e.lat, lng: e.lng }
        : { type: 'rec', e, lat: null }
    );

    // Update URL query parameter
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('event', e.id);
      window.history.replaceState({}, '', url.toString());
    } catch {}

    // Focus camera on marker
    if (hasCoords) {
      const mapContainer = stageRef.current;
      const stageWidth = mapContainer ? mapContainer.clientWidth : 800;
      const zoom = zoomFor(radius, e.lat as number, stageWidth);

      // Trigger map flight via CustomEvent or direct camera
      window.dispatchEvent(
        new CustomEvent('map:flyTo', {
          detail: {
            center: [e.lng, e.lat],
            zoom,
            pitch: 55,
            duration: prefersReducedMotion ? 0 : 2400,
          },
        })
      );
    }
  }, [radius, prefersReducedMotion]);

  // Deep-linking: support ?event=EVT-0001
  useEffect(() => {
    if (events.length === 0) return;

    const eventParam = searchParams.get('event');
    if (eventParam) {
      const found = events.find((e) => e.id.toUpperCase() === eventParam.toUpperCase());
      if (found) {
        pickRecord(found);
      }
    }
  }, [events, searchParams, pickRecord]);

  // Pick Place from Nominatim Search
  const pickPlace = useCallback((p: GeocodePlace) => {
    const geo =
      p.geojson && /Polygon/.test(p.geojson.type) ? p.geojson : null;
    const [s, n, w, e] = (p.boundingbox || []).map(Number);
    const lat = parseFloat(p.lat);
    const lon = parseFloat(p.lon);

    setArea({
      name: p.display_name,
      type: p.addresstype || p.type || 'place',
      geo,
    });
    setFocus({ type: 'place', lat, lng: lon });

    // Fly / FitBounds camera
    if (geo || n - s > 0.002) {
      window.dispatchEvent(
        new CustomEvent('map:fitBounds', {
          detail: {
            bounds: [[w, s], [e, n]],
            padding: 70,
            pitch: 50,
            duration: prefersReducedMotion ? 0 : 2600,
            maxZoom: 16,
          },
        })
      );
    } else {
      const mapContainer = stageRef.current;
      const stageWidth = mapContainer ? mapContainer.clientWidth : 800;
      const zoom = zoomFor(radius, lat, stageWidth);
      window.dispatchEvent(
        new CustomEvent('map:flyTo', {
          detail: {
            center: [lon, lat],
            zoom,
            pitch: 50,
            duration: prefersReducedMotion ? 0 : 2400,
          },
        })
      );
    }
  }, [radius, prefersReducedMotion]);

  // Radius preset selection
  const handleSelectRadius = (r: number) => {
    setRadius(r);
    if (focus && focus.lat !== null && focus.lng !== undefined && focus.lng !== null && !(area && area.geo)) {
      const mapContainer = stageRef.current;
      const stageWidth = mapContainer ? mapContainer.clientWidth : 800;
      const zoom = zoomFor(r, focus.lat, stageWidth);
      window.dispatchEvent(
        new CustomEvent('map:flyTo', {
          detail: {
            center: [focus.lng, focus.lat],
            zoom,
            pitch: 55,
            duration: prefersReducedMotion ? 0 : 2400,
          },
        })
      );
    }
  };

  // Person filter selection
  const handleSelectPerson = (person: string) => {
    setSelectedPerson(person);
    if (person) {
      const withCoords = events.filter(
        (e) => e.caller_id === person && e.lat !== null && e.lng !== null
      );
      if (withCoords.length > 0) {
        let minLng = 180,
          minLat = 90,
          maxLng = -180,
          maxLat = -90;
        withCoords.forEach((e) => {
          if (e.lng! < minLng) minLng = e.lng!;
          if (e.lat! < minLat) minLat = e.lat!;
          if (e.lng! > maxLng) maxLng = e.lng!;
          if (e.lat! > maxLat) maxLat = e.lat!;
        });

        window.dispatchEvent(
          new CustomEvent('map:fitBounds', {
            detail: {
              bounds: [[minLng, minLat], [maxLng, maxLat]],
              padding: 90,
              pitch: 35,
              duration: prefersReducedMotion ? 0 : 2600,
              maxZoom: 8,
            },
          })
        );
      }
    }
  };

  // Calculate nearby records within radius or polygon
  const nearbyRecords: NearbyRecord[] = useMemo(() => {
    if (!focus || focus.lat === null || focus.lng === undefined || focus.lng === null) {
      return [];
    }
    const hasPolygon = focus.type === 'place' && area && area.geo;

    return events
      .filter(
        (e) =>
          e.lat !== null &&
          e.lng !== null &&
          !(focus.type === 'rec' && focus.e && focus.e.id === e.id) &&
          (!selectedPerson || e.caller_id === selectedPerson)
      )
      .map((e) => ({
        e,
        d: hav(focus.lat as number, focus.lng as number, e.lat as number, e.lng as number),
      }))
      .filter((o) =>
        hasPolygon
          ? inGeo(o.e.lng as number, o.e.lat as number, area.geo)
          : o.d <= radius
      )
      .sort((a, b) => a.d - b.d);
  }, [events, focus, area, radius, selectedPerson]);

  // Navigate to voice analysis
  const handleOpenVoiceAnalysis = (record: EventRecord) => {
    if (onNavigateToVoiceForensics) {
      onNavigateToVoiceForensics(record.case_id, record.id, record.location_source);
    }
    if (navigate) {
      navigate('/?tab=voice_analysis', {
        state: {
          eventId: record.id,
          caseId: record.case_id,
          locationSource: record.location_source,
        },
      });
    }
  };

  return (
    <div className={`flex flex-col flex-1 min-w-0 ${isDarkMode ? 'bg-[#0d1113]' : 'bg-slate-100'}`}>
      {/* 3D Earth Map Stage */}
      <div ref={stageRef} className="relative w-full h-[72vh] min-h-[560px]">
        {/* MapLibre 3D Globe */}
        <EarthMap
          events={events}
          focus={focus}
          area={area}
          radius={radius}
          selectedPerson={selectedPerson}
          onSelectRecord={pickRecord}
          isDarkMode={isDarkMode}
        />

        {/* Place Search Bar */}
        <SearchBar onSelectPlace={pickPlace} isDarkMode={isDarkMode} />

        {/* Radius Chips & Caller Selector */}
        <RadiusChips
          currentRadius={radius}
          onSelectRadius={handleSelectRadius}
          selectedPerson={selectedPerson}
          onSelectPerson={handleSelectPerson}
          availablePersons={availablePersons}
          isDarkMode={isDarkMode}
        />

        {/* Side Info Card / Mobile Bottom Sheet */}
        <InfoCard
          focus={focus}
          area={area}
          radius={radius}
          nearbyRecords={nearbyRecords}
          selectedPerson={selectedPerson}
          allEvents={events}
          onSelectRecord={pickRecord}
          onOpenVoiceAnalysis={handleOpenVoiceAnalysis}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Synchronized Case Records Table */}
      <RecordsTable
        events={events}
        selectedEventId={focus && focus.type === 'rec' && focus.e ? focus.e.id : null}
        onSelectRecord={(rec) => {
          pickRecord(rec);
          window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default LocationMap;
