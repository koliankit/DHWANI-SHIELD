import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { EventRecord, FocusState, SearchArea } from './types';
import { SRC, circle, EMPTY_GEOJSON, zoomFor } from './geoUtils';

const STYLE_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';
const OSM_FALLBACK_STYLE: any = {
  version: 8,
  sources: {
    o: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'o', type: 'raster', source: 'o' }],
};

interface EarthMapProps {
  events: EventRecord[];
  focus: FocusState;
  area: SearchArea | null;
  radius: number;
  selectedPerson: string;
  onSelectRecord: (record: EventRecord) => void;
  isDarkMode?: boolean;
}

export const EarthMap: React.FC<EarthMapProps> = ({
  events,
  focus,
  area,
  radius,
  selectedPerson,
  onSelectRecord,
  isDarkMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const [globe, setGlobe] = useState(true);
  const [tilt, setTilt] = useState(true);
  const [spin, setSpin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Update map GeoJSON sources
  const updateDataSources = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('rad')) return;

    // 1. Search Area polygon
    const areaSource = map.getSource('area') as maplibregl.GeoJSONSource;
    if (areaSource) {
      if (area && area.geo && /Polygon/.test(area.geo.type)) {
        areaSource.setData({ type: 'Feature', properties: {}, geometry: area.geo });
      } else {
        areaSource.setData(EMPTY_GEOJSON as any);
      }
    }

    // 2. Radius Circle
    const radSource = map.getSource('rad') as maplibregl.GeoJSONSource;
    if (radSource) {
      if (focus && focus.lat !== null && focus.lng !== undefined && focus.lng !== null) {
        radSource.setData(circle(focus.lat, focus.lng, radius));
      } else {
        radSource.setData(EMPTY_GEOJSON as any);
      }
    }

    // 3. Time-ordered Track Line for filtered person
    const trkSource = map.getSource('trk') as maplibregl.GeoJSONSource;
    if (trkSource) {
      if (selectedPerson) {
        const sorted = events
          .filter((e) => e.caller_id === selectedPerson && e.lat !== null && e.lng !== null)
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        if (sorted.length > 1) {
          trkSource.setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: sorted.map((e) => [e.lng as number, e.lat as number]),
            },
          } as any);
        } else {
          trkSource.setData(EMPTY_GEOJSON as any);
        }
      } else {
        trkSource.setData(EMPTY_GEOJSON as any);
      }
    }
  }, [area, focus, radius, selectedPerson, events]);

  // Setup vector & raster sources and layers
  const setupLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      map.setProjection({ type: globe ? 'globe' : 'mercator' } as any);
    } catch {
      // Fallback if projection unsupported
    }

    try {
      (map as any).setSky({
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
      });
    } catch {
      // Ignore if sky unsupported
    }

    if (map.getSource('area')) {
      updateDataSources();
      return;
    }

    map.addSource('area', { type: 'geojson', data: EMPTY_GEOJSON as any });
    map.addSource('rad', { type: 'geojson', data: EMPTY_GEOJSON as any });
    map.addSource('trk', { type: 'geojson', data: EMPTY_GEOJSON as any });

    map.addLayer({
      id: 'area-f',
      type: 'fill',
      source: 'area',
      paint: { 'fill-color': '#2ec4b6', 'fill-opacity': 0.16 },
    });
    map.addLayer({
      id: 'area-l',
      type: 'line',
      source: 'area',
      paint: { 'line-color': '#2ec4b6', 'line-width': 2.5 },
    });

    map.addLayer({
      id: 'rad-f',
      type: 'fill',
      source: 'rad',
      paint: { 'fill-color': '#f0a73a', 'fill-opacity': 0.12 },
    });
    map.addLayer({
      id: 'rad-l',
      type: 'line',
      source: 'rad',
      paint: { 'line-color': '#f0a73a', 'line-width': 2 },
    });

    map.addLayer({
      id: 'trk-l',
      type: 'line',
      source: 'trk',
      paint: {
        'line-color': '#8fb3c9',
        'line-width': 2.5,
        'line-dasharray': [2, 2],
      },
    });

    updateDataSources();
  }, [globe, updateDataSources]);

  // Create SVG Pin Markers
  const createMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Create markers for events with valid coordinates
    events.forEach((e) => {
      if (e.lat === null || e.lng === null) return;

      const color = SRC[e.location_source]?.color || '#8fb3c9';
      const el = document.createElement('div');
      el.className = 'cursor-pointer select-none';
      el.style.width = '26px';
      el.style.height = '36px';
      el.title = `${e.id} · ${e.caller_id} · ${SRC[e.location_source]?.label || e.location_source}`;

      el.innerHTML = `
        <svg viewBox="0 0 30 40" width="26" height="36" style="transform-origin: 50% 100%; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <path d="M15 39C15 39 2 25 2 14a13 13 0 0 1 26 0c0 11-13 25-13 25z" fill="${color}" stroke="#0d1113" stroke-width="2"/>
          <circle cx="15" cy="14" r="5" fill="#0d1113"/>
        </svg>
      `;

      el.onclick = () => onSelectRecord(e);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([e.lng, e.lat])
        .addTo(map);

      markersRef.current[e.id] = marker;
    });
  }, [events, onSelectRecord]);

  // Update marker styles and visibility based on focus & person filter
  useEffect(() => {
    const selectedId = focus && focus.type === 'rec' && focus.e ? focus.e.id : null;

    events.forEach((e) => {
      const marker = markersRef.current[e.id];
      if (!marker) return;

      const isVisible = !selectedPerson || e.caller_id === selectedPerson;
      marker.getElement().style.display = isVisible ? '' : 'none';

      const svg = marker.getElement().querySelector('svg');
      if (svg) {
        svg.style.transform = selectedId === e.id ? 'scale(1.4)' : 'scale(1)';
      }
    });
  }, [events, focus, selectedPerson]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    let fellBack = false;
    let isReady = false;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_LIBERTY,
      center: [40, 22],
      zoom: 1.5,
      pitch: 0,
      maxPitch: 80,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    map.on('style.load', setupLayers);
    map.on('sourcedata', (e: any) => {
      if (e.isSourceLoaded && !['area', 'rad', 'trk'].includes(e.sourceId || '')) {
        isReady = true;
      }
    });

    map.on('error', () => {
      if (!fellBack && !isReady && !map.isStyleLoaded()) {
        fellBack = true;
        showToast('3D style unavailable, switched to OpenStreetMap raster tiles.');
        map.setStyle(OSM_FALLBACK_STYLE);
      }
    });

    map.on('dragstart', () => {
      isDraggingRef.current = true;
    });
    map.on('dragend', () => {
      isDraggingRef.current = false;
    });

    createMarkers();

    // Auto-spin animation loop
    const animate = () => {
      if (mapRef.current && spin && !isDraggingRef.current && !prefersReducedMotion) {
        if (mapRef.current.getZoom() < 5) {
          const center = mapRef.current.getCenter();
          mapRef.current.jumpTo({ center: [center.lng + 0.12, center.lat] });
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    // Camera animation event listeners
    const handleFlyTo = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      if (mapRef.current && customEvt.detail) {
        mapRef.current.flyTo(customEvt.detail);
      }
    };

    const handleFitBounds = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      if (mapRef.current && customEvt.detail) {
        const { bounds, ...rest } = customEvt.detail;
        mapRef.current.fitBounds(bounds, rest);
      }
    };

    window.addEventListener('map:flyTo', handleFlyTo);
    window.addEventListener('map:fitBounds', handleFitBounds);

    return () => {
      window.removeEventListener('map:flyTo', handleFlyTo);
      window.removeEventListener('map:fitBounds', handleFitBounds);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      Object.values(markersRef.current).forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync data sources on prop updates
  useEffect(() => {
    updateDataSources();
  }, [updateDataSources]);

  // Re-create markers when events array changes
  useEffect(() => {
    createMarkers();
  }, [createMarkers]);

  // Projection toggle handler
  const handleToggleGlobe = () => {
    const nextGlobe = !globe;
    setGlobe(nextGlobe);
    if (mapRef.current) {
      try {
        mapRef.current.setProjection({ type: nextGlobe ? 'globe' : 'mercator' } as any);
      } catch {
        showToast('This map library configuration does not support globe projection.');
      }
    }
  };

  // Tilt toggle handler
  const handleToggleTilt = () => {
    const nextTilt = !tilt;
    setTilt(nextTilt);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: nextTilt ? 55 : 0,
        duration: prefersReducedMotion ? 0 : 800,
      });
    }
  };

  // Reset view to whole Earth
  const handleResetEarth = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [40, 22],
        zoom: 1.5,
        pitch: 0,
        bearing: 0,
        duration: prefersReducedMotion ? 0 : 2200,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[560px] overflow-hidden select-none bg-[#060a12]">
      {/* MapLibre GL 3D Canvas Container */}
      <div
        ref={containerRef}
        aria-label="3D Earth Map"
        className="absolute inset-0 w-full h-full"
      />

      {/* Floating Tactical Map Controls on Top Right */}
      <div
        role="toolbar"
        aria-label="Map perspective and camera controls"
        className="absolute right-3 top-3 z-10 flex flex-col gap-2 pointer-events-auto"
      >
        <button
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          title="Zoom in"
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border shadow-xl transition-all ${
            isDarkMode
              ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#d6e1e5]'
              : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          +
        </button>

        <button
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          title="Zoom out"
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border shadow-xl transition-all ${
            isDarkMode
              ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#d6e1e5]'
              : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          −
        </button>

        <button
          onClick={handleToggleGlobe}
          aria-label="Globe or flat map"
          title={globe ? 'Switch to Flat Mercator' : 'Switch to 3D Globe'}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border shadow-xl transition-all ${
            globe
              ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6]'
              : isDarkMode
              ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#86989f]'
              : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-700'
          }`}
        >
          🌐
        </button>

        <button
          onClick={handleToggleTilt}
          aria-label="Toggle 3D perspective tilt"
          title="3D Tilt Angle"
          className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs border shadow-xl transition-all ${
            tilt
              ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6]'
              : isDarkMode
              ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#86989f]'
              : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-700'
          }`}
        >
          3D
        </button>

        <button
          onClick={() => setSpin((prev) => !prev)}
          aria-label="Toggle auto spin"
          title="Spin Globe"
          className={`w-10 h-10 rounded-full flex items-center justify-center text-base border shadow-xl transition-all ${
            spin
              ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6]'
              : isDarkMode
              ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#86989f]'
              : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-700'
          }`}
        >
          ⟳
        </button>

        <button
          onClick={handleResetEarth}
          aria-label="Reset camera to whole Earth"
          title="Whole Earth View"
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border shadow-xl transition-all ${
            isDarkMode
              ? 'bg-[#141a1d]/90 hover:bg-[#1a2327] border-[#25323a] text-[#d6e1e5]'
              : 'bg-white/90 hover:bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          ⌂
        </button>
      </div>

      {/* System Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#141a1d] border border-[#2ec4b6] text-[#d6e1e5] text-xs shadow-2xl animate-fadeIn max-w-[90vw]"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
