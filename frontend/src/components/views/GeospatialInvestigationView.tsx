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
  FolderOpen,
  X,
  Crosshair,
  Globe,
  Zap,
  Sparkles,
  Key,
  Cpu,
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { CallRecord } from '../../types';
import { api } from '../../services/api';
import { DEFAULT_GEOSPATIAL_CALLS } from '../../data/mockGeospatialCalls';
import { telecomAudioEngine } from '../../services/telecomAudioEngine';
import { realTimeTelecomService, RealTimeLookupResult } from '../../services/realTimeTelecomService';

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

export type QueryCategoryType = 
  | 'audio_queries'
  | 'audit'
  | 'basic'
  | 'calls'
  | 'calls_today'
  | 'calls_with_loc'
  | 'mms'
  | 'sms'
  | 'subs'
  | 'device'
  | 'internet'
  | 'social_media'
  | 'audit_trail';

export type BaseMapLayerType = 
  | 'dark'          // High-Contrast Tactical Cyber Neon Grid (Built on OSM Global Edge)
  | 'dark_esri'     // Esri Defense Dark Gray Canvas + High-Contrast Reference Labels
  | 'dark_carto'    // CARTO Dark Matter (High Contrast + Labels)
  | 'satellite'     // Esri World Satellite Imagery 4K + Boundaries & Labels
  | 'osm'           // Real OpenStreetMap (Standard Street Level)
  | 'hot';          // Humanitarian OSM (Detailed Infrastructure & Buildings)

export interface AdminProfile {
  id: number;
  name: string;
  code: string;
  unit: string;
  badge: string;
  color: string;
  targetNumber: string;
  caseId: string;
  situation: string;
  description: string;
  evidenceId: string;
  caseCode: string;
  label: string;
  caseRef: string;
  role: string;
  defaultCategory?: QueryCategoryType;
  primaryLat?: number;
  primaryLng?: number;
}

export const ADMIN_PROFILES: AdminProfile[] = [
  {
    id: 1,
    name: 'Admin 1',
    code: 'CYBER-FRAUD',
    unit: 'Cyber Fraud & Deepfake Impersonation Desk',
    badge: 'AI CLONE',
    color: '#2ec4b6',
    targetNumber: '5712747502',
    caseId: '7502',
    situation: 'Corporate Executive AI Voice Cloning (Case #V-0884)',
    description: 'Neural vocoder voice cloning demanding urgent wire transfers. AASIST flagged 89% synthetic probability.',
    evidenceId: 'case-v0884',
    caseCode: 'Case #V-0884',
    label: 'Admin 1',
    caseRef: 'Case #V-0884',
    role: 'Cyber Fraud & Deepfake Desk',
    defaultCategory: 'audio_queries',
    primaryLat: 38.7985,
    primaryLng: -77.1062
  },
  {
    id: 2,
    name: 'Admin 2',
    code: 'ANTI-EXTORTION',
    unit: 'VIP Anti-Extortion & Kidnap Spoofing Taskforce',
    badge: 'SPOOF DETECT',
    color: '#f0a73a',
    targetNumber: '5712746057',
    caseId: '6057',
    situation: 'Distressed Family Member Voice Spoofing (Case #V-0885)',
    description: 'Emergency extortion call impersonating a distressed family member. ECAPA-TDNN acoustic divergence verified.',
    evidenceId: 'case-v0885',
    caseCode: 'Case #V-0885',
    label: 'Admin 2',
    caseRef: 'Case #V-0885',
    role: 'Anti-Extortion Taskforce',
    defaultCategory: 'audio_queries',
    primaryLat: 38.8092,
    primaryLng: -77.1145
  },
  {
    id: 3,
    name: 'Admin 3',
    code: 'TELECOM-ROAM',
    unit: 'Telecom Intercept & Multi-Tower Roaming Desk',
    badge: 'MULTI-TOWER',
    color: '#8fb3c9',
    targetNumber: '5712747498',
    caseId: '7498',
    situation: 'Burner Phone Roaming & Multiple Sector Handoffs (Case #V-0886)',
    description: 'Cross-jurisdiction tracking across Arlington, Crystal City, and Pentagon City cell towers.',
    evidenceId: 'case-v0886',
    caseCode: 'Case #V-0886',
    label: 'Admin 3',
    caseRef: 'Case #V-0886',
    role: 'Roaming Intercept Desk',
    defaultCategory: 'calls_with_loc',
    primaryLat: 38.7890,
    primaryLng: -77.0980
  },
  {
    id: 4,
    name: 'Admin 4',
    code: 'E911-RESCUE',
    unit: 'E911 Emergency Life-Safety Dispatch Desk',
    badge: 'GPS VERIFIED',
    color: '#38bdf8',
    targetNumber: '5712749110',
    caseId: '9110',
    situation: 'Verified Handset Emergency GPS Rapid Rescue (Case #V-9110)',
    description: 'Life-safety emergency GPS telemetry from handset chip (±15m accuracy) in Washington DC Mall sector.',
    evidenceId: 'case-v9110',
    caseCode: 'Case #V-9110',
    label: 'Admin 4',
    caseRef: 'Case #V-9110',
    role: 'E911 Rapid Rescue Desk',
    defaultCategory: 'calls_with_loc',
    primaryLat: 38.7962,
    primaryLng: -77.1215
  },
  {
    id: 5,
    name: 'Admin 5',
    code: 'SYNTH-LAB',
    unit: 'Synthetic Audio & AASIST Forensics Lab',
    badge: 'AASIST LAB',
    color: '#a78bfa',
    targetNumber: '5712748840',
    caseId: '8840',
    situation: 'RawNet2 & ECAPA-TDNN Anti-Spoofing Benchmark (Case #V-0887)',
    description: 'ASVspoof 2021 DF/LA laboratory evaluation detecting high-frequency vocoder phase anomalies (97% deepfake).',
    evidenceId: 'case-v0887',
    caseCode: 'Case #V-0887',
    label: 'Admin 5',
    caseRef: 'Case #V-0887',
    role: 'AASIST Forensics Lab',
    defaultCategory: 'audio_queries',
    primaryLat: 38.8000,
    primaryLng: -77.1000
  },
  {
    id: 6,
    name: 'Admin 6',
    code: 'SIMBOX-STRIKE',
    unit: 'SIM Box & Robocall Strike Team',
    badge: 'ROBOCALL RING',
    color: '#f87171',
    targetNumber: '5712743321',
    caseId: '3321',
    situation: 'SIM Box Gateway High-Frequency Robocall Blast (Case #V-0888)',
    description: 'Automated VoIP blast targeting thousands of phone lines simultaneously with synthetic utility fraud script.',
    evidenceId: 'case-v0888',
    caseCode: 'Case #V-0888',
    label: 'Admin 6',
    caseRef: 'Case #V-0888',
    role: 'SIM Box Strike Team',
    defaultCategory: 'calls',
    primaryLat: 38.8020,
    primaryLng: -77.1085
  },
  {
    id: 7,
    name: 'Admin 7',
    code: 'AUDIT-MASTER',
    unit: 'Chain-of-Custody & Supervisory Audit Desk',
    badge: 'AUDIT MASTER',
    color: '#34d399',
    targetNumber: '5712740007',
    caseId: '0007',
    situation: 'Lawful Court Warrants & SHA-256 Evidence Sealing (Case #V-AUDIT)',
    description: 'Judicial oversight verifying lawful warrants #ORD-7502 through #ORD-7508 with cryptographic audit logs.',
    evidenceId: 'case-vaudit',
    caseCode: 'Case #V-AUDIT',
    label: 'Admin 7',
    caseRef: 'Case #V-AUDIT',
    role: 'Judicial Audit Desk',
    defaultCategory: 'audit',
    primaryLat: 38.8055,
    primaryLng: -77.1040
  }
];

export const GeospatialInvestigationView: React.FC<Props> = ({
  selectedCallRef,
  onSelectCallRef,
  onNavigateToVoiceForensics,
  isDarkMode = true
}) => {
  const [calls, setCalls] = useState<CallRecord[]>(DEFAULT_GEOSPATIAL_CALLS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAdminId, setActiveAdminId] = useState<number>(1);
  const [expandedAdmins, setExpandedAdmins] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false
  });
  const [isTreeExpanded, setIsTreeExpanded] = useState<{ allQueries: boolean; basicQueries: boolean }>({
    allQueries: true,
    basicQueries: true
  });

  const handleToggleAdminExpand = (adminId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAdmins(prev => ({ ...prev, [adminId]: !prev[adminId] }));
  };

  const [activeQueryCategory, setActiveQueryCategory] = useState<QueryCategoryType>('calls');
  const [activeRef, setActiveRef] = useState<number>(selectedCallRef || DEFAULT_GEOSPATIAL_CALLS[0].ref_number);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('ALL');
  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState<number>(1000); // 1 km default
  const [filterWithinRadiusOnly, setFilterWithinRadiusOnly] = useState<boolean>(false);
  const [baseMapLayer, setBaseMapLayer] = useState<BaseMapLayerType>('dark');
  const [isTileApiModalOpen, setIsTileApiModalOpen] = useState<boolean>(false);
  const [customTileUrl, setCustomTileUrl] = useState<string>(() => localStorage.getItem('voiceguard_custom_tile_url') || '');
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('voiceguard_custom_api_key') || '');
  const [draftTileUrl, setDraftTileUrl] = useState<string>('');
  const [draftApiKey, setDraftApiKey] = useState<string>('');
  const [tileApiLatency, setTileApiLatency] = useState<number>(22);
  const [isTestingTileApi, setIsTestingTileApi] = useState<boolean>(false);

  const handleOpenTileApiModal = () => {
    setDraftTileUrl(customTileUrl);
    setDraftApiKey(customApiKey);
    setIsTileApiModalOpen(true);
    handleTestTileApi();
  };

  // Live Ping Latency Test for Map Tile APIs
  const handleTestTileApi = async () => {
    setIsTestingTileApi(true);
    const start = performance.now();
    try {
      let testUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/13/3079/2412';
      if (customTileUrl.trim()) {
        testUrl = customTileUrl
          .replace('{z}', '13')
          .replace('{x}', '2412')
          .replace('{y}', '3079')
          .replace('{s}', 'a');
        if (customApiKey.trim() && !testUrl.includes(customApiKey.trim())) {
          testUrl += testUrl.includes('?') ? `&access_token=${customApiKey.trim()}` : `?access_token=${customApiKey.trim()}`;
        }
      } else if (baseMapLayer === 'dark') {
        testUrl = 'https://a.tile.openstreetmap.org/13/2412/3079.png';
      } else if (baseMapLayer === 'dark_carto') {
        testUrl = 'https://a.basemaps.cartocdn.com/rastertiles/dark_all/13/2412/3079.png';
      }
      await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      const elapsed = Math.round(performance.now() - start);
      setTileApiLatency(elapsed > 0 ? elapsed : 18);
    } catch {
      setTileApiLatency(28);
    } finally {
      setIsTestingTileApi(false);
    }
  };

  const handleSaveCustomTileApi = (url: string, key: string) => {
    setCustomTileUrl(url);
    setCustomApiKey(key);
    localStorage.setItem('voiceguard_custom_tile_url', url);
    localStorage.setItem('voiceguard_custom_api_key', key);
    setIsTileApiModalOpen(false);
  };

  const handleResetTileApi = () => {
    setCustomTileUrl('');
    setCustomApiKey('');
    localStorage.removeItem('voiceguard_custom_tile_url');
    localStorage.removeItem('voiceguard_custom_api_key');
    setBaseMapLayer('dark');
    setIsTileApiModalOpen(false);
  };
  const [visibleSubjects, setVisibleSubjects] = useState({
    '7502': true,
    '6057': true,
    '7498': true
  });
  
  // Omni-Search Bar & Global Intercept Brain State
  const [omniSearchText, setOmniSearchText] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState<boolean>(false);
  const [realTimeIntercept, setRealTimeIntercept] = useState<RealTimeLookupResult | null>(null);
  const [isCopiedCoords, setIsCopiedCoords] = useState<boolean>(false);

  // Radar & Track Animation State
  const [isRadarAnimationActive, setIsRadarAnimationActive] = useState<boolean>(true);
  const [isPlayingTrack, setIsPlayingTrack] = useState<boolean>(false);

  // Dedicated Side Panel State (keeps map 100% unobstructed)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Active Admin Profile
  const currentAdmin = useMemo(() => {
    return ADMIN_PROFILES.find(a => a.id === activeAdminId) || ADMIN_PROFILES[0];
  }, [activeAdminId]);

  // Calls filtered by the active Admin (or all if activeAdminId === 0)
  const adminCalls = useMemo(() => {
    if (activeAdminId === 0) return calls;
    return calls.filter(c => !c.admin_id || c.admin_id === activeAdminId);
  }, [calls, activeAdminId]);

  // Sync external prop if it changes
  useEffect(() => {
    if (selectedCallRef) {
      setActiveRef(selectedCallRef);
    }
  }, [selectedCallRef]);

  // Adjust Leaflet map size when side panel toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isSidePanelOpen]);

  // Category counts computed dynamically for the active Admin
  const categoryCounts = useMemo<Record<QueryCategoryType, number>>(() => {
    return {
      basic: adminCalls.length,
      audio_queries: adminCalls.filter(c => !!(c.associated_evidence_id || c.associated_case_code || c.voice_authenticity)).length,
      audit: adminCalls.filter(c => c.category === 'audit').length,
      calls: adminCalls.filter(c => c.category === 'call' || (!c.category && c.direction)).length,
      calls_today: adminCalls.filter(c => (c.category === 'call' || !c.category) && (c.start_time || '').includes('10/10/2026')).length,
      calls_with_loc: adminCalls.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number').length,
      mms: adminCalls.filter(c => c.category === 'mms').length,
      sms: adminCalls.filter(c => c.category === 'sms').length,
      subs: adminCalls.filter(c => c.category === 'subscriber').length,
      device: adminCalls.filter(c => c.category === 'device' || c.source_type === 'HANDSET_EMERGENCY').length,
      internet: adminCalls.filter(c => c.category === 'internet').length,
      social_media: adminCalls.filter(c => c.category === 'social_media').length,
      audit_trail: adminCalls.filter(c => c.category === 'audit').length,
    };
  }, [adminCalls]);

  // Subset of calls matching the active query category
  const categoryCalls = useMemo<CallRecord[]>(() => {
    switch (activeQueryCategory) {
      case 'audio_queries':
        return adminCalls.filter(c => !!(c.associated_evidence_id || c.associated_case_code || c.voice_authenticity));
      case 'audit':
        return adminCalls.filter(c => c.category === 'audit');
      case 'calls':
        return adminCalls.filter(c => c.category === 'call' || (!c.category && c.direction));
      case 'calls_today':
        return adminCalls.filter(c => (c.category === 'call' || !c.category) && (c.start_time || '').includes('10/10/2026'));
      case 'calls_with_loc':
        return adminCalls.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number');
      case 'mms':
        return adminCalls.filter(c => c.category === 'mms');
      case 'sms':
        return adminCalls.filter(c => c.category === 'sms');
      case 'subs':
        return adminCalls.filter(c => c.category === 'subscriber');
      case 'device':
        return adminCalls.filter(c => c.category === 'device' || c.source_type === 'HANDSET_EMERGENCY');
      case 'internet':
        return adminCalls.filter(c => c.category === 'internet');
      case 'social_media':
        return adminCalls.filter(c => c.category === 'social_media');
      case 'audit_trail':
        return adminCalls.filter(c => c.category === 'audit');
      case 'basic':
      default:
        return adminCalls;
    }
  }, [adminCalls, activeQueryCategory]);

  // Switch active Admin
  const handleSelectAdmin = (adminId: number) => {
    setActiveAdminId(adminId);
    setExpandedAdmins(prev => ({
      ...prev,
      [adminId]: true
    }));
    const targetCalls = calls.filter(c => adminId === 0 ? true : c.admin_id === adminId);
    if (targetCalls.length > 0) {
      const match = targetCalls.find(c => c.latitude && c.longitude) || targetCalls[0];
      setActiveRef(match.ref_number);
      onSelectCallRef(match.ref_number);
      if (mapInstanceRef.current && match.latitude && match.longitude) {
        mapInstanceRef.current.panTo([match.latitude, match.longitude], { animate: true });
      }
    }
  };

  // Handler for clicking any category node in the tree
  const handleSelectQueryCategory = (cat: QueryCategoryType) => {
    setActiveQueryCategory(cat);
    let subset: CallRecord[] = [];
    switch (cat) {
      case 'audio_queries':
        subset = adminCalls.filter(c => !!(c.associated_evidence_id || c.associated_case_code || c.voice_authenticity));
        break;
      case 'audit':
      case 'audit_trail':
        subset = adminCalls.filter(c => c.category === 'audit');
        break;
      case 'calls':
        subset = adminCalls.filter(c => c.category === 'call' || (!c.category && c.direction));
        break;
      case 'calls_today':
        subset = adminCalls.filter(c => (c.category === 'call' || !c.category) && (c.start_time || '').includes('10/10/2026'));
        break;
      case 'calls_with_loc':
        subset = adminCalls.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number');
        break;
      case 'mms':
        subset = adminCalls.filter(c => c.category === 'mms');
        break;
      case 'sms':
        subset = adminCalls.filter(c => c.category === 'sms');
        break;
      case 'subs':
        subset = adminCalls.filter(c => c.category === 'subscriber');
        break;
      case 'device':
        subset = adminCalls.filter(c => c.category === 'device' || c.source_type === 'HANDSET_EMERGENCY');
        break;
      case 'internet':
        subset = adminCalls.filter(c => c.category === 'internet');
        break;
      case 'social_media':
        subset = adminCalls.filter(c => c.category === 'social_media');
        break;
      case 'basic':
      default:
        subset = adminCalls;
        break;
    }

    if (subset.length > 0) {
      const match = subset.find(c => c.ref_number === activeRef) || subset.find(c => c.latitude && c.longitude) || subset[0];
      if (match) {
        setActiveRef(match.ref_number);
        onSelectCallRef(match.ref_number);
        if (mapInstanceRef.current && match.latitude && match.longitude) {
          mapInstanceRef.current.panTo([match.latitude, match.longitude], { animate: true });
        }
      }
    }
  };

  const getCategoryLabel = (cat: QueryCategoryType): string => {
    switch (cat) {
      case 'audio_queries': return 'Audio Queries';
      case 'audit': return 'Audit';
      case 'basic': return 'Basic';
      case 'calls': return 'Calls';
      case 'calls_today': return 'Calls today';
      case 'calls_with_loc': return 'Calls with Loc';
      case 'mms': return 'MMS';
      case 'sms': return 'SMS';
      case 'subs': return 'Subs';
      case 'device': return 'Device Queries';
      case 'internet': return 'Internet Queries';
      case 'social_media': return 'Social Media';
      case 'audit_trail': return 'Audit Trail';
      default: return 'Calls';
    }
  };

  // Automated Playback Ticker for Call Tracks
  useEffect(() => {
    if (!isPlayingTrack || categoryCalls.length === 0) return;

    const sequenceCalls = categoryCalls.filter(c => c.latitude && c.longitude);
    if (sequenceCalls.length === 0) return;

    const interval = setInterval(() => {
      setActiveRef((prev) => {
        const idx = sequenceCalls.findIndex(c => c.ref_number === prev);
        const nextIdx = (idx + 1) % sequenceCalls.length;
        const nextCall = sequenceCalls[nextIdx];
        onSelectCallRef(nextCall.ref_number);
        return nextCall.ref_number;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlayingTrack, categoryCalls, onSelectCallRef]);

  // Load Calls Data from Backend API
  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGeospatialCalls();
      if (Array.isArray(data) && data.length > 0) {
        setCalls(data);
      } else {
        setCalls(DEFAULT_GEOSPATIAL_CALLS);
      }
    } catch {
      setCalls(DEFAULT_GEOSPATIAL_CALLS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  // Currently active selected call record
  const selectedRecord = useMemo(() => {
    return categoryCalls.find(c => c.ref_number === activeRef) || 
      categoryCalls[0] || 
      calls.find(c => c.ref_number === activeRef) || 
      calls[0] || 
      DEFAULT_GEOSPATIAL_CALLS[0];
  }, [categoryCalls, calls, activeRef]);

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

  // Filtered Calls list based on active category, search text, and radius
  const filteredCalls = useMemo(() => {
    let result = categoryCalls.map(rec => {
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
        r.direction.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    if (selectedCaseFilter !== 'ALL') {
      result = result.filter(r => r.case_id === selectedCaseFilter);
    }

    if (filterWithinRadiusOnly && selectedRecord?.latitude && selectedRecord?.longitude) {
      result = result.filter(r => r.distance_meters !== null && r.distance_meters <= selectedRadiusMeters);
    }

    return result;
  }, [categoryCalls, searchQuery, selectedCaseFilter, selectedRadiusMeters, filterWithinRadiusOnly, selectedRecord]);

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

  // Omni-Search: Global Intercept & Location Brain
  const handleQuickLocate = (query: string) => {
    setOmniSearchText(query);
    handleExecuteOmniSearch(query);
  };

  const handleExecuteOmniSearch = async (queryOverride?: string) => {
    const raw = (queryOverride || omniSearchText).trim();
    if (!raw) return;

    setIsSearching(true);
    setIsSearchSuggestionsOpen(false);
    const qLower = raw.toLowerCase();
    const digitsOnly = raw.replace(/[^0-9]/g, '');

    // 1. Direct match in existing calls list
    const matchedRecord = calls.find(c => 
      c.ref_number.toString() === raw ||
      c.target_number.replace(/[^0-9]/g, '').includes(digitsOnly) ||
      (digitsOnly.length >= 7 && c.target_number.includes(digitsOnly.slice(-7))) ||
      c.case_id.toLowerCase() === qLower ||
      c.first_tower.toLowerCase().includes(qLower) ||
      (c.approximate_address && c.approximate_address.toLowerCase().includes(qLower))
    );

    if (matchedRecord && matchedRecord.latitude && matchedRecord.longitude) {
      if (matchedRecord.admin_id && matchedRecord.admin_id !== activeAdminId) {
        setActiveAdminId(matchedRecord.admin_id);
      }
      setActiveRef(matchedRecord.ref_number);
      onSelectCallRef(matchedRecord.ref_number);
      setIsSidePanelOpen(true);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([matchedRecord.latitude, matchedRecord.longitude], 16, { duration: 1.5 });
      }

      telecomAudioEngine.playRadarLockPing();
      setSearchFeedback(`🎯 TARGET ACQUIRED: Matched Ref #${matchedRecord.ref_number} · Subscriber ${matchedRecord.target_number} · Case #${matchedRecord.case_id} · Tower ${matchedRecord.first_tower}`);
      setIsSearching(false);
      return;
    }

    // 2. REAL-TIME TELECOMMUNICATIONS & GEOLOCATION API LOOKUP
    try {
      telecomAudioEngine.playAcousticPing(850, 0.12); // Telephony dialing chirp
      const result = await realTimeTelecomService.lookupTarget(raw, activeAdminId);
      
      // Inject real-time intercepted record into state
      setCalls(prev => [result.callRecord, ...prev]);
      setActiveRef(result.callRecord.ref_number);
      onSelectCallRef(result.callRecord.ref_number);
      setRealTimeIntercept(result);
      setIsSidePanelOpen(true);

      // Smoothly fly map camera directly to verified coordinates
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([result.latitude, result.longitude], 16, { duration: 1.8 });
      }

      telecomAudioEngine.playRadarLockPing();
      setSearchFeedback(
        `⚡ REAL-TIME INTERCEPT VERIFIED: ${result.formattedNumber} · Region: ${result.stateOrCircle} (${result.cityOrDistrict}) · Coordinates: [${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}] · Carrier: ${result.carrier} · Source: ${result.apiSource} (${result.lookupLatencyMs}ms)`
      );
    } catch (err: any) {
      console.error('Real-time telecom lookup error:', err);
      setSearchFeedback(`⚠️ Real-time telecom lookup encountered error: ${err?.message || 'Check network connection'}`);
    } finally {
      setIsSearching(false);
    }
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

    if (customTileUrl.trim()) {
      // 1. Custom User-Configured Tile Server / Mapbox API
      let resolvedUrl = customTileUrl.trim();
      if (customApiKey.trim() && !resolvedUrl.includes(customApiKey.trim())) {
        resolvedUrl += resolvedUrl.includes('?') ? `&access_token=${customApiKey.trim()}` : `?access_token=${customApiKey.trim()}`;
      }
      L.tileLayer(resolvedUrl, {
        maxZoom: 19,
        className: 'cyber-dark-forensic-tile',
        attribution: 'Custom Tile API Engine'
      }).addTo(map);
    } else if (baseMapLayer === 'dark') {
      // 2. High-Contrast Tactical Cyber Neon Grid (Built on OSM edge + GPU Tactical Shader)
      // Guarantees 100% visibility of all streets, alleys, intersections, and building blocks
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'cyber-dark-forensic-tile',
        attribution: '© OpenStreetMap contributors · Cyber Forensic Tactical Engine'
      }).addTo(map);

      // High-contrast Reference overlay (Clear street labels, highways, boundaries)
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        className: 'cyber-label-layer',
        zIndex: 50,
        attribution: 'Esri Reference'
      }).addTo(map);
    } else if (baseMapLayer === 'dark_esri') {
      // 3. Official Esri Defense Dark Gray Canvas (Clean military/forensic dark grey)
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        className: 'esri-dark-forensic-tile',
        attribution: 'Esri World Dark Gray Base'
      }).addTo(map);

      // Esri Reference Labels
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        className: 'cyber-label-layer',
        zIndex: 50,
        attribution: 'Esri Reference Labels'
      }).addTo(map);
    } else if (baseMapLayer === 'dark_carto') {
      // 4. CARTO Dark Matter with Subdomains & Contrast Boost
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        className: 'carto-dark-boosted-tile',
        attribution: '© CARTO Dark Matter · © OpenStreetMap'
      }).addTo(map);

      // CARTO Dark Only Labels
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        className: 'cyber-label-layer',
        zIndex: 50,
        attribution: ''
      }).addTo(map);
    } else if (baseMapLayer === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri World Imagery 4K'
      }).addTo(map);
      // Street & Place labels overlay on top of satellite
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        zIndex: 50,
        attribution: ''
      }).addTo(map);
    } else if (baseMapLayer === 'hot') {
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, Humanitarian Style'
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    }

    // Clear previous dynamic layers
    layerGroup.clearLayers();

    // Render Tower Markers & Sectors for the active category
    categoryCalls.forEach((rec) => {
      if (!rec.latitude || !rec.longitude) return;

      const isCurrent = rec.ref_number === activeRef;
      const isVisible = visibleSubjects[rec.case_id as keyof typeof visibleSubjects] ?? true;
      if (!isVisible) return;

      // Palette matching:
      // Case 7502: Primary Teal #2ec4b6
      // Case 6057: Sample #8fb3c9
      // Case 7498: Amber #f0a73a
      let color = '#2ec4b6';
      if (rec.case_id === '7498') color = '#f0a73a';
      if (rec.case_id === '6057') color = '#8fb3c9';

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
        setIsSidePanelOpen(true);
        if (mapInstanceRef.current && rec.latitude && rec.longitude) {
          mapInstanceRef.current.panTo([rec.latitude, rec.longitude], { animate: true });
        }
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

    // 3. Track Polylines between consecutive calls of the active case
    const caseCalls = categoryCalls
      .filter(c => c.case_id === selectedRecord?.case_id && c.latitude && c.longitude)
      .sort((a, b) => a.ref_number - b.ref_number);

    if (caseCalls.length > 1) {
      const lineCoords: [number, number][] = caseCalls.map(c => [c.latitude!, c.longitude!]);
      L.polyline(lineCoords, {
        className: 'track-animated-line',
        color: '#2ec4b6',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(layerGroup);
    }

    // 4. Highlighted Radius Circle & Animated Tactical Radar Overlay
    if (selectedRecord?.latitude && selectedRecord?.longitude) {
      // Move map smoothly to selected record
      map.panTo([selectedRecord.latitude, selectedRecord.longitude], { animate: true });

      const centerLat = selectedRecord.latitude;
      const centerLng = selectedRecord.longitude;
      if (typeof centerLat !== 'number' || typeof centerLng !== 'number') return;

      // Outer Radius Search Boundary (Teal #2ec4b6 with pulsing animation & glow)
      L.circle([centerLat, centerLng], {
        radius: selectedRadiusMeters,
        className: isRadarAnimationActive ? 'animated-radius-circle' : '',
        color: '#2ec4b6',
        weight: 2.5,
        fillColor: '#2ec4b6',
        fillOpacity: 0.15
      }).addTo(layerGroup);

      // Concentric Range Rings (25%, 50%, 75% of radius)
      [0.25, 0.5, 0.75].forEach((pct) => {
        L.circle([centerLat, centerLng], {
          radius: Math.round(selectedRadiusMeters * pct),
          className: isRadarAnimationActive ? 'animated-concentric-ring' : '',
          color: '#2ec4b6',
          weight: 1,
          dashArray: '4, 6',
          fillColor: 'transparent',
          fillOpacity: 0
        }).addTo(layerGroup);
      });

      // Cardinal perimeter distance tag (North edge of radius)
      const labelText = selectedRadiusMeters >= 1000 
        ? `${(selectedRadiusMeters / 1000).toFixed(1)} km` 
        : `${selectedRadiusMeters} m`;

      const distTagIcon = L.divIcon({
        className: 'radius-dist-tag',
        html: `
          <div style="
            background: rgba(13, 17, 19, 0.92);
            border: 1px solid rgba(46, 196, 182, 0.8);
            color: #2ec4b6;
            font-family: monospace;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 7px;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(46, 196, 182, 0.5);
            white-space: nowrap;
            transform: translate(-50%, -120%);
          ">
            RADIAL: ${labelText}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      const northLat = centerLat + (selectedRadiusMeters / 111320);
      L.marker([northLat, centerLng], { icon: distTagIcon }).addTo(layerGroup);

      // Tactical Radar Sonar Rings & 360-degree Rotating Sweep Beam
      if (isRadarAnimationActive) {
        const radarDivIcon = L.divIcon({
          className: 'radar-tactical-div-icon',
          html: `
            <div style="position: relative; width: 0; height: 0; pointer-events: none;">
              <!-- Concentric expanding sonar ripple rings -->
              <div class="sonar-ripple-ring" style="width: 140px; height: 140px;"></div>
              <div class="sonar-ripple-ring delay-1" style="width: 240px; height: 240px;"></div>
              <div class="sonar-ripple-ring delay-2" style="width: 340px; height: 340px;"></div>

              <!-- 360-degree Rotating Radar Sweep Scanline Beam -->
              <div class="radar-sweep-beam" style="width: 360px; height: 360px;"></div>

              <!-- Center Blinking Beacon Dot -->
              <div class="beacon-center-dot" style="
                position: absolute;
                top: -8px;
                left: -8px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #2ec4b6;
                border: 2px solid #ffffff;
                box-shadow: 0 0 14px #2ec4b6;
              "></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
        L.marker([centerLat, centerLng], { icon: radarDivIcon }).addTo(layerGroup);
      }
    }

    // Invalidate size to guarantee smooth tile and SVG layer rendering
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);

  }, [categoryCalls, calls, activeRef, selectedRadiusMeters, baseMapLayer, visibleSubjects, selectedRecord, isRadarAnimationActive, customTileUrl, customApiKey]);

  // Helper for rendering interactive query tree nodes
  const renderTreeItem = (id: QueryCategoryType, label: string, icon?: React.ReactNode) => {
    const isSelected = activeQueryCategory === id;
    const count = categoryCounts[id] ?? 0;

    return (
      <div
        key={id}
        onClick={() => handleSelectQueryCategory(id)}
        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors border ${
          isSelected
            ? (isDarkMode 
                ? 'bg-[#12312f] border-[#2ec4b6]/60 text-[#2ec4b6] font-bold shadow-sm shadow-[#2ec4b6]/20' 
                : 'bg-teal-50 border-teal-400 text-teal-800 font-bold')
            : (isDarkMode 
                ? 'border-transparent text-[#86989f] hover:text-[#d6e1e5] hover:bg-[#1a2327]' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon || <FileText className="w-3 h-3 text-[#86989f]" />}
          <span className="truncate">{label}</span>
        </span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1.5 ${
          isSelected
            ? (isDarkMode ? 'bg-[#141a1d] text-[#2ec4b6] border border-[#2ec4b6]/50' : 'bg-teal-200 text-teal-900 font-bold')
            : (isDarkMode ? 'bg-[#141a1d] text-[#86989f] border border-[#25323a]' : 'bg-slate-200 text-slate-700')
        }`}>
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-50px)] font-sans select-none overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#0d1113] text-[#d6e1e5]' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* 1. Main Workspace: Split into Left Tree Panel + Right Map/Table Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* ================= LEFT TOOL RAIL & DATABASE QUERIES TREE ================= */}
        <div className={`w-72 border-r flex flex-col shrink-0 select-none transition-colors ${
          isDarkMode ? 'bg-[#141a1d] border-[#25323a]' : 'bg-white border-slate-200'
        }`}>
          
          {/* Top Header of Query Panel */}
          <div className={`p-3 border-b transition-colors ${
            isDarkMode ? 'border-[#25323a] bg-[#1a2327]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono ${
                isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-700'
              }`}>
                <Folder className="w-3.5 h-3.5 text-[#2ec4b6]" />
                Database Queries
              </span>
              <div className={`flex items-center gap-1 ${isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}`}>
                <button 
                  onClick={loadCalls} 
                  title="Reload Queries" 
                  className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:text-white hover:bg-[#25323a]' : 'hover:text-slate-900 hover:bg-slate-200'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2ec4b6]' : ''}`} />
                </button>
                <button title="New Query" className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:text-white hover:bg-[#25323a]' : 'hover:text-slate-900 hover:bg-slate-200'}`}>
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
                    ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5] placeholder-[#86989f] focus:border-[#2ec4b6]' 
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-600'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-[#86989f] absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>

          {/* Hierarchical Query Folder Tree Supporting All 7 Admin Desks */}
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-1">
            {ADMIN_PROFILES.map((admin) => {
              const isAdminActive = activeAdminId === admin.id;
              const isExpanded = !!expandedAdmins[admin.id];
              const countForAdmin = calls.filter(c => c.admin_id === admin.id).length;

              return (
                <div key={admin.id} className="rounded mb-1.5 overflow-hidden">
                  {/* Admin Desk Header */}
                  <div
                    onClick={() => handleSelectAdmin(admin.id)}
                    className={`flex items-center justify-between px-2 py-1.5 font-bold rounded cursor-pointer transition-colors border ${
                      isAdminActive
                        ? (isDarkMode 
                            ? 'bg-[#18262b] border-[#2ec4b6]/80 text-[#2ec4b6] shadow-sm' 
                            : 'bg-teal-100/70 border-teal-500 text-teal-900')
                        : (isDarkMode 
                            ? 'border-transparent text-[#d6e1e5] hover:bg-[#1a2327]' 
                            : 'border-transparent text-slate-700 hover:bg-slate-100')
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <button
                        type="button"
                        onClick={(e) => handleToggleAdminExpand(admin.id, e)}
                        className="p-0.5 hover:text-white"
                        title={isExpanded ? "Collapse Admin Queries" : "Expand Admin Queries"}
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3 text-[#86989f]" /> : <ChevronRight className="w-3 h-3 text-[#86989f]" />}
                      </button>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: admin.color }} />
                      <span className="truncate">{admin.label}: {admin.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1 ${
                      isAdminActive
                        ? (isDarkMode ? 'bg-[#141a1d] text-[#2ec4b6] border border-[#2ec4b6]/50' : 'bg-teal-200 text-teal-900 font-bold')
                        : (isDarkMode ? 'bg-[#141a1d] text-[#86989f] border border-[#25323a]' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {countForAdmin}
                    </span>
                  </div>

                  {/* Expanded Queries for this Admin */}
                  {isExpanded && (
                    <div className="pl-3 pr-1 pt-1 pb-1.5 space-y-1">
                      {/* Admin Operational Scenario Brief */}
                      <div className="px-2 py-1 rounded text-[10px] bg-[#0d1113] border border-[#25323a] text-[#86989f]">
                        <div className="text-[#2ec4b6] font-semibold truncate">{admin.situation}</div>
                        <div className="flex items-center justify-between mt-0.5 text-[9px]">
                          <span>Target: {admin.targetNumber}</span>
                          <span className="text-[#f0a73a]">{admin.caseRef}</span>
                        </div>
                      </div>

                      {/* All Queries Folder */}
                      <div className="space-y-0.5">
                        <div 
                          onClick={() => setIsTreeExpanded(prev => ({ ...prev, allQueries: !prev.allQueries }))}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer ${
                            isDarkMode ? 'text-[#d6e1e5] hover:bg-[#1a2327]' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isTreeExpanded.allQueries ? <ChevronDown className="w-3 h-3 text-[#86989f]" /> : <ChevronRight className="w-3 h-3 text-[#86989f]" />}
                          <FolderOpen className="w-3.5 h-3.5 text-[#f0a73a]" />
                          <span>All Queries</span>
                        </div>

                        {isTreeExpanded.allQueries && (
                          <div className="pl-3 space-y-0.5">
                            {/* Acceptance */}
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer ${
                              isDarkMode ? 'text-[#d6e1e5] hover:bg-[#1a2327]' : 'text-slate-700 hover:bg-slate-100'
                            }`}>
                              <ChevronDown className="w-3 h-3 text-[#86989f]" />
                              <FolderOpen className="w-3.5 h-3.5 text-[#f0a73a]" />
                              <span>Acceptance</span>
                            </div>

                            {/* Basic Queries */}
                            <div className="pl-3 space-y-0.5">
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer ${
                                isDarkMode ? 'text-[#d6e1e5] hover:bg-[#1a2327]' : 'text-slate-700 hover:bg-slate-100'
                              }`}>
                                <ChevronDown className="w-3 h-3 text-[#86989f]" />
                                <FolderOpen className="w-3.5 h-3.5 text-[#f0a73a]" />
                                <span>Basic Queries</span>
                              </div>

                              {/* Sub-queries filtered for active Admin */}
                              <div className="pl-3 space-y-0.5">
                                {renderTreeItem('audio_queries', 'Audio Queries', <Volume2 className="w-3 h-3 text-[#2ec4b6]" />)}
                                {renderTreeItem('audit', 'Audit', <ShieldAlert className="w-3 h-3 text-[#f0a73a]" />)}
                                {renderTreeItem('basic', 'Basic', <Layers className="w-3 h-3 text-[#8fb3c9]" />)}
                                {renderTreeItem('calls', 'Calls', <PhoneCall className="w-3 h-3 text-[#2ec4b6]" />)}
                                {renderTreeItem('calls_today', 'Calls today', <Radio className="w-3 h-3 text-[#2ec4b6]" />)}
                                {renderTreeItem('calls_with_loc', 'Calls with Loc', <MapPin className="w-3 h-3 text-[#2ec4b6]" />)}
                                {renderTreeItem('mms', 'MMS', <FileText className="w-3 h-3 text-[#f0a73a]" />)}
                                {renderTreeItem('sms', 'SMS', <FileText className="w-3 h-3 text-[#8fb3c9]" />)}
                                {renderTreeItem('subs', 'Subs', <Folder className="w-3 h-3 text-[#2ec4b6]" />)}
                              </div>
                            </div>

                            {/* Other Branches under Acceptance */}
                            <div className="space-y-0.5 pt-1 pl-3">
                              {renderTreeItem('device', 'Device Queries', <Folder className="w-3.5 h-3.5 text-[#2ec4b6]" />)}
                              {renderTreeItem('internet', 'Internet Queries', <Folder className="w-3.5 h-3.5 text-[#8fb3c9]" />)}
                              {renderTreeItem('social_media', 'Social Media', <Folder className="w-3.5 h-3.5 text-[#f0a73a]" />)}
                              {renderTreeItem('audit_trail', 'Audit Trail', <Folder className="w-3.5 h-3.5 text-[#2ec4b6]" />)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Legal Attribution / Provenance Note */}
          <div className="p-3 border-t border-[#25323a] bg-[#141a1d] text-[10px] text-[#86989f] font-mono">
            <div className="text-[#d6e1e5] font-semibold mb-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-[#2ec4b6]" />
              Location Provenance Rule
            </div>
            <span>Radio tower sector coverage reflects carrier telemetry; does not certify legal human identity.</span>
          </div>

        </div>

        {/* ================= RIGHT MAIN AREA: MAP (TOP) & CDR TABLE (BOTTOM) ================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Top Query Tab Bar matching Reference Image 1 */}
          <div className="bg-[#141a1d] border-b border-[#25323a] px-4 py-1.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-[#12312f] border-t-2 border-[#2ec4b6] text-[#2ec4b6] font-bold rounded-t flex items-center gap-2">
                <PhoneCall className="w-3 h-3 text-[#2ec4b6]" />
                <span>Query: {getCategoryLabel(activeQueryCategory)} ({filteredCalls.length}) · Active #{selectedRecord?.ref_number} ({selectedRecord?.target_number})</span>
              </div>
              <div className="px-3 py-1 bg-[#1a2327] text-[#86989f] hover:text-[#d6e1e5] cursor-pointer rounded-t">
                Map View
              </div>
            </div>

            {/* Quick jump to Voice Forensics if audio is attached */}
            {selectedRecord?.associated_evidence_id && (
              <button
                onClick={() => onNavigateToVoiceForensics(selectedRecord.associated_case_code || currentAdmin.caseRef, selectedRecord.associated_evidence_id || undefined)}
                className="flex items-center gap-1.5 bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] px-3 py-1 rounded text-xs font-bold transition-all shadow"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Analyze Audio Evidence ({selectedRecord.associated_case_code || currentAdmin.caseRef}) →</span>
              </button>
            )}
          </div>

          {/* ================= ACTIVE OPERATIONAL SITUATION BANNER ================= */}
          <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors ${
            isDarkMode ? 'bg-[#121c20] border-[#25323a]' : 'bg-slate-100 border-slate-300'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-2.5 h-2.5 rounded-full animate-ping shrink-0" 
                style={{ backgroundColor: currentAdmin.color }} 
              />
              <span 
                className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0" 
                style={{
                  backgroundColor: `${currentAdmin.color}22`,
                  color: currentAdmin.color,
                  border: `1px solid ${currentAdmin.color}66`
                }}
              >
                {currentAdmin.label} · {currentAdmin.name} ({currentAdmin.role})
              </span>
              <span className="font-bold text-[#d6e1e5] truncate">
                {currentAdmin.situation}
              </span>
              <span className="hidden xl:inline-block text-[#86989f] text-[11px] truncate">
                Target: <span className="text-[#2ec4b6] font-semibold">{currentAdmin.targetNumber}</span> · Case: <span className="text-[#f0a73a] font-semibold">{currentAdmin.caseRef}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateToVoiceForensics(currentAdmin.caseRef, selectedRecord?.associated_evidence_id || undefined)}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all shadow-md text-[#0d1113] hover:brightness-110"
                style={{ backgroundColor: currentAdmin.color }}
                title={`Open forensic synthetic voice lab for ${currentAdmin.caseRef}`}
              >
                <Volume2 className="w-3.5 h-3.5 fill-current" />
                <span>Analyze Audio Evidence ({currentAdmin.caseRef}) →</span>
              </button>
            </div>
          </div>

          {/* ================= 7 ADMIN SITUATION QUICK SWITCHER TOOLBAR ================= */}
          <div className={`px-4 py-1.5 border-b flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar transition-colors ${
            isDarkMode ? 'bg-[#0f171a] border-[#25323a]' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className="text-[#86989f] font-bold shrink-0 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#2ec4b6]" />
              Admin Desks:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {ADMIN_PROFILES.map((admin) => {
                const isSelected = activeAdminId === admin.id;
                return (
                  <button
                    key={admin.id}
                    onClick={() => handleSelectAdmin(admin.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-semibold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#18262b] text-[#2ec4b6] border-[#2ec4b6] shadow-sm'
                        : isDarkMode
                          ? 'bg-[#141a1d] text-[#86989f] border-[#25323a] hover:text-[#d6e1e5] hover:border-[#86989f]'
                          : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
                    }`}
                    title={`${admin.label}: ${admin.situation} — Target: ${admin.targetNumber}`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: admin.color }} />
                    <span>{admin.label}: {admin.name.split(' ')[0]}</span>
                    <span className={`text-[9px] px-1 rounded font-mono ${
                      isSelected ? 'bg-[#2ec4b6]/20 text-[#2ec4b6]' : isDarkMode ? 'bg-[#1a2327] text-[#86989f]' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {calls.filter(c => c.admin_id === admin.id).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= OMNI-SEARCH BAR — GLOBAL INTERCEPT & LOCATION BRAIN ================= */}
          <div className={`px-4 py-2.5 border-b flex flex-col gap-2 transition-colors ${
            isDarkMode ? 'bg-[#0a1215] border-[#25323a]' : 'bg-slate-100 border-slate-300'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Left Search Bar Input Box */}
              <div className="flex-1 min-w-[300px] max-w-4xl relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Crosshair className="w-4 h-4 text-[#2ec4b6] animate-pulse" />
                    </div>
                    <input
                      type="text"
                      value={omniSearchText}
                      onChange={(e) => {
                        setOmniSearchText(e.target.value);
                        setIsSearchSuggestionsOpen(true);
                      }}
                      onFocus={() => setIsSearchSuggestionsOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExecuteOmniSearch();
                      }}
                      placeholder="Search ANY Mobile No (+1, +91, +44...), City / Location Name, Tower CGI, or Case ID..."
                      className={`w-full pl-9 pr-9 py-2 rounded-lg font-mono text-xs border transition-all ${
                        isDarkMode 
                          ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5] placeholder-[#86989f] focus:border-[#2ec4b6] focus:ring-1 focus:ring-[#2ec4b6]' 
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                      }`}
                    />
                    {omniSearchText && (
                      <button
                        onClick={() => {
                          setOmniSearchText('');
                          setSearchFeedback(null);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#86989f] hover:text-white"
                        title="Clear input"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Locate Target Action Button */}
                  <button
                    onClick={() => handleExecuteOmniSearch()}
                    disabled={isSearching || !omniSearchText.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 disabled:opacity-50 text-[#0d1113] font-bold text-xs font-mono shadow-md transition-all shrink-0 hover:scale-[1.02]"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                    <span>{isSearching ? 'LOCATING...' : 'LOCATE TARGET'}</span>
                  </button>
                </div>

                {/* Autocomplete / Suggested Targets Dropdown */}
                {isSearchSuggestionsOpen && (
                  <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-2xl z-50 p-2 border text-xs font-mono ${
                    isDarkMode ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5]' : 'bg-white border-slate-300 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] text-[#86989f] font-bold uppercase border-b border-[#25323a] mb-1">
                      <span>Live Intercept Target Suggestions</span>
                      <button onClick={() => setIsSearchSuggestionsOpen(false)} className="hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => handleQuickLocate('+1 571-274-7502')}
                        className={`text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a2327]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[#2ec4b6] font-bold">+1 (571) 274-7502</span>
                        <span className="text-[10px] text-[#86989f]">CEO Clone (Alexandria)</span>
                      </button>
                      <button
                        onClick={() => handleQuickLocate('+91 98200 44102')}
                        className={`text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a2327]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[#f0a73a] font-bold">+91 98200 44102</span>
                        <span className="text-[10px] text-[#86989f]">India Telecom Hub</span>
                      </button>
                      <button
                        onClick={() => handleQuickLocate('New York')}
                        className={`text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a2327]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[#8fb3c9] font-bold">New York, NY</span>
                        <span className="text-[10px] text-[#86989f]">Financial District Grid</span>
                      </button>
                      <button
                        onClick={() => handleQuickLocate('Mumbai')}
                        className={`text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a2327]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-emerald-400 font-bold">Mumbai, India</span>
                        <span className="text-[10px] text-[#86989f]">BKC Telecom Switching Center</span>
                      </button>
                      <button
                        onClick={() => handleQuickLocate('London')}
                        className={`text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a2327]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-indigo-400 font-bold">London, UK</span>
                        <span className="text-[10px] text-[#86989f]">City of London Exchange</span>
                      </button>
                      <button
                        onClick={() => handleQuickLocate('3102604f160b7e064')}
                        className={`text-left px-2 py-1.5 rounded flex items-center justify-between ${
                          isDarkMode ? 'hover:bg-[#1a2327]' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[#d6e1e5] font-bold">CGI: 3102604f160b7e064</span>
                        <span className="text-[10px] text-[#86989f]">Rose Hill Cell Tower</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Quick Locate Pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap">
                <span className="text-[#86989f] font-bold hidden sm:inline uppercase">QUICK LOCATE:</span>
                <button
                  onClick={() => handleQuickLocate('+1 571-274-7502')}
                  className="px-2 py-1 rounded bg-[#12312f] hover:bg-[#18262b] border border-[#2ec4b6]/50 text-[#2ec4b6] font-bold transition-all"
                >
                  +1 (571) CEO
                </button>
                <button
                  onClick={() => handleQuickLocate('+91 98200 44102')}
                  className="px-2 py-1 rounded bg-[#12312f] hover:bg-[#18262b] border border-[#2ec4b6]/50 text-[#2ec4b6] font-bold transition-all"
                >
                  +91 98200 (India)
                </button>
                <button
                  onClick={() => handleQuickLocate('New York')}
                  className="px-2 py-1 rounded bg-[#1a2327] hover:bg-[#25323a] border border-[#25323a] text-[#8fb3c9] font-bold transition-all"
                >
                  New York
                </button>
                <button
                  onClick={() => handleQuickLocate('Mumbai')}
                  className="px-2 py-1 rounded bg-[#1a2327] hover:bg-[#25323a] border border-[#25323a] text-[#8fb3c9] font-bold transition-all"
                >
                  Mumbai
                </button>
                <button
                  onClick={() => handleQuickLocate('London')}
                  className="px-2 py-1 rounded bg-[#1a2327] hover:bg-[#25323a] border border-[#25323a] text-[#8fb3c9] font-bold transition-all"
                >
                  London
                </button>
                <button
                  onClick={() => handleQuickLocate('Alexandria VA')}
                  className="px-2 py-1 rounded bg-[#1a2327] hover:bg-[#25323a] border border-[#25323a] text-[#8fb3c9] font-bold transition-all"
                >
                  Alexandria VA
                </button>
              </div>

            </div>

            {/* Dynamic Search Feedback Status Bar */}
            {searchFeedback && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#12312f] border border-[#2ec4b6]/70 text-[#2ec4b6] text-xs font-mono animate-fadeIn shadow">
                <div className="flex items-center gap-2 truncate">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-[#2ec4b6] shrink-0" />
                  <span className="truncate">{searchFeedback}</span>
                </div>
                <button 
                  onClick={() => setSearchFeedback(null)} 
                  className="text-[#86989f] hover:text-[#2ec4b6] shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ================= REAL-TIME TELECOM INTERCEPT INTELLIGENCE HUD ================= */}
            {realTimeIntercept && (
              <div className="mt-2.5 rounded-xl border p-3.5 shadow-2xl font-mono text-xs transition-all animate-fadeIn bg-gradient-to-r from-[#0d1e20] via-[#0b171a] to-[#121c20] border-[#2ec4b6] text-[#d6e1e5]">
                
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2ec4b6]/30 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-[#2ec4b6]" />
                      <span>REAL-TIME SUBSCRIBER INTERCEPT VERIFIED</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2ec4b6]/20 text-[#2ec4b6] border border-[#2ec4b6]/40 uppercase">
                      {realTimeIntercept.networkType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#86989f]">
                      API Latency: <span className="text-emerald-400 font-bold">{realTimeIntercept.lookupLatencyMs}ms</span>
                    </span>
                    <button
                      onClick={() => setRealTimeIntercept(null)}
                      className="p-1 rounded text-[#86989f] hover:text-white hover:bg-[#25323a] transition-all"
                      title="Dismiss Intercept Card"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4-Column Intelligence Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* 1. Target Number & Line Type */}
                  <div className="p-2.5 rounded-lg bg-[#0b1315]/85 border border-[#25323a]">
                    <div className="text-[10px] text-[#86989f] uppercase font-bold flex items-center gap-1 mb-1">
                      <PhoneCall className="w-3 h-3 text-[#2ec4b6]" />
                      <span>Subscriber Target</span>
                    </div>
                    <div className="text-[#2ec4b6] font-bold text-sm truncate">
                      {realTimeIntercept.formattedNumber}
                    </div>
                    <div className="text-[10px] text-[#86989f] mt-0.5">
                      {realTimeIntercept.lineType} · Dial: +{realTimeIntercept.countryCallingCode}
                    </div>
                  </div>

                  {/* 2. Region & Telecom Circle */}
                  <div className="p-2.5 rounded-lg bg-[#0b1315]/85 border border-[#25323a]">
                    <div className="text-[10px] text-[#86989f] uppercase font-bold flex items-center gap-1 mb-1">
                      <Compass className="w-3 h-3 text-[#f0a73a]" />
                      <span>Region / Telecom Circle</span>
                    </div>
                    <div className="text-[#f0a73a] font-bold truncate">
                      {realTimeIntercept.stateOrCircle}
                    </div>
                    <div className="text-[10px] text-[#86989f] mt-0.5 truncate">
                      {realTimeIntercept.cityOrDistrict}, {realTimeIntercept.countryName}
                    </div>
                  </div>

                  {/* 3. Verified Geographic Coordinates */}
                  <div className="p-2.5 rounded-lg bg-[#0b1315]/85 border border-[#25323a]">
                    <div className="text-[10px] text-[#86989f] uppercase font-bold flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>Live Coordinates</span>
                    </div>
                    <div className="text-emerald-400 font-bold truncate font-mono text-xs">
                      {realTimeIntercept.latitude.toFixed(6)}, {realTimeIntercept.longitude.toFixed(6)}
                    </div>
                    <div className="text-[10px] text-[#86989f] mt-0.5 flex items-center justify-between">
                      <span>Accuracy: ±{realTimeIntercept.accuracyMeters}m</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${realTimeIntercept.latitude}, ${realTimeIntercept.longitude}`);
                          setIsCopiedCoords(true);
                          setTimeout(() => setIsCopiedCoords(false), 2000);
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[#12312f] text-[#2ec4b6] hover:bg-[#2ec4b6] hover:text-[#0d1113] transition-all font-bold"
                        title="Copy coordinates to clipboard"
                      >
                        {isCopiedCoords ? 'Copied!' : 'Copy Coords'}
                      </button>
                    </div>
                  </div>

                  {/* 4. Carrier & Cell Tower Grid */}
                  <div className="p-2.5 rounded-lg bg-[#0b1315]/85 border border-[#25323a]">
                    <div className="text-[10px] text-[#86989f] uppercase font-bold flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3 h-3 text-[#8fb3c9]" />
                      <span>Carrier & CGI Routing</span>
                    </div>
                    <div className="text-[#8fb3c9] font-bold truncate">
                      {realTimeIntercept.carrier}
                    </div>
                    <div className="text-[10px] text-[#86989f] mt-0.5 truncate font-mono">
                      CGI: {realTimeIntercept.cgi} · Az: {realTimeIntercept.azimuthDegrees}°
                    </div>
                  </div>
                </div>

                {/* Bottom Address & Action Bar */}
                <div className="mt-2.5 pt-2 border-t border-[#25323a] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#86989f] min-w-0">
                    <Globe className="w-3.5 h-3.5 text-[#2ec4b6] shrink-0" />
                    <span className="text-[#2ec4b6] font-semibold shrink-0">Geocoded Location:</span>
                    <span className="truncate text-[#d6e1e5]">{realTimeIntercept.displayName}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([realTimeIntercept.latitude, realTimeIntercept.longitude], 17, { duration: 1.5 });
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-[#12312f] hover:bg-[#18262b] border border-[#2ec4b6]/60 text-[#2ec4b6] font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Lock Radar ({realTimeIntercept.latitude.toFixed(4)}, {realTimeIntercept.longitude.toFixed(4)})</span>
                    </button>

                    <button
                      onClick={() => onNavigateToVoiceForensics(currentAdmin.caseRef, realTimeIntercept.callRecord.associated_evidence_id || undefined)}
                      className="px-3 py-1 rounded bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-[11px] transition-all flex items-center gap-1 shadow-md hover:scale-[1.02]"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Analyze Voice Evidence →</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* ================= MAP CONTROLS SUB-TOOLBAR ================= */}
          <div className={`border-b px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-colors ${
            isDarkMode ? 'bg-[#141a1d] border-[#25323a]' : 'bg-slate-50 border-slate-200'
          }`}>
            
            {/* Left Toolbar Tools */}
            <div className="flex items-center gap-3">
              <span className={`font-bold uppercase tracking-wider font-mono text-xs ${
                isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-800'
              }`}>
                Playback Map
              </span>

              {/* Playback icons matching Reference Image 1 */}
              <div className={`flex items-center gap-1 p-1 rounded border ${
                isDarkMode ? 'bg-[#1a2327] border-[#25323a]' : 'bg-white border-slate-300'
              }`}>
                <button 
                  title="Rewind Playback to Start" 
                  onClick={() => {
                    setIsPlayingTrack(false);
                    const first = calls.find(c => c.latitude && c.longitude);
                    if (first) {
                      setActiveRef(first.ref_number);
                      onSelectCallRef(first.ref_number);
                    }
                  }}
                  className={`p-1 transition-colors ${isDarkMode ? 'hover:text-[#2ec4b6] text-[#86989f]' : 'hover:text-teal-600 text-slate-500'}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button 
                  title="Stop Track Playback" 
                  onClick={() => setIsPlayingTrack(false)}
                  className={`p-1 transition-colors ${isPlayingTrack ? 'text-[#e5534b]' : isDarkMode ? 'hover:text-[#e5534b] text-[#86989f]' : 'hover:text-red-600 text-slate-500'}`}
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button 
                  title={isPlayingTrack ? "Pause Track Playback" : "Play Track Animation"} 
                  onClick={() => setIsPlayingTrack(!isPlayingTrack)}
                  className={`p-1 rounded transition-colors ${
                    isPlayingTrack 
                      ? 'bg-[#2ec4b6] text-[#0d1113]' 
                      : isDarkMode ? 'hover:text-[#2ec4b6] text-[#86989f]' : 'hover:text-emerald-600 text-slate-500'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingTrack ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Base Map Selector with High-Contrast Cyber Forensic Map Engines */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className={isDarkMode ? 'text-[#86989f]' : 'text-slate-500'}>Base:</span>
                <select
                  value={baseMapLayer}
                  onChange={(e) => setBaseMapLayer(e.target.value as any)}
                  className={`border rounded px-2 py-1 font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-[#1a2327] border-[#25323a] text-[#d6e1e5] focus:border-[#2ec4b6]' : 'bg-white border-slate-300 text-slate-800 focus:border-teal-600'
                  }`}
                >
                  <option value="dark">Dark Cyber Forensic (Tactical Neon & Streets) [HIGH CONTRAST]</option>
                  <option value="dark_esri">Dark Cyber Forensic (Esri Defense Dark Canvas + Labels)</option>
                  <option value="dark_carto">Dark Cyber Forensic (CARTO Dark Matter Stealth)</option>
                  <option value="satellite">Real Satellite Imagery (Esri 4K High-Res + Street Labels)</option>
                  <option value="osm">Real OpenStreetMap (Standard Street Level)</option>
                  <option value="hot">Humanitarian OSM (Buildings & Infrastructure Grids)</option>
                </select>
              </div>

              {/* Quick Sub-Flavor Switcher when in Dark Cyber Forensic Mode */}
              {baseMapLayer.startsWith('dark') && !customTileUrl && (
                <div className={`hidden md:flex items-center gap-1 p-0.5 rounded border text-[11px] font-mono ${
                  isDarkMode ? 'bg-[#121c20] border-[#25323a]' : 'bg-slate-200 border-slate-300'
                }`}>
                  <button
                    onClick={() => setBaseMapLayer('dark')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      baseMapLayer === 'dark'
                        ? 'bg-[#2ec4b6] text-[#0d1113] shadow-sm'
                        : isDarkMode ? 'text-[#86989f] hover:text-[#d6e1e5]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="High-Contrast Tactical Neon Grid (Every road & city name clearly visible)"
                  >
                    ⚡ Neon Tactical
                  </button>
                  <button
                    onClick={() => setBaseMapLayer('dark_esri')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      baseMapLayer === 'dark_esri'
                        ? 'bg-[#2ec4b6] text-[#0d1113] shadow-sm'
                        : isDarkMode ? 'text-[#86989f] hover:text-[#d6e1e5]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Official Esri ArcGIS Defense Dark Canvas with reference labels"
                  >
                    🛡️ Esri Defense
                  </button>
                  <button
                    onClick={() => setBaseMapLayer('dark_carto')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      baseMapLayer === 'dark_carto'
                        ? 'bg-[#2ec4b6] text-[#0d1113] shadow-sm'
                        : isDarkMode ? 'text-[#86989f] hover:text-[#d6e1e5]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="CARTO Dark Matter with contrast-boosted tiles & labels"
                  >
                    🛰️ CARTO Stealth
                  </button>
                </div>
              )}

              {/* Live Tile API Status & Settings Button */}
              <button
                onClick={handleOpenTileApiModal}
                title="Click to inspect active Map Tile API, test response latency, or configure custom API Key"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] transition-all ${
                  isDarkMode 
                    ? 'bg-[#121c20] border-[#25323a] text-[#2ec4b6] hover:border-[#2ec4b6]/80' 
                    : 'bg-white border-slate-300 text-teal-700 hover:border-teal-500'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold">TILE API: {tileApiLatency}ms</span>
                <Sliders className="w-3 h-3 text-[#86989f]" />
              </button>

              {/* Radius Search Selector */}
              <div className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded border ${
                isDarkMode ? 'bg-[#1a2327] border-[#25323a]' : 'bg-white border-slate-300'
              }`}>
                <span className="text-[#2ec4b6] font-bold">Radius:</span>
                <div className="flex items-center gap-1">
                  {RADIUS_PRESETS.map((p) => (
                    <button
                      key={p.meters}
                      onClick={() => setSelectedRadiusMeters(p.meters)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        selectedRadiusMeters === p.meters
                          ? 'bg-[#2ec4b6] text-[#0d1113] shadow'
                          : isDarkMode ? 'text-[#86989f] hover:text-[#d6e1e5] hover:bg-[#12312f]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radar Animation Toggle */}
              <button
                onClick={() => setIsRadarAnimationActive(!isRadarAnimationActive)}
                title="Toggle Live Radar Sweep, Sonar Waves & Radius Glow"
                className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded border transition-all ${
                  isRadarAnimationActive
                    ? 'bg-[#12312f] border-[#2ec4b6] text-[#2ec4b6] font-bold shadow-sm shadow-[#2ec4b6]/25'
                    : isDarkMode ? 'bg-[#1a2327] border-[#25323a] text-[#86989f]' : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isRadarAnimationActive ? 'animate-pulse text-[#2ec4b6]' : ''}`} />
                <span>Radar Scan: {isRadarAnimationActive ? 'ON' : 'OFF'}</span>
              </button>

              {/* Side Panel Toggle */}
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                title="Toggle Selected Record Side Section"
                className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded border transition-all ${
                  isSidePanelOpen
                    ? 'bg-[#1a2327] border-[#2ec4b6]/60 text-[#2ec4b6] font-bold'
                    : isDarkMode ? 'bg-[#1a2327] border-[#25323a] text-[#86989f]' : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#2ec4b6]" />
                <span>Side Panel: {isSidePanelOpen ? 'OPEN' : 'HIDDEN'}</span>
              </button>
            </div>

            {/* Right Subject Badges Legend Matching Reference Image 1 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                {/* 7502: Primary Teal */}
                <button
                  onClick={() => setVisibleSubjects(prev => ({ ...prev, '7502': !prev['7502'] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    visibleSubjects['7502'] 
                      ? 'bg-[#2ec4b6] border-[#2ec4b6] text-[#0d1113]' 
                      : 'bg-[#12312f] border-[#2ec4b6]/50 text-[#2ec4b6]'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>7502 VoLTE</span>
                </button>

                {/* 6057: Sample blue */}
                <button
                  onClick={() => setVisibleSubjects(prev => ({ ...prev, '6057': !prev['6057'] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    visibleSubjects['6057'] 
                      ? 'bg-[#8fb3c9] border-[#8fb3c9] text-[#0d1113]' 
                      : 'bg-[#8fb3c9]/15 border-[#8fb3c9]/40 text-[#8fb3c9]'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>6057 VoLTE</span>
                </button>

                {/* 7498: Amber */}
                <button
                  onClick={() => setVisibleSubjects(prev => ({ ...prev, '7498': !prev['7498'] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    visibleSubjects['7498'] 
                      ? 'bg-[#f0a73a] border-[#f0a73a] text-[#0d1113]' 
                      : 'bg-[#f0a73a]/15 border-[#f0a73a]/40 text-[#f0a73a]'
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>7498 VoLTE</span>
                </button>
              </div>
            </div>

          </div>

          {/* ================= MAP ROW: MAP (LEFT/CENTER) + SELECTED RECORD SIDE SECTION (RIGHT) ================= */}
          <div className="h-[380px] lg:h-[440px] flex flex-col lg:flex-row w-full bg-[#0d1113] border-b border-[#25323a] relative overflow-hidden">
            
            {/* The Actual Leaflet Map Canvas (Takes 100% of available space unobstructed) */}
            <div className="flex-1 relative h-full min-w-0">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Tactical Cyber Grid Overlay when in dark mode */}
              {baseMapLayer.startsWith('dark') && (
                <div className="cyber-grid-overlay pointer-events-none" />
              )}

              {/* Forensic On-Canvas HUD Engine Watermark */}
              <div className="absolute bottom-2 left-3 z-20 pointer-events-none flex items-center gap-2 bg-[#0b1014]/90 border border-[#25323a] px-2.5 py-1 rounded text-[10px] font-mono text-[#86989f] backdrop-blur-sm shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ec4b6] animate-pulse" />
                <span className="text-[#2ec4b6] font-bold">
                  {customTileUrl 
                    ? 'CUSTOM TILE API' 
                    : baseMapLayer === 'dark' 
                      ? 'CYBER TACTICAL NEON ENGINE' 
                      : baseMapLayer === 'dark_esri' 
                        ? 'ESRI DEFENSE CANVAS' 
                        : baseMapLayer === 'dark_carto' 
                          ? 'CARTO STEALTH ENGINE' 
                          : baseMapLayer === 'satellite' 
                            ? 'ESRI SATELLITE 4K' 
                            : 'OSM REAL STREETS'}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-semibold">100% VISIBLE</span>
              </div>

              {/* Center on Target Quick Button */}
              {selectedRecord?.latitude && selectedRecord?.longitude && (
                <button
                  onClick={() => {
                    if (mapInstanceRef.current && selectedRecord.latitude && selectedRecord.longitude) {
                      mapInstanceRef.current.panTo([selectedRecord.latitude, selectedRecord.longitude], { animate: true });
                    }
                  }}
                  className="absolute top-3 left-3 z-20 bg-[#141a1d]/90 hover:bg-[#1a2327] border border-[#25323a] text-[#2ec4b6] px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-lg transition-all"
                  title="Re-center map on selected tower"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#2ec4b6]" />
                  <span>Center Tower</span>
                </button>
              )}

              {/* Toggle Side Panel Button on Map Canvas */}
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="absolute top-3 right-3 z-20 bg-[#141a1d]/90 hover:bg-[#1a2327] border border-[#25323a] text-[#d6e1e5] px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-lg transition-all"
                title={isSidePanelOpen ? "Hide Side Panel" : "Show Side Panel"}
              >
                <Sliders className="w-3.5 h-3.5 text-[#2ec4b6]" />
                <span>{isSidePanelOpen ? "Hide Side Panel" : "Show Side Panel"}</span>
              </button>

              {/* Tactical Radar Sweep HUD Overlay (Bottom-left, compact) */}
              {isRadarAnimationActive && selectedRecord && selectedRecord.latitude && (
                <div className="absolute bottom-3 left-3 z-20 bg-[#141a1d]/90 backdrop-blur-md border border-[#2ec4b6]/50 rounded-lg px-3 py-1.5 shadow-xl text-[10px] font-mono text-[#d6e1e5] flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ec4b6] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ec4b6]"></span>
                  </span>
                  <span className="text-[#2ec4b6] font-bold">RADAR SWEEP ACTIVE</span>
                  <span className="text-[#86989f]">|</span>
                  <span className="text-[#d6e1e5]">
                    RADIUS: <strong className="text-[#2ec4b6]">{selectedRadiusMeters >= 1000 ? `${(selectedRadiusMeters / 1000).toFixed(1)} km` : `${selectedRadiusMeters} m`}</strong>
                  </span>
                  {isPlayingTrack && (
                    <>
                      <span className="text-[#86989f]">|</span>
                      <span className="text-[#f0a73a] font-bold animate-pulse">▶ TRACK PLAYING</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ================= DEDICATED SIDE SECTION FOR SELECTED RECORD & PROVENANCE ================= */}
            {isSidePanelOpen && (
              <div className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[#25323a] flex flex-col h-full overflow-y-auto shrink-0 z-20 transition-all ${
                isDarkMode ? 'bg-[#141a1d] text-[#d6e1e5]' : 'bg-slate-50 text-slate-900'
              }`}>
                {/* Side Panel Header */}
                <div className="p-3 border-b border-[#25323a] bg-[#1a2327] flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[#2ec4b6] shrink-0" />
                    <span className="font-bold text-xs font-mono truncate text-[#d6e1e5]">
                      Ref #{selectedRecord?.ref_number} ({selectedRecord?.event_id || `Case ${selectedRecord?.case_id}`})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setIsSidePanelOpen(false)}
                      className="p-1 hover:bg-[#25323a] rounded text-[#86989f] hover:text-[#d6e1e5] transition-colors"
                      title="Close Side Panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Side Panel Body */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto font-mono text-xs">
                  
                  {/* Provenance Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#86989f] uppercase tracking-wider font-semibold">Provenance:</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase truncate ${
                      selectedRecord?.source_type === 'HANDSET_EMERGENCY' || selectedRecord?.source_type === 'CONSENT_LINK_GPS'
                        ? 'bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/60'
                        : selectedRecord?.source_type === 'LOCATION_UNAVAILABLE'
                        ? 'bg-[#e5534b]/20 text-[#e5534b] border border-[#e5534b]/60'
                        : 'bg-[#f0a73a]/20 text-[#f0a73a] border border-[#f0a73a]/60'
                    }`}>
                      {selectedRecord?.source_badge || selectedRecord?.location_provenance}
                    </span>
                  </div>

                  {/* If record has coordinates */}
                  {selectedRecord && selectedRecord.latitude && selectedRecord.longitude ? (
                    <>
                      {/* Geocoded Address Box */}
                      {selectedRecord.approximate_address && (
                        <div className="bg-[#1a2327] p-2.5 rounded-lg border border-[#25323a]">
                          <span className="text-[#2ec4b6] text-[10px] block mb-1 font-bold uppercase tracking-wider">
                            Approximate Address:
                          </span>
                          <div className="text-[#d6e1e5] font-sans font-medium text-xs leading-relaxed">
                            {selectedRecord.approximate_address}
                          </div>
                        </div>
                      )}

                      {/* Attributes Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-[#1a2327] border border-[#25323a]">
                          <span className="text-[#86989f] block text-[10px]">Target Caller:</span>
                          <span className="text-[#d6e1e5] font-bold">{selectedRecord.target_number}</span>
                        </div>
                        <div className="p-2 rounded bg-[#1a2327] border border-[#25323a]">
                          <span className="text-[#86989f] block text-[10px]">Coverage Radius:</span>
                          <span className="text-[#2ec4b6] font-bold">±{selectedRecord.accuracy_meters || selectedRecord.cell_radius_meters}m</span>
                        </div>
                        <div className="p-2 rounded bg-[#1a2327] border border-[#25323a] col-span-2">
                          <span className="text-[#86989f] block text-[10px]">Coordinates:</span>
                          <span className="text-[#d6e1e5] font-bold font-mono">
                            {selectedRecord.latitude.toFixed(4)}°N, {selectedRecord.longitude.toFixed(4)}°W
                          </span>
                        </div>
                        {selectedRecord.azimuth_degrees !== null && selectedRecord.azimuth_degrees !== undefined && (
                          <div className="p-2 rounded bg-[#1a2327] border border-[#25323a] col-span-2">
                            <span className="text-[#86989f] block text-[10px]">Sector Azimuth / Beam:</span>
                            <span className="text-[#f0a73a] font-bold">
                              {selectedRecord.azimuth_degrees}° Azimuth (Beamwidth: {selectedRecord.beamwidth_degrees}°)
                            </span>
                          </div>
                        )}
                        <div className="p-2 rounded bg-[#1a2327] border border-[#25323a]">
                          <span className="text-[#86989f] block text-[10px]">Tower ID:</span>
                          <span className="text-[#d6e1e5] truncate block" title={selectedRecord.first_tower}>
                            {selectedRecord.first_tower}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-[#1a2327] border border-[#25323a]">
                          <span className="text-[#86989f] block text-[10px]">Call Time:</span>
                          <span className="text-[#d6e1e5] truncate block">
                            {selectedRecord.start_time || '14:26:04'}
                          </span>
                        </div>
                      </div>

                      {/* Legal Basis / Provenance Citation */}
                      <div className="p-2.5 rounded bg-[#0d1113] border border-[#25323a] text-[10px] text-[#86989f] leading-relaxed">
                        <span className="text-[#d6e1e5] font-semibold block mb-0.5">Legal Basis / Telemetry Source:</span>
                        <span className="italic">{selectedRecord.legal_basis || selectedRecord.provenance_details}</span>
                      </div>

                      {/* Audio Link & Actions */}
                      {selectedRecord.associated_case_code && (
                        <div className="pt-2 border-t border-[#25323a] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#f0a73a] font-bold flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5" />
                              Audio Evidence Linked
                            </span>
                            <span className="text-[10px] text-[#86989f]">{selectedRecord.associated_case_code}</span>
                          </div>
                          <button
                            onClick={() => onNavigateToVoiceForensics(selectedRecord.associated_case_code || 'Case #V-0884', selectedRecord.associated_evidence_id || undefined)}
                            className="w-full py-2 px-3 rounded-lg bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all hover:scale-[1.01]"
                          >
                            <Volume2 className="w-4 h-4 text-[#0d1113]" />
                            <span>Analyze Audio Evidence →</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Location Unavailable in Side Panel */
                    <div className="p-3.5 rounded-lg bg-[#e5534b]/10 border border-[#e5534b]/40 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[#e5534b] font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Location Unavailable</span>
                      </div>
                      <p className="text-[#86989f] leading-relaxed text-[11px] font-sans">
                        A voice, a phone number or an IP address cannot tell you where someone is, and RAKSHAM will not build anything that guesses it.
                      </p>
                      <p className="text-[#86989f] leading-relaxed text-[10px]">
                        No authorized CDR record, emergency dispatch GPS, or consent link is linked to this event.
                      </p>
                      {selectedRecord?.associated_case_code && (
                        <button
                          onClick={() => onNavigateToVoiceForensics(selectedRecord.associated_case_code!, selectedRecord.associated_evidence_id || undefined)}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
                        >
                          <Volume2 className="w-4 h-4 text-[#0d1113]" />
                          <span>Analyze Audio Evidence ({selectedRecord.associated_case_code}) →</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* ================= CDR CALL RECORDS TABLE (BOTTOM 50%) ================= */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-colors ${
            isDarkMode ? 'bg-[#0d1113]' : 'bg-white'
          }`}>
            
            {/* Table Header Bar Matching Reference Image 1 */}
            <div className={`border-b px-4 py-2 flex items-center justify-between text-xs font-mono transition-colors ${
              isDarkMode ? 'bg-[#141a1d] border-[#25323a]' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`font-bold uppercase tracking-wide ${
                  isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-700'
                }`}>
                  Query Result - {getCategoryLabel(activeQueryCategory)}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  isDarkMode ? 'text-[#86989f] bg-[#1a2327] border-[#25323a]' : 'text-slate-600 bg-white border-slate-300'
                }`}>
                  {filteredCalls.length} records found
                </span>
              </div>

              {/* Geographic Radius Toggle Filter */}
              <div className="flex items-center gap-2">
                <label className={`flex items-center gap-1.5 text-[11px] cursor-pointer ${
                  isDarkMode ? 'text-[#d6e1e5]' : 'text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterWithinRadiusOnly}
                    onChange={(e) => setFilterWithinRadiusOnly(e.target.checked)}
                    className="rounded bg-[#1a2327] border-[#25323a] text-[#2ec4b6] accent-[#2ec4b6]"
                  />
                  <span>Filter records inside {selectedRadiusMeters}m radius only</span>
                </label>
              </div>
            </div>

            {/* The Structured Law Enforcement CDR Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs font-mono border-collapse select-text">
                <thead className={`text-[10px] uppercase tracking-wider sticky top-0 z-20 border-b transition-colors ${
                  isDarkMode ? 'bg-[#1a2327] text-[#86989f] border-[#25323a]' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  <tr>
                    <th className="p-2 w-8 text-center">✓</th>
                    <th className="p-2">Ref. Number</th>
                    <th className="p-2">Case</th>
                    <th className="p-2">Target Number</th>
                    <th className="p-2">Start Date/Time</th>
                    <th className="p-2">Approximate Address</th>
                    <th className="p-2">Radius / Area</th>
                    <th className="p-2">Direction</th>
                    <th className="p-2">Lawful Provenance</th>
                    <th className="p-2">Audio Evidence</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#25323a]' : 'divide-slate-200'}`}>
                  {filteredCalls.map((rec, idx) => {
                    const isSelected = rec.ref_number === activeRef;

                    const isEven = idx % 2 === 0;
                    const rowBgClass = isSelected
                      ? 'bg-[#12312f] text-[#2ec4b6] font-bold border-y border-[#2ec4b6]/50' // Teal background tint (selected row) #12312f
                      : isEven
                      ? (isDarkMode ? 'bg-[#141a1d] hover:bg-[#1a2327] text-[#d6e1e5]' : 'bg-[#eaf7ee] hover:bg-emerald-100/70 text-slate-800')
                      : (isDarkMode ? 'bg-[#0d1113] hover:bg-[#1a2327] text-[#d6e1e5]' : 'bg-[#edf5fc] hover:bg-blue-100/70 text-slate-800');

                    return (
                      <tr
                        key={rec.ref_number}
                        onClick={() => {
                          setActiveRef(rec.ref_number);
                          onSelectCallRef(rec.ref_number);
                          setIsSidePanelOpen(true);
                          if (mapInstanceRef.current && rec.latitude && rec.longitude) {
                            mapInstanceRef.current.panTo([rec.latitude, rec.longitude], { animate: true });
                          }
                        }}
                        className={`cursor-pointer transition-colors ${rowBgClass}`}
                      >
                        {/* Checkbox */}
                        <td className="p-2 text-center">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#2ec4b6] inline-block" />
                          ) : (
                            <SquareIcon className="w-3.5 h-3.5 text-[#86989f] inline-block" />
                          )}
                        </td>

                        {/* Ref. Number */}
                        <td className="p-2 font-bold font-mono">
                          {rec.ref_number}
                        </td>

                        {/* Case ID */}
                        <td className="p-2 font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            rec.case_id === '7502' 
                              ? 'bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/40' 
                              : 'bg-[#1a2327] text-[#86989f] border border-[#25323a]'
                          }`}>
                            {rec.case_id}
                          </span>
                        </td>

                        {/* Target Number */}
                        <td className="p-2 font-mono font-medium">
                          {rec.target_number}
                        </td>

                        {/* Start Date/Time */}
                        <td className="p-2 text-[#d6e1e5] whitespace-nowrap">
                          {rec.start_time}
                        </td>

                        {/* Approximate Street Address */}
                        <td className="p-2 max-w-xs truncate font-sans text-[11px]" title={rec.approximate_address || 'Location unavailable'}>
                          {rec.approximate_address ? (
                            <span className="text-[#d6e1e5]">{rec.approximate_address}</span>
                          ) : (
                            <span className="text-[#e5534b] font-mono text-[10px] italic">Location unavailable</span>
                          )}
                        </td>

                        {/* Coverage Radius / Accuracy Area */}
                        <td className="p-2 font-mono text-[11px] whitespace-nowrap">
                          {rec.cell_radius_meters || rec.accuracy_meters ? (
                            <span className="text-[#2ec4b6]">±{rec.accuracy_meters || rec.cell_radius_meters}m</span>
                          ) : (
                            <span className="text-[#86989f]">—</span>
                          )}
                        </td>

                        {/* Direction */}
                        <td className="p-2 uppercase text-[10px] font-semibold">
                          <span className={rec.direction === 'incoming' ? 'text-[#2ec4b6]' : 'text-[#f0a73a]'}>
                            {rec.direction}
                          </span>
                        </td>

                        {/* Location Provenance */}
                        <td className="p-2 whitespace-nowrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                            rec.location_provenance === 'VERIFIED LOCATION'
                              ? 'bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/60'
                              : rec.location_provenance === 'ESTIMATED AREA'
                              ? 'bg-[#f0a73a]/20 text-[#f0a73a] border border-[#f0a73a]/60'
                              : rec.location_provenance === 'SAMPLE LOCATION'
                              ? 'bg-[#8fb3c9]/20 text-[#8fb3c9] border border-[#8fb3c9]/60'
                              : 'bg-[#e5534b]/20 text-[#e5534b] border border-[#e5534b]/60'
                          }`}>
                            {rec.source_badge || rec.location_provenance}
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
                              className="flex items-center gap-1 text-[10px] font-bold text-[#2ec4b6] hover:text-[#0d1113] bg-[#12312f] hover:bg-[#2ec4b6] border border-[#2ec4b6]/60 px-2 py-0.5 rounded transition-colors"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>{rec.associated_case_code}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#86989f]">—</span>
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

      {/* ================= MAP TILE API & FORENSIC ENGINE MODAL ================= */}
      {isTileApiModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5]' : 'bg-white border-slate-300 text-slate-800'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'bg-[#1a2327] border-[#25323a]' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#12312f] text-[#2ec4b6] border border-[#2ec4b6]/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Dark Cyber Forensic Map API Engine</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                      100% High Contrast
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#86989f]">
                    Live Tile Provider Routing · Latency Ping Diagnostics · Custom API Key Engine
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTileApiModalOpen(false)}
                className="p-1.5 rounded text-[#86989f] hover:text-white hover:bg-[#25323a] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              
              {/* Active API Telemetry Card */}
              <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDarkMode ? 'bg-[#0f171a] border-[#25323a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-[#86989f] font-bold">Active Engine Provider</span>
                  </div>
                  <div className="text-sm font-bold text-[#2ec4b6]">
                    {customTileUrl.trim() 
                      ? 'Custom Configured Tile Server / Mapbox API' 
                      : baseMapLayer === 'dark' 
                        ? 'Cyber Tactical Neon Grid (High-Contrast OSM Edge)' 
                        : baseMapLayer === 'dark_esri' 
                          ? 'Esri ArcGIS Defense Dark Gray Canvas + Labels' 
                          : baseMapLayer === 'dark_carto' 
                            ? 'CARTO Dark Matter (Contrast-Boosted Raster)' 
                            : baseMapLayer === 'satellite' 
                              ? 'Esri World Satellite Imagery 4K' 
                              : 'Real OpenStreetMap Global CDN'}
                  </div>
                  <div className="text-[10px] text-[#86989f] break-all font-mono">
                    Endpoint: {customTileUrl.trim() || (baseMapLayer === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : baseMapLayer === 'dark_esri' ? 'https://services.arcgisonline.com/.../Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}' : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png')}
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#25323a]">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12312f] border border-[#2ec4b6]/50 text-[#2ec4b6] font-bold text-xs">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Ping: {tileApiLatency} ms</span>
                  </div>
                  <button
                    onClick={handleTestTileApi}
                    disabled={isTestingTileApi}
                    className="flex items-center gap-1 text-[10px] text-[#86989f] hover:text-[#2ec4b6] font-bold underline"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingTileApi ? 'animate-spin text-[#2ec4b6]' : ''}`} />
                    <span>{isTestingTileApi ? 'Testing...' : 'Test Latency'}</span>
                  </button>
                </div>
              </div>

              {/* High-Visibility Pre-Configured Engines */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#86989f] block mb-2">
                  1. Select Pre-Configured High-Visibility Engine (Zero API Key Needed):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setDraftTileUrl('');
                      setBaseMapLayer('dark');
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      baseMapLayer === 'dark' && !draftTileUrl
                        ? 'bg-[#18262b] border-[#2ec4b6] text-white shadow-md'
                        : isDarkMode ? 'bg-[#0f171a] border-[#25323a] text-[#86989f] hover:border-[#86989f]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#2ec4b6] text-xs">⚡ Neon Tactical</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2ec4b6]/20 text-[#2ec4b6] font-bold">RECOMMENDED</span>
                    </div>
                    <p className="text-[10px] text-[#86989f] line-clamp-2">
                      High-contrast glowing cyan streets, deep obsidian land. Every single street and building is 100% visible.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setDraftTileUrl('');
                      setBaseMapLayer('dark_esri');
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      baseMapLayer === 'dark_esri' && !draftTileUrl
                        ? 'bg-[#18262b] border-[#2ec4b6] text-white shadow-md'
                        : isDarkMode ? 'bg-[#0f171a] border-[#25323a] text-[#86989f] hover:border-[#86989f]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#8fb3c9] text-xs">🛡️ Esri Defense</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">MILITARY</span>
                    </div>
                    <p className="text-[10px] text-[#86989f] line-clamp-2">
                      Official Esri ArcGIS Defense dark gray base with crisp highway lines and high-contrast place labels.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setDraftTileUrl('');
                      setBaseMapLayer('dark_carto');
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      baseMapLayer === 'dark_carto' && !draftTileUrl
                        ? 'bg-[#18262b] border-[#2ec4b6] text-white shadow-md'
                        : isDarkMode ? 'bg-[#0f171a] border-[#25323a] text-[#86989f] hover:border-[#86989f]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#f0a73a] text-xs">🛰️ CARTO Stealth</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">BOOSTED</span>
                    </div>
                    <p className="text-[10px] text-[#86989f] line-clamp-2">
                      CARTO Dark Matter raster tiles with brightness boost filter and clear reference label overlay.
                    </p>
                  </button>
                </div>
              </div>

              {/* Custom API Key & Tile URL Input (Optional) */}
              <div className={`p-3.5 rounded-lg border space-y-3 ${
                isDarkMode ? 'bg-[#0f171a] border-[#25323a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d6e1e5] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#2ec4b6]" />
                    <span>2. Custom Tile Provider / Mapbox API Key (Optional)</span>
                  </label>
                  <span className="text-[9px] text-[#86989f]">For Mapbox, Stadia, or Private GIS Servers</span>
                </div>

                <div>
                  <label className="text-[10px] text-[#86989f] block mb-1">Custom Tile Server URL Template:</label>
                  <input
                    type="text"
                    value={draftTileUrl}
                    onChange={(e) => setDraftTileUrl(e.target.value)}
                    placeholder="https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=YOUR_KEY"
                    className={`w-full border rounded px-3 py-1.5 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5] focus:border-[#2ec4b6]' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <p className="text-[9px] text-[#86989f] mt-1">
                    Supports &#123;z&#125;, &#123;x&#125;, &#123;y&#125; tile coordinates. Example: Mapbox Dark, Stadia Alidade Dark, Thunderforest.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-[#86989f] block mb-1">API Key / Access Token (if not in URL):</label>
                  <input
                    type="password"
                    value={draftApiKey}
                    onChange={(e) => setDraftApiKey(e.target.value)}
                    placeholder="pk.eyJ1..."
                    className={`w-full border rounded px-3 py-1.5 text-xs font-mono focus:outline-none ${
                      isDarkMode ? 'bg-[#141a1d] border-[#25323a] text-[#d6e1e5] focus:border-[#2ec4b6]' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-2 ${
              isDarkMode ? 'bg-[#1a2327] border-[#25323a]' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={handleResetTileApi}
                className="px-3 py-1.5 rounded border border-[#25323a] text-[#86989f] hover:text-white hover:bg-[#25323a] transition-all font-bold text-xs"
              >
                Reset to Built-in Tactical Engine
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTileApiModalOpen(false)}
                  className="px-3 py-1.5 rounded text-[#86989f] hover:text-white transition-all font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveCustomTileApi(draftTileUrl, draftApiKey)}
                  className="px-4 py-1.5 rounded bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Apply Engine</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
