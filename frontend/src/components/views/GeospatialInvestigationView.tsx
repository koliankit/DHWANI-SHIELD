import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  RefreshCw, 
  Plus, 
  Filter, 
  Layers, 
  Maximize2, 
  Compass, 
  Radio, 
  ShieldAlert, 
  Volume2, 
  PhoneCall, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Printer, 
  Play, 
  Square, 
  RotateCcw, 
  Info, 
  Sliders, 
  CheckSquare, 
  Square as SquareIcon,
  Compass as CompassIcon,
  Navigation,
  Eye,
  EyeOff,
  AlertTriangle,
  Folder,
  FolderOpen
} from 'lucide-react';
import { CallRecord } from '../../types';
import { api } from '../../services/api';

interface Props {
  selectedCallRef: number | null;
  onSelectCallRef: (ref: number) => void;
  onNavigateToVoiceForensics: (caseCode: string, evidenceId?: string) => void;
  isDarkMode?: boolean;
}

const RADIUS_PRESETS = [
  { label: '100 m', meters: 100 },
  { label: '250 m', meters: 250 },
  { label: '500 m', meters: 500 },
  { label: '1 km', meters: 1000 },
  { label: '2 km', meters: 2000 },
  { label: '5 km', meters: 5000 }
];

export const GeospatialInvestigationView: React.FC<Props> = ({
  selectedCallRef,
  onSelectCallRef,
  onNavigateToVoiceForensics,
  isDarkMode = true
}) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRef, setActiveRef] = useState<number>(selectedCallRef || 1348);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');
  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState<number>(1000); // 1 km default
  const [filterWithinRadiusOnly, setFilterWithinRadiusOnly] = useState<boolean>(false);
  const [baseMapLayer, setBaseMapLayer] = useState<'osm' | 'dark' | 'satellite'>('osm');
  const [visibleSubjects, setVisibleSubjects] = useState({
    '7502': true,
    '6057': true,
    '7498': true
  });
  
  // Left Tree View State
  const [isTreeExpanded, setIsTreeExpanded] = useState({
    allQueries: true,
    acceptance: true,
    basicQueries: true
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Sync external prop if it changes
  useEffect(() => {
    if (selectedCallRef) {
      setActiveRef(selectedCallRef);
    }
  }, [selectedCallRef]);

  // Load Calls Data from Backend API
  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGeospatialCalls();
      setCalls(data);
    } catch (err) {
      console.warn('Failed to load geospatial calls from backend, using fallback', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  // Currently active selected call record
  const selectedRecord = useMemo(() => {
    return calls.find(c => c.ref_number === activeRef) || calls[0] || null;
  }, [calls, activeRef]);

  // Haversine distance calculator in frontend
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filtered Calls list
  const filteredCalls = useMemo(() => {
    let result = calls.map(rec => {
      let dist: number | null = null;
      if (selectedRecord?.latitude && selectedRecord?.longitude && rec.latitude && rec.longitude) {
        dist = Math.round(calculateDistance(
          selectedRecord.latitude,
          selectedRecord.longitude,
          rec.latitude,
          rec.longitude
        ));
      }
      return { ...rec, distance_meters: dist };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.ref_number.toString().includes(q) ||
        r.target_number.includes(q) ||
        r.first_tower.toLowerCase().includes(q) ||
        r.direction.toLowerCase().includes(q)
      );
    }

    if (selectedCaseFilter !== 'ALL') {
      result = result.filter(r => r.case_id === selectedCaseFilter);
    }

    if (filterWithinRadiusOnly && selectedRecord?.latitude && selectedRecord?.longitude) {
      result = result.filter(r => r.distance_meters !== null && r.distance_meters <= selectedRadiusMeters);
    }

    return result;
  }, [calls, searchQuery, selectedCaseFilter, selectedRadiusMeters, filterWithinRadiusOnly, selectedRecord]);

  // Sector wedge polygon calculator
  const getSectorPolygon = (centerLat: number, centerLng: number, radiusMeters: number, azimuth: number, beamwidth: number): [number, number][] => {
    const points: [number, number][] = [[centerLat, centerLng]];
    const earthRadius = 6378137;
    const numPoints = 20;
    const startAngle = azimuth - beamwidth / 2;
    const endAngle = azimuth + beamwidth / 2;

    for (let i = 0; i <= numPoints; i++) {
      const angle = startAngle + (i / numPoints) * (endAngle - startAngle);
      const rad = (angle * Math.PI) / 180;
      const dLat = (radiusMeters * Math.cos(rad)) / earthRadius;
      const dLng = (radiusMeters * Math.sin(rad)) / (earthRadius * Math.cos((centerLat * Math.PI) / 180));
      points.push([centerLat + (dLat * 180) / Math.PI, centerLng + (dLng * 180) / Math.PI]);
    }
    points.push([centerLat, centerLng]);
    return points;
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around Alexandria, VA (coordinates from Reference Image 1)
    const initialLat = selectedRecord?.latitude || 38.7985;
    const initialLng = selectedRecord?.longitude || -77.1062;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: 'Hosted OSM · Esri · RAKSHAM' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    // Tile Layer based on selection
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let maxZoom = 19;

    if (baseMapLayer === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (baseMapLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    }

    L.tileLayer(tileUrl, { maxZoom }).addTo(map);

    // Clear previous dynamic layers
    layerGroup.clearLayers();

    // Render Tower Markers & Sectors
    calls.forEach((rec) => {
      if (!rec.latitude || !rec.longitude) return;

      const isCurrent = rec.ref_number === activeRef;
      const isVisible = visibleSubjects[rec.case_id as keyof typeof visibleSubjects] ?? true;
      if (!isVisible) return;

      // Color coding matching Reference Image 1 Subject Badges:
      // Case 7502: Blue
      // Case 6057: Purple
      // Case 7498: Orange
      let color = '#2563eb'; // blue
      if (rec.case_id === '7498') color = '#ea580c'; // orange
      if (rec.case_id === '6057') color = '#9333ea'; // purple

      // 1. Draw Sector Azimuth Wedge if available
      if (
        typeof rec.latitude === 'number' &&
        typeof rec.longitude === 'number' &&
        typeof rec.azimuth_degrees === 'number' &&
        typeof rec.beamwidth_degrees === 'number' &&
        typeof rec.cell_radius_meters === 'number'
      ) {
        const sectorPolygon = getSectorPolygon(
          rec.latitude,
          rec.longitude,
          rec.cell_radius_meters,
          rec.azimuth_degrees,
          rec.beamwidth_degrees
        );

        L.polygon(sectorPolygon, {
          color: color,
          weight: isCurrent ? 2 : 1,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: isCurrent ? 0.35 : 0.15
        }).addTo(layerGroup);
      }

      // 2. Tower Center Marker Icon
      const customIcon = L.divIcon({
        className: 'tower-icon-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${isCurrent ? '26px' : '18px'};
            height: ${isCurrent ? '26px' : '18px'};
            border-radius: 50%;
            border: ${isCurrent ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.8)'};
            box-shadow: 0 0 ${isCurrent ? '14px' : '6px'} ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <span style="font-size: ${isCurrent ? '12px' : '9px'};">📡</span>
          </div>
        `,
        iconSize: [isCurrent ? 26 : 18, isCurrent ? 26 : 18],
        iconAnchor: [isCurrent ? 13 : 9, isCurrent ? 13 : 9]
      });

      const marker = L.marker([rec.latitude, rec.longitude], { icon: customIcon }).addTo(layerGroup);

      marker.on('click', () => {
        setActiveRef(rec.ref_number);
        onSelectCallRef(rec.ref_number);
      });

      // Tooltip
      marker.bindTooltip(`
        <div style="font-family: monospace; font-size: 11px;">
          <b>Ref #${rec.ref_number}</b> · Case ${rec.case_id}<br/>
          Target: ${rec.target_number}<br/>
          Tower: ${rec.first_tower}<br/>
          Time: ${rec.start_time}
        </div>
      `, { direction: 'top' });
    });

    // 3. Highlighted Radius Circle around Selected Record
    if (selectedRecord?.latitude && selectedRecord?.longitude) {
      // Move map smoothly to selected record
      map.panTo([selectedRecord.latitude, selectedRecord.longitude]);

      // Outer Radius Search Circle
      L.circle([selectedRecord.latitude, selectedRecord.longitude], {
        radius: selectedRadiusMeters,
        color: '#06b6d4', // Cyan
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#06b6d4',
        fillOpacity: 0.12
      }).addTo(layerGroup);

      // Inner ping ring
      L.circle([selectedRecord.latitude, selectedRecord.longitude], {
        radius: 80,
        color: '#ffffff',
        weight: 2,
        fillColor: '#06b6d4',
        fillOpacity: 0.8
      }).addTo(layerGroup);
    }

  }, [calls, activeRef, selectedRadiusMeters, baseMapLayer, visibleSubjects, selectedRecord]);

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-50px)] font-sans select-none overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#09111e] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* 1. Main Workspace: Split into Left Tree Panel + Right Map/Table Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* ================= LEFT TOOL RAIL & DATABASE QUERIES TREE ================= */}
        <div className={`w-72 border-r flex flex-col shrink-0 select-none transition-colors ${
          isDarkMode ? 'bg-[#08101d] border-[#152338]' : 'bg-white border-slate-200'
        }`}>
          
          {/* Top Header of Query Panel */}
          <div className={`p-3 border-b transition-colors ${
            isDarkMode ? 'border-[#142136] bg-[#0b1526]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono ${
                isDarkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                <Folder className="w-3.5 h-3.5 text-cyan-500" />
                Database Queries
              </span>
              <div className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <button 
                  onClick={loadCalls} 
                  title="Reload Queries" 
                  className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:text-white hover:bg-[#152740]' : 'hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
                </button>
                <button title="New Query" className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:text-white hover:bg-[#152740]' : 'hover:text-slate-900 hover:bg-slate-200'}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Query Filter Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded px-2.5 py-1 text-xs font-mono focus:outline-none ${
                  isDarkMode 
                    ? 'bg-[#060c18] border-[#1b2f4c] text-slate-200 placeholder-slate-500 focus:border-cyan-500' 
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-600'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>

          {/* Hierarchical Query Folder Tree Matching Reference Image 1 */}
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-1">
            
            {/* Admin 1 Root */}
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300 font-bold hover:bg-[#0f1d31] rounded cursor-pointer">
                <ChevronDown className="w-3 h-3 text-slate-400" />
                <span className="text-cyan-400">👤 Admin 1</span>
              </div>

              {/* All Queries */}
              <div className="pl-4 space-y-0.5">
                <div 
                  onClick={() => setIsTreeExpanded(prev => ({ ...prev, allQueries: !prev.allQueries }))}
                  className="flex items-center gap-1.5 px-2 py-1 text-slate-300 hover:bg-[#0f1d31] rounded cursor-pointer"
                >
                  {isTreeExpanded.allQueries ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>All Queries</span>
                </div>

                {isTreeExpanded.allQueries && (
                  <div className="pl-4 space-y-0.5">
                    {/* Acceptance */}
                    <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300 hover:bg-[#0f1d31] rounded cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acceptance</span>
                    </div>

                    {/* Basic Queries */}
                    <div className="pl-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300 hover:bg-[#0f1d31] rounded cursor-pointer">
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                        <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Basic Queries</span>
                      </div>

                      {/* Sub-queries */}
                      <div className="pl-5 space-y-0.5 text-slate-400">
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">Audio Queries</div>
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">Audit</div>
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">Basic</div>
                        
                        {/* CALLS (Active query node from Reference Image 1!) */}
                        <div className="flex items-center justify-between px-2 py-1 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold rounded cursor-pointer">
                          <span className="flex items-center gap-1.5">
                            <PhoneCall className="w-3 h-3 text-cyan-400" />
                            Calls
                          </span>
                          <span className="text-[10px] bg-cyan-900 px-1.5 rounded text-white font-mono">
                            {calls.length}
                          </span>
                        </div>

                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">Calls today</div>
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">Calls with Loc</div>
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">MMS</div>
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">SMS</div>
                        <div className="px-2 py-0.5 hover:text-white cursor-pointer">Subs</div>
                      </div>
                    </div>

                    {/* Other Branches */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-slate-400 hover:text-white cursor-pointer">
                      <Folder className="w-3 h-3" />
                      <span>Device Queries</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-slate-400 hover:text-white cursor-pointer">
                      <Folder className="w-3 h-3" />
                      <span>Internet Queries</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-slate-400 hover:text-white cursor-pointer">
                      <Folder className="w-3 h-3" />
                      <span>Social Media</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-slate-400 hover:text-white cursor-pointer">
                      <Folder className="w-3 h-3" />
                      <span>Audit Trail</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Quick Legal Attribution / Provenance Note */}
          <div className="p-3 border-t border-[#142136] bg-[#060c18] text-[10px] text-slate-500 font-mono">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-400" />
              Location Provenance Rule
            </div>
            <span>Radio tower sector coverage reflects carrier telemetry; does not certify legal human identity.</span>
          </div>

        </div>

        {/* ================= RIGHT MAIN AREA: MAP (TOP) & CDR TABLE (BOTTOM) ================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Top Query Tab Bar matching Reference Image 1 */}
          <div className="bg-[#0b1422] border-b border-[#142236] px-4 py-1.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-[#122238] border-t-2 border-cyan-400 text-white font-bold rounded-t flex items-center gap-2">
                <PhoneCall className="w-3 h-3 text-cyan-400" />
                <span>Query {selectedRecord?.target_number || '5712747502'} (#{selectedRecord?.case_id || '1626'})</span>
              </div>
              <div className="px-3 py-1 bg-[#09111e] text-slate-400 hover:text-slate-200 cursor-pointer rounded-t">
                Map View
              </div>
            </div>

            {/* Quick jump to Voice Forensics if audio is attached */}
            {selectedRecord?.associated_evidence_id && (
              <button
                onClick={() => onNavigateToVoiceForensics(selectedRecord.associated_case_code || 'Case #V-0884', selectedRecord.associated_evidence_id || undefined)}
                className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-glow-red animate-pulse"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Analyze Audio Evidence ({selectedRecord.associated_case_code}) →</span>
              </button>
            )}
          </div>

          {/* ================= MAP CONTROLS SUB-TOOLBAR ================= */}
          <div className={`border-b px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-colors ${
            isDarkMode ? 'bg-[#08101d] border-[#142236]' : 'bg-slate-50 border-slate-200'
          }`}>
            
            {/* Left Toolbar Tools */}
            <div className="flex items-center gap-3">
              <span className={`font-bold uppercase tracking-wider font-mono text-xs ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                Playback Map
              </span>

              {/* Playback icons matching Reference Image 1 */}
              <div className={`flex items-center gap-1 p-1 rounded border ${
                isDarkMode ? 'bg-[#0f1c2e] border-[#1b2c45]' : 'bg-white border-slate-300'
              }`}>
                <button title="Rewind Playback" className={`p-1 transition-colors ${isDarkMode ? 'hover:text-cyan-400 text-slate-400' : 'hover:text-cyan-600 text-slate-500'}`}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button title="Stop Playback" className={`p-1 transition-colors ${isDarkMode ? 'hover:text-red-400 text-slate-400' : 'hover:text-red-600 text-slate-500'}`}>
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button title="Play Track Animation" className={`p-1 transition-colors ${isDarkMode ? 'hover:text-emerald-400 text-slate-400' : 'hover:text-emerald-600 text-slate-500'}`}>
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Base Map Selector */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Base:</span>
                <select
                  value={baseMapLayer}
                  onChange={(e) => setBaseMapLayer(e.target.value as any)}
                  className={`border rounded px-2 py-1 focus:outline-none ${
                    isDarkMode ? 'bg-[#0f1c2e] border-[#1b2c45] text-slate-200 focus:border-cyan-400' : 'bg-white border-slate-300 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  <option value="osm">Hosted OSM</option>
                  <option value="dark">Dark Forensic</option>
                  <option value="satellite">Satellite Imagery</option>
                </select>
              </div>

              {/* Radius Search Selector */}
              <div className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded border ${
                isDarkMode ? 'bg-[#0c182a] border-[#192b45]' : 'bg-white border-slate-300'
              }`}>
                <span className="text-cyan-500 font-bold">Radius:</span>
                <div className="flex items-center gap-1">
                  {RADIUS_PRESETS.map((p) => (
                    <button
                      key={p.meters}
                      onClick={() => setSelectedRadiusMeters(p.meters)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        selectedRadiusMeters === p.meters
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-[#13233a]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Subject Badges Legend Matching Reference Image 1 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                {/* Blue: Case 7502 */}
                <button
                  onClick={() => setVisibleSubjects(prev => ({ ...prev, '7502': !prev['7502'] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    visibleSubjects['7502'] 
                      ? 'bg-blue-600 border-blue-400 text-white' 
                      : 'bg-blue-950/40 border-blue-800 text-blue-400 opacity-60'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>7502 VoLTE</span>
                </button>

                {/* Purple: Case 6057 */}
                <button
                  onClick={() => setVisibleSubjects(prev => ({ ...prev, '6057': !prev['6057'] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    visibleSubjects['6057'] 
                      ? 'bg-purple-600 border-purple-400 text-white' 
                      : 'bg-purple-950/40 border-purple-800 text-purple-400 opacity-60'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>6057 VoLTE</span>
                </button>

                {/* Orange: Case 7498 */}
                <button
                  onClick={() => setVisibleSubjects(prev => ({ ...prev, '7498': !prev['7498'] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    visibleSubjects['7498'] 
                      ? 'bg-orange-600 border-orange-400 text-white' 
                      : 'bg-orange-950/40 border-orange-800 text-orange-400 opacity-60'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>7498 VoLTE</span>
                </button>
              </div>
            </div>

          </div>

          {/* ================= MAP CANVAS CONTAINER (50% HEIGHT) ================= */}
          <div className="h-72 lg:h-96 relative w-full bg-[#050c18] border-b border-[#142236]">
            {/* The Actual Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Selected Record Info Overlay on Map */}
            {selectedRecord && (
              <div className="absolute top-3 left-3 z-20 bg-[#081220]/95 backdrop-blur-md border border-[#1b2f4c] rounded-lg p-2.5 shadow-xl text-xs font-mono max-w-sm">
                <div className="flex items-center justify-between gap-2 border-b border-[#14233a] pb-1.5 mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Ref #{selectedRecord.ref_number} (Case {selectedRecord.case_id})
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    selectedRecord.location_provenance === 'VERIFIED LOCATION'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : selectedRecord.location_provenance === 'ESTIMATED AREA'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-red-950 text-red-300 border border-red-500/50'
                  }`}>
                    {selectedRecord.location_provenance}
                  </span>
                </div>

                <div className="space-y-0.5 text-[11px] text-slate-300">
                  <div>Target: <span className="text-white font-bold">{selectedRecord.target_number}</span></div>
                  <div>Tower Cell: <span className="text-cyan-300">{selectedRecord.first_tower}</span></div>
                  <div>Coordinates: <span className="text-slate-400">{selectedRecord.latitude?.toFixed(4)}, {selectedRecord.longitude?.toFixed(4)}</span></div>
                  {selectedRecord.azimuth_degrees !== null && (
                    <div>Sector Azimuth: <span className="text-amber-300">{selectedRecord.azimuth_degrees}° (Beamwidth: {selectedRecord.beamwidth_degrees}°)</span></div>
                  )}
                  <div>Coverage Radius: <span className="text-emerald-300">{selectedRecord.cell_radius_meters}m</span></div>
                </div>

                {selectedRecord.associated_case_code && (
                  <div className="mt-2 pt-1.5 border-t border-[#14233a] flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-[10px]">🎙️ Audio Attached</span>
                    <button
                      onClick={() => onNavigateToVoiceForensics(selectedRecord.associated_case_code || 'Case #V-0884', selectedRecord.associated_evidence_id || undefined)}
                      className="text-[10px] bg-[#14b8a6] hover:bg-[#0d9488] text-slate-950 font-bold px-2 py-0.5 rounded transition-colors"
                    >
                      Open Forensics →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Location Unavailable Banner if selected record has no coordinates */}
            {selectedRecord && !selectedRecord.latitude && (
              <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-[#0c1524] border border-amber-500/40 p-4 rounded-xl text-center max-w-md shadow-2xl">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white mb-1">LOCATION UNAVAILABLE</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Record #{selectedRecord.ref_number} contains no valid cell tower handoff coordinates. 
                    RAKSHAM adheres to strict forensic standards: we never fabricate live coordinates or artificial GPS tracking.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= CDR CALL RECORDS TABLE (BOTTOM 50%) ================= */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-colors ${
            isDarkMode ? 'bg-[#08101d]' : 'bg-white'
          }`}>
            
            {/* Table Header Bar Matching Reference Image 1 */}
            <div className={`border-b px-4 py-2 flex items-center justify-between text-xs font-mono transition-colors ${
              isDarkMode ? 'bg-[#0b1626] border-[#142338]' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`font-bold uppercase tracking-wide ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Query Result - Calls
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  isDarkMode ? 'text-slate-400 bg-[#122238] border-[#1a2d47]' : 'text-slate-600 bg-white border-slate-300'
                }`}>
                  {filteredCalls.length} records found
                </span>
              </div>

              {/* Geographic Radius Toggle Filter */}
              <div className="flex items-center gap-2">
                <label className={`flex items-center gap-1.5 text-[11px] cursor-pointer ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterWithinRadiusOnly}
                    onChange={(e) => setFilterWithinRadiusOnly(e.target.checked)}
                    className="rounded bg-[#060c18] border-slate-600 text-cyan-500"
                  />
                  <span>Filter records inside {selectedRadiusMeters}m radius only</span>
                </label>
              </div>
            </div>

            {/* The Structured Law Enforcement CDR Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs font-mono border-collapse select-text">
                <thead className={`text-[10px] uppercase tracking-wider sticky top-0 z-20 border-b transition-colors ${
                  isDarkMode ? 'bg-[#0d1a2c] text-slate-400 border-[#152740]' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  <tr>
                    <th className="p-2 w-8 text-center">✓</th>
                    <th className="p-2">Ref. Number</th>
                    <th className="p-2">Case</th>
                    <th className="p-2">Target Number</th>
                    <th className="p-2">Start Date/Time</th>
                    <th className="p-2">Created Date/Time</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Direction</th>
                    <th className="p-2">First Tower</th>
                    <th className="p-2">Last Tower</th>
                    <th className="p-2">Provenance</th>
                    <th className="p-2">Audio Evidence</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#132236]' : 'divide-slate-200'}`}>
                  {filteredCalls.map((rec, idx) => {
                    const isSelected = rec.ref_number === activeRef;

                    // Alternating soft green / soft blue rows matching Reference Image 1
                    const isEven = idx % 2 === 0;
                    const rowBgClass = isSelected
                      ? 'bg-blue-600 text-white font-bold' // Highlighted blue selected row matching Ref Image 1!
                      : isEven
                      ? (isDarkMode ? 'bg-[#0a1524] hover:bg-[#12233a] text-slate-200' : 'bg-[#eaf7ee] hover:bg-emerald-100/70 text-slate-800') // Alternating soft green
                      : (isDarkMode ? 'bg-[#091822] hover:bg-[#12233a] text-slate-200' : 'bg-[#edf5fc] hover:bg-blue-100/70 text-slate-800'); // Alternating soft blue

                    return (
                      <tr
                        key={rec.ref_number}
                        onClick={() => {
                          setActiveRef(rec.ref_number);
                          onSelectCallRef(rec.ref_number);
                        }}
                        className={`cursor-pointer transition-colors ${rowBgClass}`}
                      >
                        {/* Checkbox */}
                        <td className="p-2 text-center">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-white inline-block" />
                          ) : (
                            <SquareIcon className="w-3.5 h-3.5 text-slate-500 inline-block" />
                          )}
                        </td>

                        {/* Ref. Number */}
                        <td className="p-2 font-bold font-mono">
                          {rec.ref_number}
                        </td>

                        {/* Case ID */}
                        <td className="p-2 font-mono">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                            rec.case_id === '7502' 
                              ? 'bg-blue-900/60 text-blue-200' 
                              : 'bg-orange-900/60 text-orange-200'
                          }`}>
                            {rec.case_id}
                          </span>
                        </td>

                        {/* Target Number */}
                        <td className="p-2 font-mono font-medium">
                          {rec.target_number}
                        </td>

                        {/* Start Date/Time */}
                        <td className="p-2 text-slate-300 whitespace-nowrap">
                          {rec.start_time}
                        </td>

                        {/* Created Date/Time */}
                        <td className="p-2 text-slate-400 whitespace-nowrap">
                          {rec.created_time}
                        </td>

                        {/* Duration */}
                        <td className="p-2 font-mono">
                          {rec.duration_str}
                        </td>

                        {/* Direction */}
                        <td className="p-2 uppercase text-[10px] font-semibold">
                          <span className={rec.direction === 'incoming' ? 'text-cyan-400' : 'text-amber-400'}>
                            {rec.direction}
                          </span>
                        </td>

                        {/* First Tower */}
                        <td className="p-2 font-mono text-[11px] text-slate-300 truncate max-w-[140px]" title={rec.first_tower}>
                          {rec.first_tower}
                        </td>

                        {/* Last Tower */}
                        <td className="p-2 font-mono text-[11px] text-slate-400 truncate max-w-[140px]" title={rec.last_tower}>
                          {rec.last_tower}
                        </td>

                        {/* Location Provenance */}
                        <td className="p-2 whitespace-nowrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            rec.location_provenance === 'VERIFIED LOCATION'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : rec.location_provenance === 'ESTIMATED AREA'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}>
                            {rec.location_provenance}
                          </span>
                        </td>

                        {/* Associated Audio Evidence */}
                        <td className="p-2 whitespace-nowrap">
                          {rec.associated_case_code ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToVoiceForensics(rec.associated_case_code || 'Case #V-0884', rec.associated_evidence_id || undefined);
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 hover:text-white bg-cyan-950 hover:bg-cyan-800 border border-cyan-500/50 px-2 py-0.5 rounded transition-colors"
                            >
                              <Volume2 className="w-3 h-3 text-cyan-400" />
                              <span>{rec.associated_case_code}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
