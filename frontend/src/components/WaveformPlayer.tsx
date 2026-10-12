import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface Props {
  audioUrl?: string;
  audioBlob?: Blob | null;
  peaks?: number[];
  duration?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export const WaveformPlayer: React.FC<Props> = ({
  audioUrl,
  audioBlob,
  peaks = [],
  duration = 0,
  onTimeUpdate,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (audioUrl) {
      setBlobUrl(audioUrl);
    } else {
      setBlobUrl(null);
    }
  }, [audioBlob, audioUrl]);

  useEffect(() => {
    if (duration > 0) setTotalDuration(duration);
  }, [duration]);

  // Audio event listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const t = audioRef.current.currentTime;
      setCurrentTime(t);
      onTimeUpdate?.(t);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeedChange = () => {
    if (!audioRef.current) return;
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  // Canvas waveform rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Default peaks if none provided
    const displayPeaks = peaks.length > 0 ? peaks : Array.from({ length: 90 }, (_, i) => 
      0.15 + 0.35 * Math.sin(i * 0.18) * Math.sin(i * 0.08) + 0.1 * Math.random()
    );

    const barCount = displayPeaks.length;
    const barWidth = Math.max(2, (width / barCount) - 1.5);
    const progress = totalDuration > 0 ? currentTime / totalDuration : 0;
    const activeBarIndex = Math.floor(progress * barCount);

    for (let i = 0; i < barCount; i++) {
      const peak = Math.max(0.08, Math.min(1.0, displayPeaks[i]));
      const barHeight = peak * (height * 0.85);
      const x = i * (barWidth + 1.5);
      const y = (height - barHeight) / 2;

      // Color based on active playback progress
      if (i <= activeBarIndex) {
        ctx.fillStyle = '#2ec4b6'; // Waveform line #2ec4b6
      } else {
        ctx.fillStyle = '#25323a'; // Borders and dividers #25323a
      }

      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(x, y, barWidth, barHeight, 2);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, [peaks, currentTime, totalDuration]);

  // Click on waveform to seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = pct * totalDuration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
    setCurrentTime(seekTime);
    onTimeUpdate?.(seekTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0d1113] rounded-xl p-3.5 border border-[#25323a] space-y-3">
      {blobUrl && (
        <audio
          ref={audioRef}
          src={blobUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Waveform Canvas */}
      <div className="relative group cursor-pointer">
        <canvas
          ref={canvasRef}
          width={560}
          height={64}
          onClick={handleWaveformClick}
          className="w-full h-16 rounded-lg bg-[#141a1d] hover:bg-[#1a2327] transition-colors"
        />
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-[#2ec4b6] pointer-events-none transition-all"
          style={{ left: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
        >
          <div className="w-2 h-2 -ml-[3px] -top-1 rounded-full bg-[#2ec4b6] shadow"></div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-lg bg-[#2ec4b6] hover:bg-[#2ec4b6]/90 text-[#0d1113] flex items-center justify-center transition-transform active:scale-95 shadow font-bold"
            title={isPlaying ? "Pause Audio" : "Play Audio"}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-[#0d1113]" /> : <Play className="w-4 h-4 ml-0.5 text-[#0d1113]" />}
          </button>

          <button
            onClick={restartAudio}
            className="p-1.5 rounded-lg text-[#86989f] hover:text-[#d6e1e5] hover:bg-[#1a2327] transition-colors"
            title="Restart playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="font-mono text-xs ml-1">
            <span className="text-[#d6e1e5] font-medium">{formatTime(currentTime)}</span>
            <span className="text-[#86989f] mx-1">/</span>
            <span className="text-[#86989f]">{formatTime(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeedChange}
            className="px-2 py-0.5 rounded bg-[#1a2327] hover:bg-[#25323a] text-[11px] font-mono font-medium text-[#d6e1e5] border border-[#25323a]"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-[#86989f] hover:text-[#d6e1e5] hover:bg-[#1a2327] transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#e5534b]" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
