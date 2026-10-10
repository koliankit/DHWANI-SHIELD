// telecomAudioEngine.ts
// Native Web Audio API + SpeechSynthesis engine providing 100% audible audio playback
// with telephony bandpass filtering, DTMF chirps, line carrier tone, volume control,
// and real-time AnalyserNode FFT frequency data for 4K visualizers.

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  rate: number;
  isMuted: boolean;
}

export const CASE_TRANSCRIPTS: Record<string, string> = {
  'case-v0884': 'Attention, this is Marcus Vance, Chief Executive Officer. I am authorizing an urgent offshore wire transfer of two point four million dollars to escrow account 9041 immediately. Confirm authorization code 4-7-2.',
  'case-v0885': 'Mom, Dad, please help me! I was in a terrible accident on Interstate 95 and my phone is dying. You need to send the emergency hospital deposit of five thousand dollars to this account right now, please hurry!',
  'case-v0886': 'Package arrived at Sector 4 drop point. Burn the secondary SIM cards and rendezvous at the south corridor in fifteen minutes. Do not call this number back.',
  'case-v9110': '911 emergency dispatch, Arlington County. Caller reports medical emergency at coordinates 38.7962, -77.1215. Paramedics and rescue unit 4 dispatched immediately.',
  'case-v0887': 'Forensic laboratory benchmark sample. StyleTTS-2 vocoder synthesis with 3.8 kilohertz phase truncation. Acoustic spoofing detector AASIST test run 8840.',
  'case-v0888': 'Urgent notification from Federal Automated Utilities Bureau. Your service has been flagged for termination due to unpaid balance. Press 1 to connect with an agent.',
  'case-vaudit': 'Judicial supervisory Title III lawful intercept evidence package. Cryptographic SHA-256 seal verified under Federal Court Order 2026-CV-8821.'
};

class TelecomAudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private carrierGain: GainNode | null = null;
  private carrierOsc1: OscillatorNode | null = null;
  private carrierOsc2: OscillatorNode | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  private isPlaying = false;
  private volume = 0.85;
  private rate = 1.0;
  private isMuted = false;
  private currentCaseId = 'case-v0884';

  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initAudioGraph() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

      // Telephony Bandpass Filter (300Hz - 3400Hz ITU-T standard telecom channel)
      this.bandpassFilter = this.audioCtx.createBiquadFilter();
      this.bandpassFilter.type = 'bandpass';
      this.bandpassFilter.frequency.value = 1700;
      this.bandpassFilter.Q.value = 0.8;

      // FFT Analyser Node for 4K Waveform & Spectrogram
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.78;

      // Route: Filter -> MasterGain -> Analyser -> Destination
      this.bandpassFilter.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initAudioGraph();
    return this.analyser;
  }

  public getByteFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array as any);
    } else {
      array.fill(0);
    }
  }

  public getByteTimeDomainData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(array as any);
    } else {
      array.fill(128);
    }
  }

  // Play Audible DTMF Connection Chirp
  private playDtmfChirp() {
    if (!this.audioCtx || !this.bandpassFilter) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const toneGain = this.audioCtx.createGain();

      osc1.frequency.value = 697; // DTMF Row 1
      osc2.frequency.value = 1209; // DTMF Col 1

      toneGain.gain.setValueAtTime(0, now);
      toneGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      toneGain.connect(this.bandpassFilter);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);
    } catch (e) {
      // Ignore audio scheduling err
    }
  }

  // Start Background Telephony Line Hum & Harmonics
  private startCarrierHum() {
    if (!this.audioCtx || !this.bandpassFilter) return;
    try {
      this.stopCarrierHum();

      const now = this.audioCtx.currentTime;
      this.carrierGain = this.audioCtx.createGain();
      this.carrierGain.gain.setValueAtTime(0, now);
      this.carrierGain.gain.linearRampToValueAtTime(0.07, now + 0.2);

      // Telecom dial/line tone pair (350Hz + 440Hz / 130Hz vocal formant)
      this.carrierOsc1 = this.audioCtx.createOscillator();
      this.carrierOsc1.type = 'triangle';
      this.carrierOsc1.frequency.setValueAtTime(350, now);

      this.carrierOsc2 = this.audioCtx.createOscillator();
      this.carrierOsc2.type = 'sine';
      this.carrierOsc2.frequency.setValueAtTime(440, now);

      this.carrierOsc1.connect(this.carrierGain);
      this.carrierOsc2.connect(this.carrierGain);
      this.carrierGain.connect(this.bandpassFilter);

      this.carrierOsc1.start(now);
      this.carrierOsc2.start(now);
    } catch (e) {
      console.warn('Carrier hum start error', e);
    }
  }

  private stopCarrierHum() {
    if (this.carrierGain && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.carrierGain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
        setTimeout(() => {
          this.carrierOsc1?.stop();
          this.carrierOsc2?.stop();
          this.carrierOsc1?.disconnect();
          this.carrierOsc2?.disconnect();
          this.carrierGain?.disconnect();
          this.carrierOsc1 = null;
          this.carrierOsc2 = null;
          this.carrierGain = null;
        }, 120);
      } catch (e) {
        // Disconnect silently
      }
    }
  }

  // Play Audible Confirmation Ping (For "Test Speaker Sound" or "Target Locked")
  public playAcousticPing(frequency = 880, duration = 0.25) {
    this.initAudioGraph();
    if (!this.audioCtx || !this.masterGain) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Ping error', e);
    }
  }

  // Radar Lock Sonar Ping for Map Section
  public playRadarLockPing() {
    this.playAcousticPing(1046.5, 0.35); // High C note sonar ping
  }

  // Main Play Function
  public play(caseId: string, customText?: string, onEnded?: () => void) {
    this.initAudioGraph();
    this.currentCaseId = caseId;
    this.onEndedCallback = onEnded || null;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.playDtmfChirp();
    this.startCarrierHum();

    // Trigger Speech Synthesis for spoken dialogue
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const text = customText || CASE_TRANSCRIPTS[caseId] || CASE_TRANSCRIPTS['case-v0884'];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.isMuted ? 0 : this.volume;
      utterance.rate = this.rate;
      utterance.pitch = caseId === 'case-v0885' ? 1.25 : caseId === 'case-v0888' ? 0.9 : 1.0;

      // Select suitable voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.stopCarrierHum();
        this.isPlaying = false;
        if (this.onEndedCallback) this.onEndedCallback();
      };

      utterance.onerror = () => {
        this.stopCarrierHum();
        this.isPlaying = false;
        if (this.onEndedCallback) this.onEndedCallback();
      };

      this.speechUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Pause / Stop Audio
  public pause() {
    this.isPlaying = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopCarrierHum();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
    if (this.speechUtterance) {
      this.speechUtterance.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
    if (this.isPlaying && this.speechUtterance) {
      // Re-trigger speech with updated rate
      this.play(this.currentCaseId);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
    if (this.speechUtterance) {
      this.speechUtterance.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getRate(): number {
    return this.rate;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const telecomAudioEngine = new TelecomAudioEngine();
