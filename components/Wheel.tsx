'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '@/lib/types';
import { soundFX } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { RotateCw, Disc3, Maximize2, Minimize2, Dices, Sparkles } from 'lucide-react';
import { ChromeStar } from './ChromeStar';

interface WheelProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  selectedTrack?: Track | null;
  onResample?: () => void;
}

export const Wheel: React.FC<WheelProps> = ({
  tracks,
  onSelectTrack,
  isCollapsed = false,
  onToggleCollapse,
  selectedTrack,
  onResample,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState<number | null>(null);

  // Wheel visible items: balanced across all artists in pool so every artist can be landed on
  const segments = useMemo(() => {
    if (tracks.length === 0) return [];
    if (tracks.length <= 21) return tracks;

    // Group by primary artist
    const byArtist: Record<string, Track[]> = {};
    for (const t of tracks) {
      const primaryArtist = t.artist.split(/[,&/]/)[0].trim();
      if (!byArtist[primaryArtist]) {
        byArtist[primaryArtist] = [];
      }
      byArtist[primaryArtist].push(t);
    }

    const artistKeys = Object.keys(byArtist);
    if (artistKeys.length > 1) {
      // Interleave across artists so all 7 artists are evenly distributed on the roulette
      const interleaved: Track[] = [];
      const maxPerArtist = Math.max(...artistKeys.map((k) => byArtist[k].length));
      for (let round = 0; round < maxPerArtist; round++) {
        for (const k of artistKeys) {
          if (byArtist[k][round] && interleaved.length < 21) {
            interleaved.push(byArtist[k][round]);
          }
        }
      }
      return interleaved;
    }

    return tracks.slice(0, 20);
  }, [tracks]);

  const numSegments = segments.length;
  const sliceAngle = 360 / Math.max(1, numSegments);

  const wheelRef = useRef<HTMLDivElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find index of selectedTrack if already selected
  useEffect(() => {
    if (selectedTrack && !isSpinning) {
      const idx = segments.findIndex((t) => t.id === selectedTrack.id);
      if (idx !== -1) {
        setCurrentWinnerIndex(idx);
      }
    }
  }, [selectedTrack, segments, isSpinning]);

  const handleSpin = () => {
    if (isSpinning || numSegments === 0) return;

    soundFX.playLever();
    setIsSpinning(true);
    setCurrentWinnerIndex(null);

    // Pick random winning segment
    const targetIndex = Math.floor(Math.random() * numSegments);

    // Calculate rotation: Pointer is at 0 degrees (3 o'clock position on the right)
    const segmentCenter = targetIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3)); // 5 to 7 full rotations

    // Normalize current rotation so we always spin forward smoothly
    const currentBase = Math.floor(rotation / 360) * 360;
    const finalAngle = currentBase + extraSpins + (360 - segmentCenter);

    setRotation(finalAngle);

    // Play metallic ratchet clicks with decelerating timing
    const totalDuration = 4000;
    const startTime = Date.now();

    const playTicksLoop = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < totalDuration) {
        const progress = elapsed / totalDuration;
        soundFX.playTick(1 + (1 - progress) * 0.5);
        const delay = 35 + Math.pow(progress, 2.4) * 280;
        audioIntervalRef.current = setTimeout(playTicksLoop, delay);
      }
    };
    playTicksLoop();

    // Wheel stops
    setTimeout(() => {
      setIsSpinning(false);
      setCurrentWinnerIndex(targetIndex);
      soundFX.playWin();

      // Trigger 1-Bit Monochrome Spark Burst (white/silver/black pixels)
      try {
        confetti({
          particleCount: 60,
          spread: 85,
          origin: { y: 0.58, x: 0.5 },
          colors: ['#ffffff', '#f4f4f5', '#e4e4e7', '#a1a1aa', '#27272a', '#000000'],
          shapes: ['square', 'circle'],
          scalar: 0.8,
          gravity: 1.15,
          decay: 0.93,
          ticks: 160,
        });
      } catch {
        // Fallback
      }

      // Notify parent after brief pause so user sees the win
      setTimeout(() => {
        onSelectTrack(segments[targetIndex]);
      }, 700);
    }, totalDuration);
  };

  // Cleanup tick timer
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) {
        clearTimeout(audioIntervalRef.current);
      }
    };
  }, []);

  // Render Collapsed Mini-Wheel (for Now Playing view)
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.95)]">
        <div className="flex items-center gap-4">
          {/* Mini High-Gloss Vinyl Wheel */}
          <div
            className={`relative w-12 h-12 rounded-full border border-white/40 overflow-hidden bg-black shadow-lg transition-transform duration-700 cursor-pointer ${
              isSpinning ? 'animate-spin' : ''
            }`}
            onClick={handleSpin}
            title="Click to spin again"
          >
            {/* Concentric microgrooves */}
            <div className="absolute inset-0 vinyl-grooves-pattern pointer-events-none" />

            {/* Specular flare */}
            <div className="absolute inset-0 vinyl-butterfly-flare pointer-events-none opacity-60" />

            {/* Center label with mini ChromeStar */}
            <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-zinc-900 border border-white/50 flex items-center justify-center">
              <ChromeStar size={14} glow={false} />
            </div>

            {/* Mini Pointer */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-1 bg-white rounded-l shadow-[0_0_6px_#ffffff]" />
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
              <span>ROULETTE ACTIVE // {numSegments} TRACKS</span>
            </div>
            <div className="text-xs font-display font-black uppercase text-white truncate max-w-[200px] sm:max-w-[340px] tracking-tight">
              {selectedTrack ? selectedTrack.name : 'READY FOR SPIN'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Spin Again Button (High contrast white border) */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-white hover:bg-white hover:text-black text-white disabled:opacity-50 transition-all font-mono text-xs uppercase font-bold tracking-wider active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.7)]"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`}
            />
            <span>{isSpinning ? 'SPINNING...' : 'SPIN AGAIN'}</span>
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-full border border-white/20 hover:border-white hover:bg-white/10 text-white transition-colors"
              title="Expand full wheel"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Full Monochrome Vinyl Roulette Wheel
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col items-center justify-center space-y-8 animate-in fade-in">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black border border-white/20 text-[11px] font-mono text-zinc-300 uppercase tracking-widest shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
          <span>VINYL ROULETTE // HIGH SPECULAR EDITION</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]">
          PULL THE LEVER. SPIN THE RECORD.
        </h2>
        <p className="text-xs font-mono text-zinc-400 tracking-wider uppercase">
          Physical angular momentum on high-contrast diffractive vinyl.
        </p>
      </div>

      {/* Main Wheel Container */}
      <div className="relative w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] flex items-center justify-center select-none">
        {/* Outer Pure Black & Brilliant White Hairline Rim (matching Image 2) */}
        <div className="absolute inset-[-18px] rounded-full border-2 border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.98),0_0_30px_rgba(255,255,255,0.1)] pointer-events-none" />
        <div className="absolute inset-[-8px] rounded-full border border-white/40 pointer-events-none" />

        {/* Razor-Sharp White Pointer Needle at 3 o'clock (Right Side) */}
        <div className="absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 z-30 flex items-center">
          {/* White Glow Aura under pointer */}
          <div className="absolute -inset-2 rounded-full bg-white/20 blur-md pointer-events-none" />

          {/* Mechanical Needle Assembly */}
          <div className="relative flex items-center">
            {/* Pure White Sharp Triangular Arrow pointing LEFT into the wheel */}
            <div
              className={`w-0 h-0 border-y-[12px] sm:border-y-[16px] border-y-transparent border-r-[24px] sm:border-r-[32px] border-r-white filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-transform duration-75 ${
                isSpinning ? 'translate-x-1 rotate-3' : ''
              }`}
            />
            {/* Minimalist Black/White Mounting Bracket */}
            <div className="w-5 sm:w-7 h-9 sm:h-11 bg-black rounded-r-lg border border-white shadow-[0_5px_15px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
            </div>
          </div>
        </div>

        {/* The Rotating Wheel (Matching Image 2: Glossy Vinyl Record with Butterfly Refraction) */}
        <div
          ref={wheelRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? 'transform 4000ms cubic-bezier(0.12, 0.8, 0.2, 1)'
              : 'none',
          }}
          className="relative w-full h-full rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.98)] overflow-hidden border-8 border-black bg-black"
        >
          {/* Concentric Microgroove Pattern */}
          <div className="absolute inset-0 vinyl-grooves-pattern pointer-events-none z-10 opacity-70" />

          {/* SVG Pie Slices with High-Contrast Monochrome Tones */}
          <svg className="w-full h-full relative z-0" viewBox="0 0 100 100">
            <defs>
              {/* Deep Void Segment */}
              <linearGradient id="monoSeg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#08080a" />
                <stop offset="50%" stopColor="#000000" />
                <stop offset="100%" stopColor="#121216" />
              </linearGradient>

              {/* Charcoal Vinyl Segment */}
              <linearGradient id="monoSeg2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#141418" />
                <stop offset="50%" stopColor="#222228" />
                <stop offset="100%" stopColor="#0d0d10" />
              </linearGradient>

              {/* Winning Segment: Blinding Pure White with Black Accent */}
              <linearGradient id="monoSegWin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f4f4f5" />
                <stop offset="100%" stopColor="#e4e4e7" />
              </linearGradient>
            </defs>

            {segments.map((track, i) => {
              const startAngle = (i * sliceAngle * Math.PI) / 180;
              const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;

              const x1 = 50 + 50 * Math.cos(startAngle);
              const y1 = 50 + 50 * Math.sin(startAngle);
              const x2 = 50 + 50 * Math.cos(endAngle);
              const y2 = 50 + 50 * Math.sin(endAngle);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
              const midAngle = i * sliceAngle + sliceAngle / 2;
              const midRad = (midAngle * Math.PI) / 180;

              const textX = 50 + 33 * Math.cos(midRad);
              const textY = 50 + 33 * Math.sin(midRad);

              const isWinning = i === currentWinnerIndex;
              const fill = isWinning
                ? 'url(#monoSegWin)'
                : i % 2 === 0
                ? 'url(#monoSeg1)'
                : 'url(#monoSeg2)';

              return (
                <g key={track.id}>
                  {/* Slice Wedge with Thin Bright White Hairline */}
                  <path
                    d={pathData}
                    fill={fill}
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="0.4"
                    className="transition-colors duration-300"
                  />

                  {/* Track Initials / Number on slice */}
                  <text
                    x={textX}
                    y={textY}
                    fill={isWinning ? '#000000' : '#ffffff'}
                    fontSize={numSegments > 14 ? '2.5' : '3.2'}
                    fontWeight="900"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    className="select-none pointer-events-none uppercase tracking-tighter"
                  >
                    {track.name.slice(0, 11)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* High-Gloss Vinyl Butterfly Specular Diffraction Light (matching Image 2) */}
          <div
            className="absolute inset-0 vinyl-butterfly-flare pointer-events-none z-20 opacity-80"
          />

          {/* Center Hub: Matte Slate Grey Center Label (Matching Image 2 with Chrome Star Spindle) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#1c1c20] border-4 border-black shadow-[0_10px_35px_rgba(0,0,0,0.98),inset_0_1px_2px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center p-2 text-center">
              {/* Concentric inner ring matching Image 2 center */}
              <div className="absolute inset-2.5 rounded-full border border-white/25 pointer-events-none" />

              {/* Liquid Metal Chrome 4-Point Star (Image 2) */}
              <ChromeStar size={36} spinning={isSpinning} glow={true} />

              <span className="text-[8px] sm:text-[9px] font-mono uppercase font-black tracking-widest text-white mt-1">
                PLAYLETTE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Controls & Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        {/* Brutalist "PULL TO SPIN" Button with Chrome Star Accent */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || numSegments === 0}
          className="group relative inline-flex items-center justify-center gap-3.5 px-10 py-5 rounded-full bg-black text-white hover:bg-white hover:text-black border-2 border-white disabled:opacity-50 transition-all font-mono uppercase text-sm sm:text-base font-black tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] hover:scale-105 active:scale-95"
        >
          <ChromeStar
            size={18}
            spinning={isSpinning}
            glow={false}
            className="group-hover:rotate-90 transition-transform duration-500"
          />
          <span className="relative z-10">
            {isSpinning ? 'ROULETTE SPINNING...' : 'PULL TO SPIN'}
          </span>
          <div className="w-2 h-2 rounded-full bg-white group-hover:bg-black shadow-[0_0_8px_#ffffff] animate-ping" />
        </button>

        {/* Resample Button */}
        {tracks.length > 20 && onResample && (
          <button
            onClick={onResample}
            disabled={isSpinning}
            className="flex items-center gap-2 px-5 py-4 rounded-full bg-black border border-white/30 text-white hover:border-white hover:bg-white/10 font-mono text-xs uppercase tracking-wider transition-colors shadow-md"
            title="Randomly sample 20 other tracks from this playlist"
          >
            <Dices className="w-4 h-4 text-white" />
            <span>Reshuffle 20</span>
          </button>
        )}

        {/* Collapse / Preview Mode Toggle */}
        {onToggleCollapse && selectedTrack && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-2 px-5 py-4 rounded-full bg-black border border-white/30 text-white hover:border-white hover:bg-white/10 font-mono text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            <Minimize2 className="w-3.5 h-3.5 text-white" />
            <span>Now Playing</span>
          </button>
        )}
      </div>

      {/* Winning Announcement Banner in Stark Monochrome */}
      {currentWinnerIndex !== null && (
        <div className="p-3.5 px-6 rounded-full bg-white text-black text-xs font-mono font-bold flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-bounce">
          <Sparkles className="w-4 h-4 text-black" />
          <span className="uppercase tracking-wider">SELECTED TRACK:</span>
          <span className="uppercase underline">
            {segments[currentWinnerIndex]?.name}
          </span>
          <span className="text-zinc-700">— {segments[currentWinnerIndex]?.artist}</span>
        </div>
      )}
    </div>
  );
};
