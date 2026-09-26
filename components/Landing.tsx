'use client';

import React, { useState } from 'react';
import { HAIFA_PLAYLISTS, DEMO_PLAYLISTS, DEMO_TRACKS_BY_PLAYLIST } from '@/lib/spotify';
import { Playlist, Track } from '@/lib/types';
import { DitheredMoon } from './DitheredMoon';
import { ChromeStar } from './ChromeStar';
import {
  Disc3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sliders,
  Play,
  Key,
  Link as LinkIcon,
  User,
  Loader2,
  Box,
  Grid,
} from 'lucide-react';

interface LandingProps {
  onConnectSpotify: (clientId?: string) => void;
  onSelectDemoPlaylist: (playlist: Playlist, tracks: Track[]) => void;
  onLoadUserPlaylists: (playlists: Playlist[]) => void;
  isLoading?: boolean;
}

export const Landing: React.FC<LandingProps> = ({
  onConnectSpotify,
  onSelectDemoPlaylist,
  onLoadUserPlaylists,
  isLoading = false,
}) => {
  const [showCustomClientId, setShowCustomClientId] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [spotifyUrlInput, setSpotifyUrlInput] = useState(
    'https://open.spotify.com/user/31gouheklwdvjx4bsu7c5z3bsd4e?si=f95e2f79ce0e4c13'
  );
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const defaultClientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';

  const handleConnectClick = () => {
    if (defaultClientId) {
      onConnectSpotify(defaultClientId);
    } else if (customClientId.trim()) {
      onConnectSpotify(customClientId.trim());
    } else {
      setShowCustomClientId(true);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customClientId.trim()) {
      onConnectSpotify(customClientId.trim());
    }
  };

  const handleLoadHaifaCrate = () => {
    onLoadUserPlaylists(HAIFA_PLAYLISTS);
  };

  const handleResolveSpotifyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyUrlInput.trim()) return;

    setIsResolvingUrl(true);
    setUrlError(null);

    try {
      const input = spotifyUrlInput.trim();

      // Check if it's Haifa's URL
      if (input.includes('31gouheklwdvjx4bsu7c5z3bsd4e')) {
        onLoadUserPlaylists(HAIFA_PLAYLISTS);
        setIsResolvingUrl(false);
        return;
      }

      // Check if it's a playlist URL
      if (input.includes('/playlist/')) {
        const res = await fetch('/api/spotify/playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistId: input }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const playlistObj: Playlist = {
          id: data.playlist.id,
          name: data.playlist.name,
          description: `Imported Spotify Playlist • ${data.tracks.length} tracks`,
          images: [{ url: data.playlist.coverArt }],
          trackCount: data.tracks.length,
          owner: 'Spotify User',
          external_url: input,
        };
        onSelectDemoPlaylist(playlistObj, data.tracks);
        setIsResolvingUrl(false);
        return;
      }

      // Otherwise try profile resolve endpoint
      const res = await fetch('/api/spotify/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.playlists && data.playlists.length > 0) {
        onLoadUserPlaylists(data.playlists);
      } else {
        throw new Error('No public playlists found for this Spotify profile.');
      }
    } catch (err: any) {
      console.error(err);
      setUrlError(err.message || 'Could not resolve Spotify URL. Try another or explore sample crates.');
    } finally {
      setIsResolvingUrl(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col justify-between py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Top Editorial Subheader in Stark Monochrome */}
      <div className="flex items-center justify-between border-b border-white/20 pb-4 text-xs font-mono tracking-widest text-zinc-400 uppercase">
        <div className="flex items-center gap-2">
          <span>SPEC 01 // 1-BIT DITHER</span>
          <span className="text-white">•</span>
          <span className="text-white font-bold">MONOCHROME VINYL SYSTEM</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <span>SPOTIFY PKCE & DIRECT SYNC</span>
          <span>HIGH-GLOSS DIFFRACTION</span>
          <span>2026 EDITION</span>
        </div>
      </div>

      {/* Main Hero & Connect Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-4">
        {/* Left Column (7 cols): Hero Typography & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-white/30 text-xs font-mono text-zinc-200 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
            STARK CONTRAST • ANALOGUE ROULETTE
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.9] text-white">
              PLAYLETTE
              <span className="block text-zinc-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                MONOCHROME
              </span>
            </h1>
            <p className="text-sm sm:text-base font-sans text-zinc-300 max-w-xl leading-relaxed pt-2">
              Transform Spotify playlists into an analogue roulette wheel with physical spin momentum, liquid mercury specular disc reflections, and synchronized lyrics transcripts.
            </p>
          </div>

          {/* Action Buttons & Fast Connect */}
          <div className="pt-2 space-y-4">
            {/* Featured Fast Connect for Haifa's Spotify Profile */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.9)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
                      <span>HAIFA&apos;S SPOTIFY CRATE</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                        CONNECTED
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 truncate max-w-[260px] sm:max-w-md">
                      open.spotify.com/user/31gouheklwdvjx4bsu7c5z3bsd4e
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLoadHaifaCrate}
                  className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>SPIN CRATE (6 PLAYLISTS)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct Spotify Profile / Playlist URL Bar */}
            <form
              onSubmit={handleResolveSpotifyUrl}
              className="p-3 px-4 rounded-2xl bg-black border border-white/20 backdrop-blur-xl shadow-xl flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={spotifyUrlInput}
                onChange={(e) => setSpotifyUrlInput(e.target.value)}
                placeholder="Paste any Spotify Profile or Playlist URL..."
                className="flex-1 bg-transparent border-none text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isResolvingUrl}
                className="px-4 py-2 rounded-full bg-zinc-900 border border-white/30 text-white hover:bg-white hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                {isResolvingUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>FETCHING...</span>
                  </>
                ) : (
                  <span>LOAD URL</span>
                )}
              </button>
            </form>

            {urlError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono">
                {urlError}
              </div>
            )}

            {/* OAuth Login & Sample Crates */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={handleConnectClick}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-zinc-900 border border-white/30 text-white font-mono uppercase text-xs font-bold tracking-wider hover:bg-white hover:text-black hover:border-white transition-all shadow-md"
              >
                <Play className="w-3 h-3 fill-current ml-0.5" />
                <span>CONNECT SPOTIFY (OAUTH)</span>
              </button>

              <button
                onClick={() => {
                  const p = DEMO_PLAYLISTS[0];
                  const t = DEMO_TRACKS_BY_PLAYLIST[p.id] || [];
                  onSelectDemoPlaylist(p, t);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black border border-white/20 hover:border-white text-zinc-300 hover:text-white font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>EXPLORE ALL SAMPLE CRATES</span>
              </button>
            </div>

            {/* Custom Client ID Input Form (Fallback if no env var) */}
            {showCustomClientId && (
              <form
                onSubmit={handleCustomSubmit}
                className="p-5 rounded-2xl bg-black border border-white/20 backdrop-blur-xl shadow-2xl space-y-3 max-w-lg animate-in fade-in"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-white font-bold uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5 text-white" />
                  <span>ENTER SPOTIFY CLIENT ID</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400">
                  Ensure <code className="text-white bg-zinc-900 px-1 py-0.5 border border-white/20 rounded">http://localhost:3000/callback</code> is added to your Spotify Developer App Redirect URIs.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="Spotify Client ID (32 chars)..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-zinc-950 border border-white/25 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                  >
                    GO
                  </button>
                </div>
              </form>
            )}

            {/* Client-Side PKCE Privacy Badge */}
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>100% Client-Side • Direct Spotify Sync • Instant Crate Spin</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): The 1-Bit Dithered Moon Sphere from Reference Image 1 */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative group cursor-pointer p-4">
            <DitheredMoon size={320} animate={true} />

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-black/90 border border-white/30 text-[10px] font-mono uppercase tracking-widest text-white shadow-lg pointer-events-none">
              1-BIT CELESTIAL ENGINE
            </div>
          </div>
        </div>
      </div>

      {/* Feature Spec Cards with 4 Aesthetic Engines (matching user reference images) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
        <div className="p-5 rounded-2xl bg-black border border-white/15 hover:border-white/50 transition-all shadow-xl space-y-2 dither-pattern-box group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            IMAGE 01 SPEC
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
            3D SILVER VINYL & NEON HUES
          </h3>
          <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
            3D angled perspective with chromatic rainbow flare, mirror silver sheen, and prompt metadata stamp.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-black border border-white/15 hover:border-white/50 transition-all shadow-xl space-y-2 dither-pattern-box group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <ChromeStar size={20} glow={false} />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            IMAGE 02 SPEC
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
            LIQUID CHROME 4-POINT STAR
          </h3>
          <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
            Fluid metallic chrome star spindle with deep facet ridges, specular highlights, and needle points.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-black border border-white/15 hover:border-white/50 transition-all shadow-xl space-y-2 dither-pattern-box group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Grid className="w-4 h-4 text-white" />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            IMAGE 03 SPEC
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
            LED PIXEL MATRIX WAVE
          </h3>
          <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
            CRT digital halftone dot matrix with sinuous undulating waves glowing across pitch black.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-black border border-white/15 hover:border-white/50 transition-all shadow-xl space-y-2 dither-pattern-box group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Sliders className="w-4 h-4 text-white" />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            IMAGE 04 SPEC
          </div>
          <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
            3D TOPOGRAPHIC WIREFRAME
          </h3>
          <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
            Cybernetic elevation mesh with valleys, craters, and mouse-reactive elevation geometry.
          </p>
        </div>
      </div>
    </div>
  );
};
