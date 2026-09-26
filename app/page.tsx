'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Track, Playlist, ViewState } from '@/lib/types';
import {
  getStoredToken,
  clearToken,
  fetchUserPlaylists,
  fetchPlaylistTracks,
  redirectToSpotifyAuth,
  DEMO_PLAYLISTS,
  DEMO_TRACKS_BY_PLAYLIST,
  fetchArtistPoolTracks,
  getInitialArtistPool,
  TARGET_ARTISTS,
} from '@/lib/spotify';
import { Navbar, AtmosphereMode } from '@/components/Navbar';
import { Landing } from '@/components/Landing';
import { Wheel } from '@/components/Wheel';
import { VinylRecord } from '@/components/VinylRecord';
import { Lyrics } from '@/components/Lyrics';
import { Player } from '@/components/Player';
import { PixelMatrixWave } from '@/components/PixelMatrixWave';
import { TopographicMesh } from '@/components/TopographicMesh';
import { soundFX } from '@/lib/audio';
import {
  Disc,
  RotateCcw,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Library,
  Music,
  ExternalLink,
  Radio,
} from 'lucide-react';

export default function HomePage() {
  // Start directly on Wheel — no playlist picker step
  const [view, setView] = useState<ViewState>('wheel');
  const [token, setToken] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>({
    id: '7-artist-pool',
    name: '7-ARTIST POOL // ROULETTE',
    description: 'Hasan Raheem, Ritviz, Tame Impala, The Neighbourhood, Billie Eilish, Videoclub, Stormzy',
    images: [{ url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600' }],
    trackCount: 35,
    owner: 'Spotify Curators',
    external_url: 'https://open.spotify.com',
  });
  const [tracks, setTracks] = useState<Track[]>(() => getInitialArtistPool());
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(() => getInitialArtistPool()[0] || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);

  // Atmosphere FX mode: 'matrix' (Image 3) | 'wireframe' (Image 4) | 'void'
  const [atmosphereMode, setAtmosphereMode] = useState<AtmosphereMode>('matrix');

  const handleCycleAtmosphere = () => {
    setAtmosphereMode((prev) => {
      if (prev === 'matrix') return 'wireframe';
      if (prev === 'wireframe') return 'void';
      return 'matrix';
    });
  };

  // On mount: check stored token and immediately call Spotify Search API for target artists
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
    }
    loadArtistPool(storedToken);
  }, []);

  // Fetch top tracks across the 7 artists (market-agnostic, merged into one deduped pool)
  const loadArtistPool = async (authToken?: string | null) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const pooledTracks = await fetchArtistPoolTracks(authToken);
      if (pooledTracks && pooledTracks.length > 0) {
        setTracks(pooledTracks);
        if (!selectedTrack) {
          setSelectedTrack(pooledTracks[0]);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching artist pool tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate Spotify OAuth PKCE flow (optional user connect)
  const handleConnectSpotify = (customClientId?: string) => {
    const clientId =
      customClientId ||
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ||
      '';

    if (!clientId) {
      setErrorMessage('Please provide a valid Spotify Client ID.');
      return;
    }

    try {
      redirectToSpotifyAuth(clientId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate Spotify login.');
    }
  };

  // Wheel landed on a track -> transition to Now Playing
  const handleTrackLanded = (track: Track) => {
    setSelectedTrack(track);
    setCurrentTime(0);
    setDuration(30);
    setIsPlaying(Boolean(track.preview_url));
    setView('now_playing');
  };

  // Reshuffle tracks across all artists in the pool
  const handleResample = () => {
    const shuffled = [...tracks].sort(() => 0.5 - Math.random());
    setTracks(shuffled);
    soundFX.playTick(1.4);
  };


  // Audio Play/Pause toggle
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Next Track
  const handleNextTrack = () => {
    if (!selectedTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === selectedTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    setSelectedTrack(nextTrack);
    setCurrentTime(0);
    setDuration(30);
    setIsPlaying(Boolean(nextTrack.preview_url));
  };

  // Previous Track
  const handlePrevTrack = () => {
    if (!selectedTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === selectedTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIndex];
    setSelectedTrack(prevTrack);
    setCurrentTime(0);
    setDuration(30);
    setIsPlaying(Boolean(prevTrack.preview_url));
  };

  // Disconnect Spotify session
  const handleDisconnect = () => {
    clearToken();
    setToken(null);
    setIsPlaying(false);
    const initial = getInitialArtistPool();
    setTracks(initial);
    setSelectedTrack(initial[0] || null);
    setView('wheel');
  };

  const selectedTrackIndex = selectedTrack
    ? tracks.findIndex((t) => t.id === selectedTrack.id) + 1
    : 1;

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Dynamic Background Atmosphere FX */}
      {atmosphereMode === 'matrix' && (
        <PixelMatrixWave
          isPlaying={isPlaying}
          opacity={0.35}
          className="fixed inset-0 z-0"
        />
      )}
      {atmosphereMode === 'wireframe' && (
        <TopographicMesh
          isPlaying={isPlaying}
          opacity={0.4}
          className="fixed inset-0 z-0"
        />
      )}

      {/* Top Navbar */}
      <Navbar
        view={view}
        selectedPlaylistName={selectedPlaylist?.name}
        hasTracks={tracks.length > 0}
        onNavigate={(newView) => setView(newView)}
        onDisconnect={token ? handleDisconnect : undefined}
        atmosphereMode={atmosphereMode}
        onCycleAtmosphere={handleCycleAtmosphere}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto pb-12">
        {/* Error Notification */}
        {errorMessage && (
          <div className="m-4 p-4 rounded-2xl bg-zinc-950 border border-white/30 text-white text-xs font-mono flex items-center justify-between shadow-lg">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-white font-bold hover:underline ml-4 uppercase text-[10px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW 1: LANDING SCREEN (OPTIONAL LAUNCHPAD) */}
        {view === 'landing' && (
          <div className="animate-aperture-wipe">
            <Landing
              onConnectSpotify={handleConnectSpotify}
              onSelectDemoPlaylist={(_, demoTracks) => {
                setTracks(demoTracks);
                setSelectedTrack(demoTracks[0] || null);
                setView('wheel');
              }}
              onLoadUserPlaylists={() => setView('wheel')}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* VIEW 2: FULL ROULETTE WHEEL (Direct on load, no playlist-picker step) */}
        {view === 'wheel' && (
          <div className="py-6 space-y-6 animate-aperture-wipe">
            <div className="flex items-center justify-between px-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
                <span className="truncate max-w-[260px] sm:max-w-xl">
                  7-ARTIST POOL // HASAN RAHEEM • RITVIZ • TAME IMPALA • THE NBHD • BILLIE EILISH • VIDEOCLUB • STORMZY
                </span>
              </div>

              {selectedTrack && (
                <button
                  onClick={() => setView('now_playing')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-white hover:underline"
                >
                  <span>Go to Now Playing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Wheel
              tracks={tracks}
              onSelectTrack={handleTrackLanded}
              isCollapsed={false}
              selectedTrack={selectedTrack}
              onResample={tracks.length > 20 ? handleResample : undefined}
            />
          </div>
        )}

        {/* VIEW 4: NOW PLAYING VIEW */}
        {view === 'now_playing' && selectedTrack && (
          <div className="py-6 px-4 md:px-8 space-y-8 animate-aperture-wipe">
            {/* Top Collapsible Wheel Bar */}
            <Wheel
              tracks={tracks}
              onSelectTrack={handleTrackLanded}
              isCollapsed={true}
              onToggleCollapse={() => setView('wheel')}
              selectedTrack={selectedTrack}
              onResample={tracks.length > 20 ? handleResample : undefined}
            />

            {/* Editorial Metadata Bar */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3 text-xs font-mono tracking-widest text-zinc-400 uppercase">
              <div className="flex items-center gap-2">
                <span>SPEC 02</span>
                <span className="text-white">•</span>
                <span className="font-bold text-white">NOW PLAYING</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <span>SPOTIFY CRATE</span>
                <span>BUTTERFLY DIFFRACTION</span>
                <span>LYRICS TRANSCRIPT</span>
                <span className="text-white font-bold">PLAYLETTE AUDIO</span>
              </div>
            </div>

            {/* Split Layout: Left Vinyl Record & Right Track Details / Lyrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (5 Cols): Vinyl Record Art matching Image 2 */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                <VinylRecord
                  track={selectedTrack}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  trackIndex={selectedTrackIndex}
                />

                {/* Sub-label under vinyl */}
                <div className="text-center pt-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    CURRENT CRATE SELECTION
                  </div>
                  <div className="text-xs font-mono font-bold uppercase text-white mt-0.5 tracking-wider">
                    {selectedPlaylist?.name || 'PLAYLETTE VINYL'}
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Big Bold Typography + Lyrics Panel + Queue */}
              <div className="lg:col-span-7 space-y-6">
                {/* Big Bold Headline */}
                <div className="space-y-1">
                  <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.9] text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]">
                    {selectedTrack.artist}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-400">
                      {selectedTrack.album}
                    </span>
                    <span className="text-white">•</span>
                    <span className="text-xs sm:text-sm font-mono uppercase font-bold text-white">
                      {selectedTrack.name}
                    </span>
                  </div>
                </div>

                {/* Lyrics Panel */}
                <div className="space-y-2">
                  <Lyrics
                    track={selectedTrack}
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                  />
                </div>

                {/* Playlist Tracks Snippet */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-white/20 pb-1">
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                      CRATE QUEUE
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {tracks.length} TRACKS IN CRATE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tracks.slice(0, 4).map((t, idx) => {
                      const isActive = t.id === selectedTrack.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTrack(t);
                            setCurrentTime(0);
                            setDuration(30);
                            setIsPlaying(Boolean(t.preview_url));
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                            isActive
                              ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.6)]'
                              : 'bg-black border-white/15 hover:border-white text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`text-xs font-mono font-bold ${
                                isActive ? 'text-zinc-600' : 'text-zinc-500'
                              }`}
                            >
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-white/20 flex-shrink-0">
                              {t.albumArt ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={t.albumArt}
                                  alt={t.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Disc className="w-4 h-4 m-2 text-zinc-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-display font-black uppercase truncate ${
                                  isActive ? 'text-black' : 'text-white'
                                }`}
                              >
                                {t.name}
                              </div>
                              <div
                                className={`text-[10px] font-mono truncate ${
                                  isActive ? 'text-zinc-700' : 'text-zinc-400'
                                }`}
                              >
                                {t.artist}
                              </div>
                            </div>
                          </div>

                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-black shadow-[0_0_6px_#000000] animate-pulse flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Monochrome Player Bar */}
            <div className="sticky bottom-4 z-40 pt-4">
              <Player
                track={selectedTrack}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNextTrack={handleNextTrack}
                onPrevTrack={handlePrevTrack}
                onTimeUpdate={(cur, dur) => {
                  setCurrentTime(cur);
                  if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
                    setDuration(dur);
                  }
                }}
                onEnded={() => {
                  // Freeze on track end, do not auto-advance
                  setIsPlaying(false);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-white/15 py-5 px-4 text-center text-xs font-mono text-zinc-500 bg-black">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span>1-BIT CELESTIAL • DIFFRACTIVE MONOCHROME VINYL SYSTEM</span>
          <div className="flex items-center gap-4">
            <span>HIGH-CONTRAST NOIR</span>
            <span>•</span>
            <span>SYNCHRONIZED LYRICS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
