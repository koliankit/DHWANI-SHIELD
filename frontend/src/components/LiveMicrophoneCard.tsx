import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Activity, AlertTriangle, ShieldCheck, Volume2, Radio, Info } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface Props {
  onLiveAnalysisComplete: (result: AnalysisResponse) => void;
  isAnalyzing: boolean;
}

interface LiveUpdateData {
  audio_duration_seconds: number;
  audio_level: number;
  voice_authenticity: {
    result: string;
    score: number;
    confidence: number;
    explanation: string;
  };
  conversation_analysis: {
    transcript: string;
    indicators: any[];
  };
  risk_assessment: {
    level: string;
    color: string;
    explanation: string;
    show_warning: boolean;
    warning_message: string;
    warning_reasons: string[];
  };
  latency_ms: number;
}

export const LiveMicrophoneCard: React.FC<Props> = ({
  onLiveAnalysisComplete,
  isAnalyzing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [micStatus, setMicStatus] = useState<'idle' | 'requesting' | 'recording' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [liveData, setLiveData] = useState<LiveUpdateData | null>(null);
  const [latency, setLatency] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const durationIntervalRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioLevelRef = useRef<number>(0);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      phase += 0.08;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = '#152238';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isRecording) {
        const level = Math.max(0.08, audioLevelRef.current);
        const barCount = 48;
        const barWidth = width / barCount - 2;

        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + 2);
          const wave = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
          const barHeight = Math.max(4, wave * level * (height * 0.85));
          const y = (height - barHeight) / 2;

          // Color gradient based on risk or audio level
          const isHighRisk = liveData?.risk_assessment?.level === 'HIGH RISK';
          if (isHighRisk) {
            ctx.fillStyle = '#f43f5e';
          } else if (level > 0.4) {
            ctx.fillStyle = '#38bdf8';
          } else {
            ctx.fillStyle = '#0ea5e9';
          }

          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        // Idle flatline with subtle pulse
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
          const y = height / 2 + Math.sin(x * 0.05 + phase * 0.5) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording, liveData]);

  const startLiveSession = async () => {
    setErrorMessage(null);
    setMicStatus('requesting');
    setDuration(0);
    setLiveData(null);

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Initialize WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//127.0.0.1:8000/ws/live-analysis`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsRecording(true);
        setMicStatus('recording');
        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'live_update') {
            setLiveData(msg);
            audioLevelRef.current = msg.audio_level || 0;
            setLatency(msg.latency_ms || 15);
          } else if (msg.type === 'final_analysis') {
            // Processing complete, notify parent view
            if (msg.data) {
              onLiveAnalysisComplete(msg.data);
            }
          }
        } catch (err) {
          console.warn('Error parsing live WS update:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('WebSocket connection error with backend analysis engine.');
      };

      ws.onclose = () => {
        setIsRecording(false);
        setMicStatus('idle');
      };

      // 3. Setup Web Audio API PCM streaming
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Using ScriptProcessorNode for wide browser compatibility
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate simple volume level for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        audioLevelRef.current = Math.min(1.0, Math.sqrt(sum / inputData.length) * 4);

        // Convert Float32 to Int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to binary/base64
        const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(pcm16.buffer)));
        const base64Data = btoa(binary);

        ws.send(
          JSON.stringify({
            action: 'audio_chunk',
            data: base64Data,
            format: 'pcm16',
            sample_rate: 16000,
          })
        );
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // 4. Optional browser SpeechRecognition integration for live transcript streaming
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            let transcriptText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              transcriptText += event.results[i][0].transcript;
            }
            if (transcriptText && ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  action: 'transcript_chunk',
                  text: transcriptText,
                })
              );
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.log('Web Speech API continuous recognition fallback');
        }
      }
    } catch (err: any) {
      console.error('Microphone capture error:', err);
      setMicStatus('error');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please grant microphone access in browser settings.'
          : `Failed to access microphone: ${err.message}`
      );
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    }

    setIsRecording(false);
    setMicStatus('idle');
  };

  // Helper to send a quick simulated scam phrase over the stream for testing without talking
  const sendSimulatedPhrase = (phrase: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'transcript_chunk',
          text: phrase,
        })
      );
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-lg space-y-5">
      {/* Header and live badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Live Microphone Anti-Scam Monitoring
            </h2>
            {isRecording && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold animate-pulse">
                REC • STREAMING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time acoustic signal sampling with streaming financial fraud intent extraction.
          </p>
        </div>

        {/* Live Metrics */}
        {isRecording && (
          <div className="flex items-center gap-3 bg-bg-surface px-3 py-1.5 rounded-xl border border-border-subtle">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">SESSION DURATION</span>
              <span className="text-xs font-mono font-bold text-white">{formatSeconds(duration)}</span>
            </div>
            <div className="h-6 w-px bg-border-subtle" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">LATENCY</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{latency} ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Oscilloscope Visualizer */}
      <div className="relative bg-bg-deep rounded-xl border border-border-subtle p-3 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={80}
          className="w-full h-20 block rounded"
        />

        {/* Overlay status tag */}
        <div className="absolute top-2 left-3 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
            }`}
          />
          <span className="text-[10px] font-mono text-slate-400">
            {isRecording ? 'Capturing 16kHz Mono Stream' : 'Microphone Ready'}
          </span>
        </div>

        {isRecording && (
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400 bg-bg-card/80 px-2 py-0.5 rounded border border-border-subtle">
            Web Audio API + WebSocket Active
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Streaming Result Preview while Live */}
      {isRecording && liveData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-bg-surface/60 rounded-xl border border-border-subtle">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Layer 1: Voice</span>
            <span className="text-xs font-bold text-white">
              {liveData.voice_authenticity.result} ({(liveData.voice_authenticity.score * 100).toFixed(0)}%)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Layer 2: Fraud Flags</span>
            <span className="text-xs font-bold text-amber-300">
              {liveData.conversation_analysis.indicators.length} Coercion Markers
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Composite Risk</span>
            <span
              className={`text-xs font-black font-mono ${
                liveData.risk_assessment.level === 'HIGH RISK'
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {liveData.risk_assessment.level}
            </span>
          </div>
        </div>
      )}

      {/* Live Transcript Snippet */}
      {isRecording && liveData?.conversation_analysis?.transcript && (
        <div className="p-3 bg-bg-surface rounded-xl border border-border-subtle text-xs">
          <span className="text-[10px] font-mono text-slate-400 block mb-1">STREAMING TRANSCRIPT:</span>
          <p className="text-slate-200 italic">"{liveData.conversation_analysis.transcript}"</p>
        </div>
      )}

      {/* Controls & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRecording ? (
            <button
              onClick={startLiveSession}
              disabled={isAnalyzing}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blueHover text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>Start Live Analysis</span>
            </button>
          ) : (
            <button
              onClick={stopLiveSession}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-900/30 active:scale-95 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white text-white" />
              <span>Stop & Finalize Analysis</span>
            </button>
          )}

          {isRecording && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Microphone listening
            </span>
          )}
        </div>

        {/* Quick test phrases for quick testing while mic is active */}
        {isRecording && (
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-slate-400 text-[10px]">Test Coercive Phrases:</span>
            <button
              onClick={() => sendSimulatedPhrase("This is SBI fraud branch. Tell me your 6 digit OTP immediately or account blocked.")}
              className="px-2 py-1 rounded bg-bg-surface hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-border-subtle transition-colors text-[10px]"
            >
              Simulate OTP Scam
            </button>
            <button
              onClick={() => sendSimulatedPhrase("Emergency hospital clinic, transfer 50000 rupees to this UPI id now.")}
              className="px-2 py-1 rounded bg-bg-surface hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-border-subtle transition-colors text-[10px]"
            >
              Simulate UPI Urgent
            </button>
          </div>
        )}
      </div>

      {/* Platform Limitation Notice required by prompt */}
      <div className="p-3 bg-bg-deep/70 rounded-xl border border-border-subtle/50 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-accent-electric flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Privacy & Architecture Notice:</strong> Audio is processed locally in real-time. Microphone captures authorized input directly from your browser; cellular telecommunication interception is not performed. Session buffers are wiped immediately upon termination.
        </span>
      </div>
    </div>
  );
};
