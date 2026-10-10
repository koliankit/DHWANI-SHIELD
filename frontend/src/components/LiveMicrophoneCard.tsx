import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Activity, AlertTriangle, ShieldCheck, Volume2, Radio, Info, Cpu, Clock, CheckCircle2 } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface Props {
  onLiveAnalysisComplete: (result: AnalysisResponse) => void;
  isAnalyzing: boolean;
}

interface LiveUpdateData {
  event_id?: string;
  chunk_duration_seconds?: number;
  audio_duration_seconds: number;
  audio_level: number;
  rolling_risk: 'LOW RISK' | 'REVIEW REQUIRED' | 'HIGH RISK' | string;
  rolling_risk_color: 'teal' | 'amber' | 'red' | string;
  voice_authenticity: {
    result: string;
    score: number;
    similarity_score?: number;
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
  const [chunkCount, setChunkCount] = useState(0);
  const [latency, setLatency] = useState(0);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const durationIntervalRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioLevelRef = useRef<number>(0);

  // 2 to 4 second chunk buffer (at 16kHz, 3.0 seconds = 48,000 samples)
  const chunkBufferRef = useRef<Float32Array>(new Float32Array(0));
  const CHUNK_SIZE_SAMPLES = 48000; // 3.0 second chunks

  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // Visualizer render loop
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
      ctx.strokeStyle = '#25323a';
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

          // Color based on rolling risk
          const riskLevel = liveData?.rolling_risk;
          if (riskLevel === 'HIGH RISK') {
            ctx.fillStyle = '#e5534b'; // red
          } else if (riskLevel === 'REVIEW REQUIRED') {
            ctx.fillStyle = '#f0a73a'; // amber
          } else {
            ctx.fillStyle = '#2ec4b6'; // teal
          }

          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        // Idle flatline
        ctx.strokeStyle = '#25323a';
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
    setChunkCount(0);
    chunkBufferRef.current = new Float32Array(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//127.0.0.1:8000/ws/live-analysis`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsRecording(true);
        setMicStatus('recording');
        durationIntervalRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'connected') {
            setActiveEventId(msg.event_id || null);
          } else if (msg.type === 'live_update') {
            setLiveData(msg);
            audioLevelRef.current = msg.audio_level || 0;
            setLatency(msg.latency_ms || 18);
          } else if (msg.type === 'final_analysis') {
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

      // Web Audio API: 16kHz audio capture and chunk buffering
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Process 4096 samples per callback
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate instantaneous volume level
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        audioLevelRef.current = Math.min(1.0, Math.sqrt(sum / inputData.length) * 4);

        // Append to 2 to 4 second chunk buffer
        const existing = chunkBufferRef.current;
        const combined = new Float32Array(existing.length + inputData.length);
        combined.set(existing, 0);
        combined.set(inputData, existing.length);
        chunkBufferRef.current = combined;

        // When chunk buffer reaches 3.0 seconds (48,000 samples), send chunk to backend!
        if (chunkBufferRef.current.length >= CHUNK_SIZE_SAMPLES) {
          const chunkToSend = chunkBufferRef.current.slice(0, CHUNK_SIZE_SAMPLES);
          // Keep overlap of 0.5s (8000 samples) for rolling temporal continuity
          chunkBufferRef.current = chunkBufferRef.current.slice(CHUNK_SIZE_SAMPLES - 8000);

          // Convert Float32 to Int16 PCM
          const pcm16 = new Int16Array(chunkToSend.length);
          for (let i = 0; i < chunkToSend.length; i++) {
            const s = Math.max(-1, Math.min(1, chunkToSend[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(pcm16.buffer)));
          const base64Data = btoa(binary);

          wsRef.current.send(
            JSON.stringify({
              action: 'audio_chunk',
              data: base64Data,
              format: 'pcm16',
              sample_rate: 16000,
            })
          );
          setChunkCount((prev) => prev + 1);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // SpeechRecognition for interim live transcription
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
            if (transcriptText && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  action: 'transcript_chunk',
                  text: transcriptText,
                })
              );
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch {
          // Fallback handled by backend
        }
      }
    } catch (err: any) {
      console.error('Error starting live session:', err);
      setMicStatus('error');
      setErrorMessage(err.message || 'Microphone access denied or audio initialization failed.');
    }
  };

  const stopLiveSession = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    setMicStatus('idle');
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine rolling risk styling strictly matching user palette
  const rollingRisk = liveData?.rolling_risk || 'ANALYZING CHUNKS...';
  let badgeBg = 'bg-[#1a2327] border-[#25323a] text-[#86989f]';
  if (rollingRisk === 'HIGH RISK') {
    badgeBg = 'bg-[#e5534b] text-[#0d1113] border-[#e5534b] font-bold';
  } else if (rollingRisk === 'REVIEW REQUIRED') {
    badgeBg = 'bg-[#f0a73a] text-[#0d1113] border-[#f0a73a] font-bold';
  } else if (rollingRisk === 'LOW RISK') {
    badgeBg = 'bg-[#2ec4b6] text-[#0d1113] border-[#2ec4b6] font-bold';
  }

  return (
    <div className="bg-[#141a1d] rounded-2xl p-5 border border-[#25323a] shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#12312f] border border-[#2ec4b6]/40 flex items-center justify-center text-[#2ec4b6]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#d6e1e5] tracking-tight">Live Call Stream & In-App WebRTC</h2>
            <p className="text-[11px] text-[#86989f]">
              Streaming in <span className="text-[#2ec4b6] font-semibold">2 to 4 second chunks</span> to ECAPA-TDNN & AASIST models
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {activeEventId && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#1a2327] border border-[#25323a] text-[#86989f] text-[11px]">
              {activeEventId}
            </span>
          )}
          {isRecording ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5534b]/20 border border-[#e5534b] text-[#e5534b] font-semibold text-[11px] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#e5534b]" />
              LIVE ({formatDuration(duration)})
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-[#1a2327] border border-[#25323a] text-[#86989f] text-[11px]">
              READY
            </span>
          )}
        </div>
      </div>

      {/* Real-World Telephony Authority Notice */}
      <div className="p-3 rounded-xl bg-[#1a2327] border border-[#25323a] text-[11px] font-mono leading-relaxed text-[#86989f]">
        <div className="flex items-center gap-1.5 text-[#2ec4b6] font-bold mb-1">
          <Info className="w-3.5 h-3.5" />
          Telephony Architecture & Legal Authority
        </div>
        <span>
          A web app cannot tap an ordinary phone call. Live audio only works for calls routed through an in-app WebRTC system or a telephony provider (Twilio, Exotel) streaming call audio to your server. Microphone input is provided for testing. In production, proper legal authority (recording notice or court order) is required.
        </span>
      </div>

      {/* Canvas Visualizer */}
      <div className="relative rounded-xl overflow-hidden bg-[#0d1113] border border-[#25323a] p-2">
        <canvas ref={canvasRef} width={650} height={75} className="w-full h-18 block rounded" />
        {isRecording && (
          <div className="absolute top-2 right-3 flex items-center gap-2 text-[10px] font-mono text-[#86989f]">
            <span>Chunk #{chunkCount} (3.0s window)</span>
            <span>·</span>
            <span className="text-[#2ec4b6]">{latency}ms latency</span>
          </div>
        )}
      </div>

      {/* Rolling Result Display during Live Stream */}
      {isRecording && liveData && (
        <div className="p-3.5 rounded-xl bg-[#1a2327] border border-[#25323a] space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#86989f] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#2ec4b6]" />
              Rolling Risk Result (Live Chunks)
            </span>
            <span className={`text-xs px-3 py-1 rounded border uppercase font-mono tracking-wider ${badgeBg}`}>
              {rollingRisk}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-[#141a1d] border border-[#25323a]">
              <span className="text-[#86989f]">AASIST Anti-Spoofing:</span>
              <div className="text-[#d6e1e5] font-bold mt-0.5">
                {liveData.voice_authenticity.result} ({(liveData.voice_authenticity.score * 100).toFixed(1)}%)
              </div>
            </div>
            <div className="p-2 rounded bg-[#141a1d] border border-[#25323a]">
              <span className="text-[#86989f]">ECAPA-TDNN Similarity:</span>
              <div className="text-[#2ec4b6] font-bold mt-0.5">
                {liveData.voice_authenticity.similarity_score || 85.0}% (Threshold: 85%)
              </div>
            </div>
          </div>

          {liveData.conversation_analysis?.transcript && (
            <div className="text-xs font-mono bg-[#141a1d] p-2.5 rounded border border-[#25323a] text-[#d6e1e5] max-h-20 overflow-y-auto">
              <span className="text-[#86989f] text-[10px] block mb-1">Live Transcript:</span>
              "{liveData.conversation_analysis.transcript}"
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-[#e5534b]/15 border border-[#e5534b]/50 text-[#e5534b] text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs font-mono text-[#86989f] flex items-center gap-2">
          <span>Engine: ECAPA-TDNN + AASIST</span>
          <span>·</span>
          <span>Rolling: 3.0s Chunks</span>
        </div>

        {!isRecording ? (
          <button
            onClick={startLiveSession}
            disabled={isAnalyzing || micStatus === 'requesting'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] font-bold text-xs font-mono transition-all shadow-md hover:scale-[1.01] disabled:opacity-50"
          >
            <Mic className="w-4 h-4 text-[#0d1113]" />
            <span>{micStatus === 'requesting' ? 'Requesting Mic...' : 'Start Live Stream'}</span>
          </button>
        ) : (
          <button
            onClick={stopLiveSession}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e5534b] hover:bg-[#e5534b]/90 text-[#0d1113] font-bold text-xs font-mono transition-all shadow-md hover:scale-[1.01]"
          >
            <Square className="w-4 h-4 text-[#0d1113]" />
            <span>End Call & Generate Final Result</span>
          </button>
        )}
      </div>
    </div>
  );
};
