'use client';

import React, { useState, useRef } from 'react';
import { Track } from '@/lib/types';
import { DitheredMoon } from './DitheredMoon';
import { ChromeStar } from './ChromeStar';
import { Radio, Sparkles, Layers, Box } from 'lucide-react';

interface VinylRecordProps {
  track: Track;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  trackIndex?: number;
}

export const VinylRecord: React.FC<VinylRecordProps> = ({
  track,
  isPlaying,
  currentTime = 0,
  duration = track.duration_ms ? track.duration_ms / 1000 : 180,
  trackIndex = 1,
}) => {
  // Mode: '3d-silver' (Image 1 angled record with neon hues) or '2d-diffractive' (Image 2 butterfly diffraction)
  const [recordMode, setRecordMode] = useState<'3d-silver' | '2d-diffractive'>('3d-silver');
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (recordMode !== '3d-silver' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  // Base 3D transformation for silver vinyl (matching Image 1)
  const tiltRotateY = -34 + mouseTilt.x * 12;
  const tiltRotateX = 14 - mouseTilt.y * 10;
  const tiltRotateZ = 6;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center p-2 select-none w-full max-w-[460px]"
    >
      {/* Mode Switcher Pill */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-950 border border-white/20 mb-3 text-[10px] font-mono uppercase tracking-wider z-40">
        <button
          onClick={() => setRecordMode('3d-silver')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            recordMode === '3d-silver'
              ? 'bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.7)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Box className="w-3 h-3" />
          <span>3D SILVER VINYL (IMAGE 1)</span>
        </button>

        <button
          onClick={() => setRecordMode('2d-diffractive')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            recordMode === '2d-diffractive'
              ? 'bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.7)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>DIFFRACTIVE 2D</span>
        </button>
      </div>

      {/* Main Record Stage */}
      <div className="relative w-[300px] h-[300px] sm:w-[370px] sm:h-[370px] lg:w-[410px] lg:h-[410px] flex items-center justify-center perspective-container">
        {/* =========================================================================
            MODE 1: 3D SILVER VINYL RECORD (Faithful to Reference Image 1)
           ========================================================================= */}
        {recordMode === '3d-silver' && (
          <div
            className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-300 ease-out"
            style={{
              transform: `rotateY(${tiltRotateY}deg) rotateX(${tiltRotateX}deg) rotateZ(${tiltRotateZ}deg) scale(0.96)`,
            }}
          >
            {/* Chromatic Rainbow Lens Flare Beam (The "Soft Neon Hues" from Image 1) */}
            <div className="absolute -inset-x-24 sm:-inset-x-32 top-1/2 -translate-y-1/2 h-20 sm:h-28 prismatic-neon-flare pointer-events-none z-30 opacity-90 animate-pulse" />
            <div className="absolute -inset-x-20 sm:-inset-x-28 top-1/2 -translate-y-1/2 h-4 sm:h-6 prismatic-neon-beam pointer-events-none z-30 opacity-100" />

            {/* Glowing Specular Flare on Record Edge */}
            <div className="absolute -left-4 top-1/4 w-12 h-24 bg-white/70 blur-xl pointer-events-none z-30" />
            <div className="absolute -right-4 bottom-1/4 w-16 h-28 bg-white/80 blur-xl pointer-events-none z-30" />

            {/* 3D Silver Vinyl Disc */}
            <div
              className={`relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[380px] lg:h-[380px] rounded-full silver-metallic-surface shadow-[0_40px_100px_rgba(0,0,0,1),0_0_60px_rgba(255,255,255,0.25)] flex items-center justify-center overflow-hidden border-[3px] border-white/80 transition-all duration-700 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                animationDuration: '6s',
                boxShadow:
                  '0 0 35px rgba(255, 255, 255, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.85), 0 30px 80px rgba(0,0,0,0.95)',
              }}
            >
              {/* Silver Conic Shine Sweeps */}
              <div className="absolute inset-0 silver-conic-shine pointer-events-none opacity-90" />

              {/* Concentric Polished Microgrooves */}
              <div className="absolute inset-0 vinyl-grooves-pattern pointer-events-none opacity-70" />

              {/* Fine Silver Concentric Grooves */}
              <div className="absolute inset-4 rounded-full border border-white/40 pointer-events-none" />
              <div className="absolute inset-9 rounded-full border border-black/20 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-white/50 pointer-events-none" />
              <div className="absolute inset-24 rounded-full border border-black/25 pointer-events-none" />
              <div className="absolute inset-32 rounded-full border border-white/40 pointer-events-none" />

              {/* Blinding White Specular Flash Spots (matching Image 1 highlights) */}
              <div className="absolute left-[15%] top-[15%] w-24 h-24 rounded-full bg-white/80 blur-lg pointer-events-none" />
              <div className="absolute right-[12%] bottom-[12%] w-32 h-32 rounded-full bg-white/90 blur-xl pointer-events-none" />

              {/* Center Matte Slate & Chrome Star Hub */}
              <div className="relative w-[38%] h-[38%] rounded-full bg-[#18181b] shadow-[0_10px_30px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.7)] border-2 border-white flex flex-col items-center justify-center text-center overflow-hidden z-20">
                {/* Inner Bevel Ring */}
                <div className="absolute inset-2 rounded-full border border-white/30 pointer-events-none" />

                {/* Y2K Chrome 4-Point Star as Center Emblem (Image 2) */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                  <ChromeStar size={34} spinning={isPlaying} glow={true} />

                  <div className="text-[7px] font-mono tracking-widest uppercase font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                    SILVER 33 RPM
                  </div>
                  <div className="text-[9px] font-display font-black text-white uppercase tracking-tight truncate max-w-[100px]">
                    {track.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Metadata Box from Reference Image 1 */}
            <div className="absolute -left-6 sm:-left-12 -bottom-10 p-3 rounded-lg bg-black/85 backdrop-blur-md border border-white/20 text-left pointer-events-none max-w-[210px] hidden sm:block shadow-2xl z-30">
              <div className="text-[9px] font-mono font-black uppercase text-white tracking-widest flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-white" />
                <span>PROMPT SPEC 01</span>
              </div>
              <div className="text-[7.5px] font-mono uppercase text-zinc-300 tracking-wider leading-tight mt-1 opacity-90">
                A SILVER VINYL RECORD: HIGH CONTRAST MONOCHROMATIC WITH SOFT NEON HUES
              </div>
              <div className="text-[7px] font-mono uppercase text-zinc-500 mt-1">
                PRISMATIC DIFFRACTION // 3D
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODE 2: 2D DIFFRACTIVE BUTTERFLY VINYL (Reference Image 2)
           ========================================================================= */}
        {recordMode === '2d-diffractive' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Outer Fine White Orbital Hairline */}
            <div className="absolute inset-[-14px] sm:inset-[-18px] rounded-full border border-white/20 pointer-events-none shadow-[0_0_25px_rgba(255,255,255,0.1)]" />

            {/* Orbiting Stark White Dot Indicator */}
            <div className="absolute -right-3.5 sm:-right-4.5 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                </div>
                <div className="absolute -inset-1.5 rounded-full border border-white/60 animate-ping" />
              </div>
            </div>

            {/* The Vinyl Disc itself */}
            <div
              className={`relative w-full h-full rounded-full bg-black shadow-[0_30px_80px_rgba(0,0,0,1),0_0_40px_rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden border-2 border-white/30 transition-all duration-700 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                animationDuration: '8s',
              }}
            >
              {/* Concentric Microgroove Pattern */}
              <div className="absolute inset-0 vinyl-grooves-pattern pointer-events-none opacity-80" />

              {/* Concentric Groove Rings */}
              <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-7 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-white/15 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-21 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-26 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-32 rounded-full border border-white/15 pointer-events-none" />
              <div className="absolute inset-38 rounded-full border border-white/5 pointer-events-none" />

              {/* Liquid Mercury Butterfly Specular Diffraction Light */}
              <div className="absolute inset-0 vinyl-butterfly-flare pointer-events-none opacity-90" />

              {/* Center Label with Embedded Dithered Moon & Chrome Star */}
              <div className="relative w-[44%] h-[44%] rounded-full bg-[#27272a] shadow-[0_15px_35px_rgba(0,0,0,0.98),inset_0_1px_2px_rgba(255,255,255,0.5)] border-2 border-black flex flex-col items-center justify-center text-center overflow-hidden z-20">
                <div className="absolute inset-3 rounded-full border border-white/20 pointer-events-none" />

                {/* Dithered Moon Graphic */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none scale-75">
                  <DitheredMoon size={130} />
                </div>

                <div className="absolute inset-0 bg-black/35 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center max-w-[85%] space-y-1">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="text-[8px] font-mono tracking-widest uppercase font-black">
                      SIDE A // 33 RPM
                    </span>
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                  </div>

                  <div className="font-display font-black text-[11px] sm:text-xs text-white uppercase tracking-tight truncate max-w-[130px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {track.name}
                  </div>

                  <div className="text-[8px] sm:text-[9px] font-mono text-zinc-300 uppercase tracking-widest truncate max-w-[120px]">
                    {track.artist}
                  </div>

                  {/* Chrome Star as center spindle cap */}
                  <div className="mt-1 flex items-center justify-center">
                    <ChromeStar size={20} spinning={false} glow={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dual Timestamps Underneath */}
      <div className="w-full flex items-center justify-between px-6 pt-5 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          <span className="text-white font-bold">{formatTime(currentTime)}</span>
        </div>
        <div className="text-zinc-500 font-bold tracking-widest">
          TRACK #{String(trackIndex).padStart(2, '0')}
        </div>
        <div className="text-zinc-400">
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
