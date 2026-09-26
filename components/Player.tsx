'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Track } from '@/lib/types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ExternalLink,
  Radio,
  Disc,
} from 'lucide-react';

interface PlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  track,
  isPlaying,
  onPlayPause,
  onNextTrack,
  onPrevTrack,
  onTimeUpdate,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => 30);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  const hasPreview = Boolean(track.preview_url);

  // Sync play/pause with parent state
  useEffect(() => {
    if (!audioRef.current || !hasPreview) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play prevented
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, hasPreview, track.preview_url]);

  // Keep volume synced on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, track.id, hasPreview]);

  // Handle track switch: reset time and play
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setDuration(30);
      if (onTimeUpdate) {
        onTimeUpdate(0, 30);
      }
      if (isPlaying && hasPreview) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [track.id, isPlaying, hasPreview]);

  // Read actual preview clip duration directly from <audio> element's own .duration property
  const getAudioDuration = () => {
    if (
      audioRef.current &&
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration) &&
      isFinite(audioRef.current.duration) &&
      audioRef.current.duration > 0
    ) {
      return audioRef.current.duration;
    }
    return duration > 0 ? duration : 30;
  };

  // Audio element ontimeupdate: drive active line highlight directly off audio.currentTime / audio.duration ratio
  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const clipDuration = getAudioDuration();

    setCurrentTime(current);
    if (clipDuration !== duration) {
      setDuration(clipDuration);
    }
    if (onTimeUpdate) {
      onTimeUpdate(current, clipDuration);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const clipDuration = getAudioDuration();
    setDuration(clipDuration);
    if (onTimeUpdate) {
      onTimeUpdate(audioRef.current.currentTime, clipDuration);
    }
  };

  // If preview clip ends or pauses, freeze lyric progression at current line (don't keep advancing or reset to 0)
  const handleAudioEnded = () => {
    if (!audioRef.current) return;
    const clipDuration = getAudioDuration();
    setCurrentTime(clipDuration);
    if (onTimeUpdate) {
      onTimeUpdate(clipDuration, clipDuration);
    }
    if (isPlaying) {
      onPlayPause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    const clipDuration = getAudioDuration();
    if (onTimeUpdate) {
      onTimeUpdate(newTime, clipDuration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume > 0 ? volume : 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRemaining = (cur: number, total: number) => {
    if (isNaN(total) || isNaN(cur)) return '-0:00';
    const rem = Math.max(0, total - cur);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    return `-${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-black/95 text-white rounded-2xl border border-white/20 p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.98),0_0_20px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      {/* Plain HTML5 Audio Element for 30s preview */}
      {hasPreview && (
        <audio
          ref={audioRef}
          key={track.id}
          src={track.preview_url || ''}
          preload="auto"
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleLoadedMetadata}
          onCanPlay={handleLoadedMetadata}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Track Metadata (Left 4 cols) */}
        <div className="md:col-span-4 flex items-center gap-3.5 min-w-0">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black border border-white/20 flex-shrink-0 shadow-lg">
            {track.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.albumArt}
                alt={track.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Disc className="w-6 h-6" />
              </div>
            )}
            {/* Glossy reflection line */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-display font-black text-base sm:text-lg text-white truncate uppercase tracking-tight">
              {track.name}
            </h4>
            <p className="text-xs font-mono text-zinc-400 truncate mt-0.5">
              {track.artist}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/15 uppercase truncate max-w-[180px]">
                {track.album}
              </span>
            </div>
          </div>
        </div>

        {/* Player Controls & Seekbar (Center 5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center gap-2">
          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-5">
            <button
              onClick={onPrevTrack}
              disabled={!onPrevTrack}
              className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {hasPreview ? (
              <button
                onClick={onPlayPause}
                className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-all"
                title={isPlaying ? 'Pause' : 'Play 30s Preview'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            ) : (
              /* Fallback Link-Out Button when preview_url is null */
              <a
                href={track.external_url || `https://open.spotify.com/track/${track.id}`}
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-black hover:text-white border border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] hover:scale-105 active:scale-95 transition-all"
                title="Play track on Spotify"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play on Spotify</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}

            <button
              onClick={onNextTrack}
              disabled={!onNextTrack}
              className="text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Seekbar and Timestamps (when preview available) */}
          {hasPreview ? (
            <div className="w-full flex items-center gap-2.5 text-xs font-mono text-zinc-400">
              <span className="w-9 text-right font-medium">{formatTime(currentTime)}</span>
              <div className="relative flex-1 flex items-center group">
                <input
                  type="range"
                  min="0"
                  max={duration || 30}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full"
                />
              </div>
              <span className="w-10 text-left font-medium">
                {formatRemaining(currentTime, duration)}
              </span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-pulse" />
              <span>Full track ready via Spotify link-out</span>
            </div>
          )}
        </div>

        {/* Volume & Status Badge (Right 3 cols) */}
        <div className="md:col-span-3 flex items-center justify-end gap-3.5">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-white/20 text-white text-xs font-mono">
            <Radio className="w-3 h-3 text-white animate-pulse" />
            <span>{hasPreview ? '30s Preview' : 'Spotify Audio'}</span>
          </div>

          {/* Volume Control */}
          {hasPreview && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
