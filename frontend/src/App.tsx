import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VoiceAnalysisView } from './components/views/VoiceAnalysisView';
import { GeospatialInvestigationView } from './components/views/GeospatialInvestigationView';
import { DashboardView } from './components/views/DashboardView';
import { HistoryView } from './components/views/HistoryView';
import { ModelsView } from './components/views/ModelsView';
import { SettingsView } from './components/views/SettingsView';
import { ShareModal } from './components/ShareModal';
import { ActiveNavTab, AnalysisResponse, SystemStatusResponse } from './types';
import { api } from './services/api';
import { MapPin } from 'lucide-react';

export const App: React.FC = () => {
  // Voice Analysis (Hero Dashboard: Reference Image 2) is active by default
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('voice_analysis');
  const [selectedCallRef, setSelectedCallRef] = useState<number | null>(1348);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0); // 0=idle, 1=audio, 2=voice, 3=transcript, 4=risk, 5=done
  const [hasFailed, setHasFailed] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | undefined>(undefined);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [historyCount, setHistoryCount] = useState(0);

  // Complainant GPS Consent Link URL Parameter Listener
  const [incomingConsent, setIncomingConsent] = useState<{ token: string; eventId: string } | null>(null);
  const [consentSubmissionStatus, setConsentSubmissionStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [consentResultAddress, setConsentResultAddress] = useState<string | null>(null);

  // Theme Management (Day Mode vs Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('raksham_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('raksham_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('raksham_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Initial load
  useEffect(() => {
    loadSystemStatus();
    loadDefaultInitialAnalysis();

    // Check for incoming complainant consent token in URL
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('consent_token');
      const eventId = params.get('event_id');
      if (token && eventId) {
        setIncomingConsent({ token, eventId });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await api.getModels();
      setSystemStatus(status);
      setHistoryCount(status.active_analyses_count);
      setIsConnected(true);
    } catch (err) {
      console.warn('Backend currently unreachable', err);
      setIsConnected(false);
    }
  };

  const loadDefaultInitialAnalysis = async () => {
    try {
      // Load AI clone call as illustrative reference default so dashboard looks complete
      const initial = await api.runQuickTest('ai_clone');
      setAnalysisData(initial);
      setActiveExampleId('ai_clone');
      setAnalysisStage(5);
    } catch (err) {
      console.warn('Initial quick test load failed:', err);
    }
  };

  const handleTabChange = (tab: ActiveNavTab) => {
    if (tab === 'new_analysis') {
      setSelectedFile(null);
      setAnalysisData(null);
      setActiveExampleId(null);
      setAnalysisStage(0);
      setHasFailed(false);
      setActiveTab('new_analysis');
      return;
    }
    setActiveTab(tab);
  };

  // Shared context navigation between Voice Forensics & Geospatial Map
  const handleNavigateToGeospatial = (callRef?: number) => {
    if (callRef) {
      setSelectedCallRef(callRef);
    }
    setActiveTab('geospatial');
  };

  const handleNavigateToVoiceForensics = (caseCode: string, evidenceId?: string) => {
    setActiveTab('voice_analysis');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setActiveExampleId(null);
    setAnalysisStage(0);
    setHasFailed(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAnalysisStage(0);
    setHasFailed(false);
  };

  // Run Real Analysis on Uploaded File
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setHasFailed(false);
    setFailureMessage(undefined);
    setAnalysisStage(1);

    try {
      const stageTimer1 = setTimeout(() => setAnalysisStage(2), 300);
      const stageTimer2 = setTimeout(() => setAnalysisStage(3), 600);
      const stageTimer3 = setTimeout(() => setAnalysisStage(4), 900);

      const result = await api.analyzeAudio(selectedFile);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setAnalysisData(result);
      setAnalysisStage(5);
      setHistoryCount((prev) => prev + 1);
      setActiveTab('dashboard');
    } catch (err: any) {
      setHasFailed(true);
      setFailureMessage(err.message || 'Analysis processing failed');
      setAnalysisStage(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Real Analysis on Quick Test Example
  const handleSelectExample = async (exampleId: string) => {
    setActiveExampleId(exampleId);
    setSelectedFile(null);
    setIsAnalyzing(true);
    setHasFailed(false);
    setFailureMessage(undefined);
    setAnalysisStage(1);

    try {
      const stageTimer1 = setTimeout(() => setAnalysisStage(2), 250);
      const stageTimer2 = setTimeout(() => setAnalysisStage(3), 500);
      const stageTimer3 = setTimeout(() => setAnalysisStage(4), 750);

      const result = await api.runQuickTest(exampleId);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setAnalysisData(result);
      setAnalysisStage(5);
      setHistoryCount((prev) => prev + 1);
      setActiveTab('dashboard');
    } catch (err: any) {
      setHasFailed(true);
      setFailureMessage(err.message || 'Quick test execution failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLiveAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisData(result);
    setSelectedFile(null);
    setActiveExampleId(null);
    setAnalysisStage(5);
    setHistoryCount((prev) => prev + 1);
    setActiveTab('dashboard');
  };

  // Replay historical analysis in dashboard
  const handleLoadFromHistory = async (analysisId: string) => {
    try {
      const record = await api.getHistoryDetail(analysisId);
      setAnalysisData(record);
      setSelectedFile(null);
      setActiveExampleId(null);
      setAnalysisStage(5);
      setActiveTab('voice_analysis');
    } catch (err) {
      alert('Failed to load analysis record.');
    }
  };

  return (
    <div className={`flex min-h-screen font-sans selection:bg-[#2ec4b6] selection:text-[#0d1113] transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0d1113] text-[#d6e1e5]' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        systemStatus={systemStatus}
        isConnected={isConnected}
        historyCount={historyCount}
        isDarkMode={isDarkMode}
      />

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeTab={activeTab}
          onRefresh={loadSystemStatus}
          isAnalyzing={isAnalyzing}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 flex flex-col">
          {/* 1. Voice Forensics Hero Dashboard (Reference Image 2) */}
          {activeTab === 'voice_analysis' && (
            <VoiceAnalysisView
              analysisData={analysisData}
              onOpenScamScanner={() => setActiveTab('dashboard')}
              onNavigateToGeospatial={handleNavigateToGeospatial}
              isDarkMode={isDarkMode}
            />
          )}

          {/* 2. Geospatial Investigation Module (Reference Image 1) */}
          {activeTab === 'geospatial' && (
            <GeospatialInvestigationView
              selectedCallRef={selectedCallRef}
              onSelectCallRef={(ref) => setSelectedCallRef(ref)}
              onNavigateToVoiceForensics={handleNavigateToVoiceForensics}
              isDarkMode={isDarkMode}
            />
          )}

          {/* 3. Scam & Fraud Scanner & New Intake Studio */}
          {(activeTab === 'dashboard' || activeTab === 'new_analysis') && (
            <DashboardView
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onRemoveFile={handleRemoveFile}
              onAnalyze={handleAnalyze}
              onSelectExample={handleSelectExample}
              onLiveAnalysisComplete={handleLiveAnalysisComplete}
              isAnalyzing={isAnalyzing}
              analysisStage={analysisStage}
              hasFailed={hasFailed}
              failureMessage={failureMessage}
              analysisData={analysisData}
              activeExampleId={activeExampleId}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          )}

          {/* 4. Analysis History */}
          {activeTab === 'history' && (
            <HistoryView onLoadAnalysis={handleLoadFromHistory} />
          )}

          {/* 5. AI Models & Architecture */}
          {activeTab === 'models' && (
            <ModelsView systemStatus={systemStatus} />
          )}

          {/* 6. System Settings */}
          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Share Report Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={analysisData}
      />

      {/* Incoming Complainant GPS Consent Authorization Dialog */}
      {incomingConsent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141a1d] border border-[#2ec4b6]/60 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center font-mono space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#12312f] border border-[#2ec4b6] text-[#2ec4b6] flex items-center justify-center mx-auto shadow-lg shadow-[#2ec4b6]/20">
              <MapPin className="w-6 h-6 text-[#2ec4b6]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#d6e1e5]">Complainant Location Verification</h3>
              <p className="text-xs text-[#86989f] mt-1 font-sans">
                You received this request to verify your location for Event <strong>{incomingConsent.eventId}</strong>.
              </p>
            </div>
            
            {consentSubmissionStatus === 'idle' && (
              <div className="space-y-3">
                <p className="text-[11px] text-[#86989f] leading-relaxed">
                  By clicking "Authorize One-Time GPS", your browser will ask for device location permission. Your coordinates will be reverse-geocoded and securely attached to the case evidence.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConsentSubmissionStatus('locating');
                      if (!navigator.geolocation) {
                        setConsentSubmissionStatus('error');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          try {
                            const res = await api.submitConsentGPS(incomingConsent.eventId, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 10);
                            setConsentResultAddress(res.location_record?.approximate_address || 'Verified Coordinates');
                            setConsentSubmissionStatus('success');
                          } catch (err) {
                            setConsentSubmissionStatus('error');
                          }
                        },
                        () => {
                          setConsentSubmissionStatus('error');
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                      );
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs shadow transition-all"
                  >
                    Authorize One-Time GPS
                  </button>
                  <button
                    onClick={() => setIncomingConsent(null)}
                    className="py-2.5 px-4 rounded-xl bg-[#1a2327] hover:bg-[#25323a] text-[#86989f] font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {consentSubmissionStatus === 'locating' && (
              <div className="py-4 text-[#2ec4b6] text-xs flex flex-col items-center gap-2">
                <div className="animate-spin w-6 h-6 border-2 border-[#2ec4b6] border-t-transparent rounded-full"></div>
                <span>Requesting Device Geolocation Permission...</span>
              </div>
            )}

            {consentSubmissionStatus === 'success' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#12312f] border border-[#2ec4b6]/60 text-[#2ec4b6] text-xs leading-relaxed">
                  ✓ Coordinates Verified & Attached: <br/>
                  <span className="text-[#d6e1e5] font-sans font-medium text-[11px] block mt-1">{consentResultAddress}</span>
                </div>
                <button
                  onClick={() => {
                    setIncomingConsent(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-[#2ec4b6] text-[#0d1113] font-bold text-xs shadow"
                >
                  Continue to Application
                </button>
              </div>
            )}

            {consentSubmissionStatus === 'error' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#e5534b]/20 border border-[#e5534b]/60 text-[#e5534b] text-xs">
                  Location authorization was denied or unavailable.
                </div>
                <button
                  onClick={() => setIncomingConsent(null)}
                  className="w-full py-2 px-4 rounded-xl bg-[#1a2327] text-[#d6e1e5] font-bold text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
