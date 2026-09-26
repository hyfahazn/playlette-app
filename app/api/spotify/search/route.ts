import { NextResponse } from 'next/server';
import { TARGET_ARTISTS, correctArtistName, ARTIST_POOLS, getInitialArtistPool } from '@/lib/artistPoolData';
import { Track } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const mergedPool: Track[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    // If an active Spotify access token is provided, call Spotify Search API for each artist
    if (token) {
      for (const rawArtist of TARGET_ARTISTS) {
        const corrected = correctArtistName(rawArtist);
        try {
          // Market-agnostic track search as requested
          const searchUrl = `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(corrected)}&type=track&limit=10`;
          const res = await fetch(searchUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            const items = data.tracks?.items || [];
            for (const item of items) {
              const trackId = item.id;
              const titleKey = `${(item.name || '').toLowerCase()}_${corrected.toLowerCase()}`;
              if (!seenIds.has(trackId) && !seenTitles.has(titleKey)) {
                seenIds.add(trackId);
                seenTitles.add(titleKey);
                mergedPool.push({
                  id: trackId,
                  name: item.name,
                  artist: item.artists?.map((a: any) => a.name).join(', ') || corrected,
                  album: item.album?.name || 'Single',
                  albumArt:
                    item.album?.images?.[0]?.url ||
                    item.album?.images?.[1]?.url ||
                    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
                  duration_ms: item.duration_ms || 180000,
                  external_url: item.external_urls?.spotify || `https://open.spotify.com/track/${trackId}`,
                  preview_url:
                    item.preview_url ||
                    getInitialArtistPool().find(
                      (f) =>
                        f.id === trackId ||
                        f.name.toLowerCase() === (item.name || '').toLowerCase()
                    )?.preview_url ||
                    null,
                  uri: item.uri,
                });
              }
            }
          }
        } catch (searchErr) {
          console.warn(`Spotify Search API error for ${corrected}:`, searchErr);
        }
      }
    }

    // Merge in verified pool for any missing artists or if no token was passed
    const fallbackPool = getInitialArtistPool();
    for (const t of fallbackPool) {
      const titleKey = `${t.name.toLowerCase()}_${t.artist.toLowerCase()}`;
      if (!seenIds.has(t.id) && !seenTitles.has(titleKey)) {
        seenIds.add(t.id);
        seenTitles.add(titleKey);
        mergedPool.push(t);
      }
    }

    return NextResponse.json({
      artists: TARGET_ARTISTS.map(correctArtistName),
      count: mergedPool.length,
      tracks: mergedPool,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        artists: TARGET_ARTISTS.map(correctArtistName),
        count: getInitialArtistPool().length,
        tracks: getInitialArtistPool(),
      },
      { status: 200 }
    );
  }
}
