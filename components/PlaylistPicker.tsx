'use client';

import React, { useState } from 'react';
import { Playlist } from '@/lib/types';
import { Disc, Search, ArrowRight, Music, AlertCircle, RefreshCw } from 'lucide-react';

interface PlaylistPickerProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const PlaylistPicker: React.FC<PlaylistPickerProps> = ({
  playlists,
  onSelectPlaylist,
  isLoading = false,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');

  const filtered = playlists.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="border-b border-white/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
            STEP 01: SELECT SOUNDTRACK CRATE
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
            SPOTIFY PLAYLIST CRATE
          </h2>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-1">
            Choose a crate from your library to populate the diffractive vinyl roulette wheel.
          </p>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search playlists or curator..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-black border border-white/25 rounded-full text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:shadow-[0_0_20px_rgba(255,255,255,0.4)] shadow-inner transition-all"
            />
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-full bg-black border border-white/25 hover:border-white hover:bg-white hover:text-black text-white transition-all shadow-md"
              title="Refresh playlists from Spotify"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State: Stark Dither Shimmer */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-white/15 bg-black space-y-4 dither-pattern-box animate-pulse"
            >
              <div className="aspect-square w-full rounded-xl bg-zinc-900 border border-white/10" />
              <div className="h-4 w-3/4 rounded bg-zinc-800" />
              <div className="h-3 w-1/2 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {/* Playlist Grid */}
      {!isLoading && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/20 rounded-3xl p-8 space-y-4 bg-black/60 backdrop-blur-md">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-white mx-auto">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg uppercase text-white tracking-wide">
                  No Playlists Found
                </h3>
                <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  No playlists match your search. Make sure you have created or followed public playlists on Spotify.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((playlist) => {
                const coverArt = playlist.images?.[0]?.url;
                return (
                  <div
                    key={playlist.id}
                    onClick={() => onSelectPlaylist(playlist)}
                    className="group relative cursor-pointer p-4 rounded-2xl border border-white/15 bg-black hover:border-white transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_40px_rgba(0,0,0,0.95)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Image Container with Vinyl Peek effect */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-white/15 mb-4 shadow-inner">
                        {/* Peeking Glossy Vinyl Record (behind cover art on hover) */}
                        <div className="absolute right-0 top-0 bottom-0 w-24 rounded-full bg-black border border-white/30 transform translate-x-12 group-hover:translate-x-6 transition-transform duration-500 overflow-hidden opacity-80 pointer-events-none">
                          <div className="absolute inset-0 vinyl-butterfly-flare opacity-90" />
                          <div className="absolute inset-0 vinyl-grooves-pattern" />
                        </div>

                        {coverArt ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverArt}
                            alt={playlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-10"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950 relative z-10">
                            <Disc className="w-10 h-10 mb-2 text-zinc-400" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                              NO ARTWORK
                            </span>
                          </div>
                        )}

                        {/* Top corner track count pill */}
                        <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-0.5 rounded-full bg-black/90 backdrop-blur-md border border-white/30 text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                          <Music className="w-2.5 h-2.5 text-white" />
                          <span>{playlist.trackCount}</span>
                        </div>
                      </div>

                      {/* Titles */}
                      <div className="space-y-1">
                        <h3 className="font-display font-black text-base uppercase text-white truncate group-hover:underline drop-shadow-sm tracking-tight">
                          {playlist.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-400 truncate">
                          BY {playlist.owner}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                      <span className="group-hover:text-white transition-colors">
                        LOAD WHEEL
                      </span>
                      <div className="w-6 h-6 rounded-full bg-black border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-all shadow-sm">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
