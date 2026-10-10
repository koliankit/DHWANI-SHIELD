import { AnalysisResponse, HistoryItem, SystemStatusResponse, CallRecord } from '../types';
import { DEFAULT_GEOSPATIAL_CALLS } from '../data/mockGeospatialCalls';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async getModels(): Promise<SystemStatusResponse> {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch system models');
    return res.json();
  },

  async analyzeAudio(file: File, eventId?: string, legalAuthority?: string): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (eventId) formData.append('event_id', eventId);
    if (legalAuthority) formData.append('legal_authority', legalAuthority);

    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
      throw new Error(err.detail || 'Analysis request failed');
    }

    return res.json();
  },

  async runQuickTest(exampleId: string): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/quick-test/${exampleId}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Quick test failed' }));
      throw new Error(err.detail || 'Quick test failed');
    }

    return res.json();
  },

  async ingestTelephonyCall(params: {
    eventId?: string;
    callerNumber?: string;
    recipientNumber?: string;
    telephonyProvider?: string;
    legalAuthority?: string;
    cdrRef?: number;
    sampleKey?: string;
  }): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/calls/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: params.eventId,
        caller_number: params.callerNumber,
        recipient_number: params.recipientNumber,
        telephony_provider: params.telephonyProvider || 'Twilio',
        legal_authority: params.legalAuthority || 'Telephony recording notice & consent banner active',
        cdr_ref: params.cdrRef || 1348,
        sample_key: params.sampleKey || 'ai_clone'
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Telephony ingest failed' }));
      throw new Error(err.detail || 'Telephony ingest failed');
    }

    return res.json();
  },

  async generateConsentLink(eventId: string): Promise<{ event_id: string; consent_token: string; consent_url: string; instructions: string }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/consent-link`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate consent link');
    return res.json();
  },

  async submitConsentGPS(eventId: string, lat: number, lng: number, accuracyMeters: number) {
    const res = await fetch(`${API_BASE}/events/${eventId}/consent-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        accuracy_meters: accuracyMeters
      }),
    });
    if (!res.ok) throw new Error('Failed to submit consent GPS coordinates');
    return res.json();
  },

  getSampleAudioUrl(exampleId: string): string {
    return `${API_BASE}/samples/${exampleId}/audio`;
  },

  async getHistory(limit = 50, risk?: string, search?: string): Promise<HistoryItem[]> {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (risk && risk !== 'ALL') params.set('risk', risk);
    if (search) params.set('search', search);

    const res = await fetch(`${API_BASE}/history?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async getHistoryDetail(analysisId: string): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE}/history/${analysisId}`);
    if (!res.ok) throw new Error('Failed to fetch analysis details');
    return res.json();
  },

  async deleteHistory(analysisId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/history/${analysisId}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  getPdfReportUrl(analysisId: string): string {
    return `${API_BASE}/report/${analysisId}?format=pdf`;
  },

  async downloadPdfReport(analysisId: string, filename = 'VoiceGuard_Report.pdf'): Promise<void> {
    const res = await fetch(this.getPdfReportUrl(analysisId));
    if (!res.ok) throw new Error('Failed to generate PDF report');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Geospatial Investigation API
  async getGeospatialCalls(params?: {
    caseId?: string;
    targetNumber?: string;
    search?: string;
    lat?: number;
    lng?: number;
    radiusMeters?: number;
  }): Promise<CallRecord[]> {
    try {
      const q = new URLSearchParams();
      if (params?.caseId) q.set('case_id', params.caseId);
      if (params?.targetNumber) q.set('target_number', params.targetNumber);
      if (params?.search) q.set('search', params.search);
      if (params?.lat !== undefined) q.set('lat', params.lat.toString());
      if (params?.lng !== undefined) q.set('lng', params.lng.toString());
      if (params?.radiusMeters !== undefined) q.set('radius_meters', params.radiusMeters.toString());

      const res = await fetch(`${API_BASE}/geospatial/calls?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch geospatial calls');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_GEOSPATIAL_CALLS;
    } catch {
      return DEFAULT_GEOSPATIAL_CALLS;
    }
  },

  async getGeospatialCallByRef(refNumber: number): Promise<CallRecord> {
    try {
      const res = await fetch(`${API_BASE}/geospatial/calls/${refNumber}`);
      if (!res.ok) throw new Error(`Failed to fetch call record #${refNumber}`);
      return await res.json();
    } catch {
      const found = DEFAULT_GEOSPATIAL_CALLS.find(c => c.ref_number === refNumber);
      return found || DEFAULT_GEOSPATIAL_CALLS[0];
    }
  },

  async getLinkedCall(evidenceId: string): Promise<CallRecord | null> {
    try {
      const res = await fetch(`${API_BASE}/geospatial/linked/${evidenceId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      const found = DEFAULT_GEOSPATIAL_CALLS.find(c => c.associated_evidence_id === evidenceId || c.event_id === evidenceId);
      return found || null;
    }
  }
};
