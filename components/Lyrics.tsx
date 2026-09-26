'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Track, LyricsData } from '@/lib/types';
import { fetchLyrics } from '@/lib/lyrics';
import { Disc3, ExternalLink, Mic2, AlertCircle } from 'lucide-react';

interface LyricsProps {
  track: Track;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
}

export const Lyrics: React.FC<LyricsProps> = ({
  track,
  currentTime = 0,
  duration = 30,
}) => {
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const fetchCounterRef = useRef<number>(0);

  // Fetch lyrics on track change - keyed strictly to track.id
  useEffect(() => {
    // 1. Clear old lyrics state immediately so stale lyrics never persist
    setLyricsData(null);
    setLoading(true);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    // 2. Track fetch sequence ID and create AbortController for in-flight cancellation
    const currentFetchId = ++fetchCounterRef.current;
    const abortController = new AbortController();

    fetchLyrics(track.artist, track.name, abortController.signal)
      .then((data) => {
        // Discard result if a newer fetch was started or if aborted
        if (currentFetchId !== fetchCounterRef.current || abortController.signal.aborted) {
          return;
        }
        setLyricsData(data);
        setLoading(false);
      })
      .catch((err: any) => {
        // Ignore deliberate aborts
        if (err?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        if (currentFetchId !== fetchCounterRef.current) {
          return;
        }
        setLyricsData({
          lyrics: '',
          lines: [],
          source: 'none',
          error: 'Could not load lyrics',
        });
        setLoading(false);
      });

    // Cleanup: cancel in-flight request when track changes or unmounts
    return () => {
      abortController.abort();
    };
  }, [track.id, track.artist, track.name]);

  const lines = lyricsData?.lines || [];

  // Actual preview clip duration from audio element (default 30s preview clip, never full track duration)
  const actualClipDuration =
    duration && !isNaN(duration) && isFinite(duration) && duration > 0 ? duration : 30;

  // Drive active line highlight strictly off the audio element's ontimeupdate (currentTime / duration ratio)
  // When playback pauses or ends, currentTime stays constant, freezing lyric progression at the current line
  const activeLineIndex = React.useMemo(() => {
    if (lines.length === 0 || actualClipDuration <= 0) return 0;
    const ratio = Math.min(0.999, Math.max(0, currentTime / actualClipDuration));
    return Math.floor(ratio * lines.length);
  }, [currentTime, actualClipDuration, lines.length]);

  // Smoothly scroll active line to center within container
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeEl = activeLineRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const relativeTop = activeRect.top - containerRect.top + container.scrollTop;
      const targetScrollTop = relativeTop - container.clientHeight / 2 + activeRect.height / 2;

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
    }
  }, [activeLineIndex]);

  const isLoading = loading || lyricsData === null;

  return (
    <div className="relative w-full rounded-2xl bg-black border border-white/20 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.98)] flex flex-col h-[320px] sm:h-[370px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/15 bg-black/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Mic2 className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            LYRICS TRANSCRIPT
          </span>
          {!isLoading && lyricsData?.source && lyricsData.source !== 'none' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-white/20">
              {lyricsData.source}
            </span>
          )}
        </div>

        <a
          href={
            track.external_url ||
            `https://open.spotify.com/search/${encodeURIComponent(
              `${track.artist} ${track.name}`
            )}`
          }
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <span>Spotify Link</span>
          <ExternalLink className="w-3 h-3 text-white" />
        </a>
      </div>

      {/* Main Lyrics Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth scrollbar-thin text-center select-text"
      >
        {/* Loading State Skeleton / Shimmer */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-30" />
              <Disc3 className="w-6 h-6 text-white animate-spin" />
            </div>
            <div className="w-48 h-3 rounded bg-zinc-900 border border-white/10 animate-pulse" />
            <div className="w-64 h-3 rounded bg-zinc-900 border border-white/10 animate-pulse" />
            <div className="w-36 h-3 rounded bg-zinc-900 border border-white/10 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 pt-2 animate-pulse">
              DECODING AUDIO STREAM TRANSCRIPT...
            </span>
          </div>
        )}

        {/* Empty / Not Found Fallback */}
        {!isLoading && lines.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-base uppercase text-white tracking-wide">
                LYRICS NOT CATALOGUED
              </h4>
              <p className="text-xs font-mono text-zinc-400 max-w-xs mx-auto leading-relaxed">
                No verified transcript found for this track. Immerse in the instrumental groove.
              </p>
            </div>
            <a
              href={
                track.external_url ||
                `https://www.google.com/search?q=${encodeURIComponent(
                  `${track.artist} ${track.name} lyrics`
                )}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black border border-white text-white text-xs font-mono uppercase font-bold hover:bg-white hover:text-black transition-all shadow-md"
            >
              <span>Search Online</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Synced Dynamic Karaoke Lyrics Lines */}
        {!isLoading &&
          lines.length > 0 &&
          lines.map((line, idx) => {
            const isActive = idx === activeLineIndex;

            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                className={`transition-all duration-300 px-4 rounded-xl cursor-default ${
                  isActive
                    ? 'mono-text-shimmer font-display font-black text-xl sm:text-2xl tracking-wide scale-105 bg-white/10 border border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.4)] py-2'
                    : 'text-zinc-600 font-sans font-medium text-sm sm:text-base opacity-25 select-none py-1.5'
                }`}
              >
                {line}
              </p>
            );
          })}
      </div>
    </div>
  );
};
