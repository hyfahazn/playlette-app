'use client';

import React from 'react';
import { ViewState } from '@/lib/types';
import { ChromeStar } from './ChromeStar';
import { RotateCcw, LogOut, Library, Music, Sparkles, Grid, Eye } from 'lucide-react';

export type AtmosphereMode = 'matrix' | 'wireframe' | 'void';

interface NavbarProps {
  view: ViewState;
  selectedPlaylistName?: string;
  hasTracks: boolean;
  onNavigate: (view: ViewState) => void;
  onDisconnect?: () => void;
  atmosphereMode?: AtmosphereMode;
  onCycleAtmosphere?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  view,
  selectedPlaylistName,
  hasTracks,
  onNavigate,
  onDisconnect,
  atmosphereMode = 'matrix',
  onCycleAtmosphere,
}) => {
  const getAtmosphereLabel = () => {
    switch (atmosphereMode) {
      case 'matrix':
        return 'FX: LED MATRIX';
      case 'wireframe':
        return 'FX: WIREFRAME';
      case 'void':
        return 'FX: MINIMAL VOID';
    }
  };

  return (
    <header className="w-full border-b border-white/20 bg-black/90 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-8 py-3.5 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.98)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand logo & Edition Tag with Y2K Chrome Star */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate(hasTracks ? 'wheel' : 'landing')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            {/* Liquid Chrome Star Emblem from Image 2 */}
            <div className="relative w-8 h-8 rounded-full bg-black border border-white/50 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-all">
              <ChromeStar size={24} glow={false} />
            </div>

            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-tight leading-none text-white flex items-center gap-1.5 drop-shadow-sm">
                PLAYLETTE
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-white text-black font-mono font-black">
                  CHROME
                </span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
                DIFFRACTIVE & 1-BIT
              </span>
            </div>
          </button>

          {/* Active Playlist Tag */}
          {hasTracks && selectedPlaylistName && (
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-pulse" />
              <span className="text-xs font-mono tracking-wider uppercase text-zinc-300 truncate max-w-[240px]">
                {selectedPlaylistName}
              </span>
            </div>
          )}
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3">
          {/* Atmosphere FX Selector Button (cycles through Image 3 Matrix, Image 4 Wireframe, Void) */}
          {onCycleAtmosphere && (
            <button
              onClick={onCycleAtmosphere}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-white border border-white/30 rounded-full hover:bg-white hover:text-black transition-all shadow-sm"
              title="Click to cycle visual effects (LED Matrix Wave, 3D Wireframe, Void)"
            >
              {atmosphereMode === 'matrix' && <Grid className="w-3.5 h-3.5" />}
              {atmosphereMode === 'wireframe' && <Eye className="w-3.5 h-3.5" />}
              {atmosphereMode === 'void' && <Sparkles className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline font-bold">{getAtmosphereLabel()}</span>
              <span className="sm:hidden font-bold">FX</span>
            </button>
          )}

          {view === 'now_playing' && (
            <button
              onClick={() => onNavigate('wheel')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-white border border-white/30 rounded-full hover:bg-white hover:text-black transition-all shadow-sm"
              title="Return to full wheel view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Full Wheel</span>
            </button>
          )}

          {hasTracks && view === 'wheel' && (
            <button
              onClick={() => onNavigate('now_playing')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white border border-white/20 hover:border-white rounded-full transition-colors"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Now Playing</span>
            </button>
          )}


          {/* Disconnect Button */}
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-white/20 hover:border-white"
              title="Disconnect Spotify session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Disconnect</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black border border-white/30 text-white text-[11px] font-mono font-bold shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            <span>NOIR</span>
          </div>
        </div>
      </div>
    </header>
  );
};
