import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl: string;
  title: string;
  subtitleTags: string;
}

const BAR_COUNT = 58;

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  title,
  subtitleTags,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isLooping, setIsLooping] = useState(true);
  const [tick, setTick] = useState(0);

  // Deterministic artistic waveform silhouette matching the mockup
  const baseHeights = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const env1 = Math.exp(-Math.pow((i - 21) / 8, 2)) * 0.85;
      const env2 = Math.exp(-Math.pow((i - 44) / 7, 2)) * 0.95;
      const env3 = Math.exp(-Math.pow((i - 10) / 6, 2)) * 0.45;
      const ripple = Math.abs(Math.sin(i * 1.45) * Math.cos(i * 0.7)) * 0.35;
      return Math.max(0.12, Math.min(1, env1 + env2 + env3 + ripple * 0.45));
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, [audioUrl]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setTick((t) => t + 1);
    }, 90);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback error:', err);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = waveformContainerRef.current;
    const audio = audioRef.current;
    if (!container || !audio || !duration) return;
    const rect = container.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = clickX / rect.width;
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  };

  const skipSeconds = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration || 30, audio.currentTime + delta));
    setCurrentTime(audio.currentTime);
  };

  const restartTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="w-full rounded-2xl bg-[#070b28]/92 border border-[#2d4c9c]/50 px-5 py-4 shadow-[0_14px_36px_rgba(1,5,24,0.65)]">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop={isLooping}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Track Title & Vibe Tags */}
      <div className="text-center mb-3">
        <h3 className="font-display text-sm sm:text-[15px] font-semibold tracking-[0.14em] text-[#8ec5ff] uppercase">
          {title}
        </h3>
        <p className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] text-[#79ace8] uppercase mt-0.5 truncate">
          {subtitleTags}
        </p>
      </div>

      {/* Waveform + Scrubber Bar */}
      <div
        ref={waveformContainerRef}
        onClick={handleSeek}
        className="relative cursor-pointer select-none py-2 group"
        title="Click to seek"
      >
        {/* Vertical Waveform Bars */}
        <div className="flex items-end justify-between h-9 gap-[2px] px-0.5">
          {baseHeights.map((baseH, idx) => {
            const barPct = (idx / BAR_COUNT) * 100;
            const isPast = barPct <= progressPct;
            const activeBounce = isPlaying
              ? 1 + Math.sin(tick * 0.65 + idx * 0.5) * 0.18
              : 1;
            const heightPx = Math.max(4, Math.min(34, Math.round(baseH * 32 * activeBounce)));

            return (
              <div
                key={idx}
                className="flex-1 rounded-t-full transition-all duration-100"
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: isPast ? '#d8ecff' : 'rgba(142, 197, 255, 0.35)',
                  boxShadow: isPast && isPlaying ? '0 0 6px rgba(168, 212, 255, 0.5)' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Horizontal Scrubber Baseline & Thumb */}
        <div className="relative w-full h-[3px] bg-white/25 rounded-full -mt-[1px]">
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-full"
            style={{ width: `${progressPct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#73b6ff] shadow-[0_0_10px_#ffffff]"
            style={{ left: `${progressPct}%` }}
          />
        </div>

        {/* Subtle Elapsed / Duration Timestamps */}
        <div className="flex justify-between text-[9px] text-[#79ace8]/80 font-mono mt-1.5 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport Controls matching Mockup */}
      <div className="flex items-center justify-center gap-4 mt-1">
        <button
          type="button"
          onClick={() => skipSeconds(-5)}
          className="text-white/75 hover:text-white transition-colors p-1"
          title="Rewind 5 seconds"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={restartTrack}
          className="text-white/75 hover:text-white transition-colors p-1"
          title="Restart track"
        >
          <SkipBack className="w-3.5 h-3.5 fill-current" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white text-[#060f33] flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.65)] hover:scale-105 active:scale-95 transition-transform"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skipSeconds(5)}
          className="text-white/75 hover:text-white transition-colors p-1"
          title="Forward 5 seconds"
        >
          <SkipForward className="w-3.5 h-3.5 fill-current" />
        </button>

        <button
          type="button"
          onClick={() => setIsLooping((prev) => !prev)}
          className={`transition-colors p-1 ${
            isLooping ? 'text-[#8ec5ff]' : 'text-white/50 hover:text-white/80'
          }`}
          title={isLooping ? 'Loop enabled' : 'Loop disabled'}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
