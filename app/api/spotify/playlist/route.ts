import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { playlistId } = await req.json();
    if (!playlistId) {
      return NextResponse.json({ error: 'Missing playlist ID' }, { status: 400 });
    }

    const cleanId = playlistId.replace(/.*playlist\//, '').split('?')[0].trim();

    const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${cleanId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    const html = await embedRes.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

    if (!match) {
      return NextResponse.json({ error: 'Could not parse playlist tracks' }, { status: 404 });
    }

    const data = JSON.parse(match[1]);
    const entity = data.props?.pageProps?.state?.data?.entity;
    const coverArt =
      entity?.coverArt?.sources?.[0]?.url ||
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop';
    const playlistName = entity?.name || 'Spotify Crate';

    const rawTracks = entity?.trackList || [];
    const tracks = rawTracks.map((t: any, i: number) => {
      const trackId = t.uri ? t.uri.replace('spotify:track:', '') : `track-${cleanId}-${i}`;
      return {
        id: trackId,
        name: t.title || 'Untitled',
        artist: (t.subtitle || 'Artist').replace(/\u00a0/g, ' '),
        album: playlistName,
        albumArt: coverArt,
        duration_ms: t.duration || 180000,
        external_url: `https://open.spotify.com/track/${trackId}`,
        preview_url: t.audioPreview?.url || null,
        uri: t.uri,
      };
    });

    return NextResponse.json({
      playlist: {
        id: cleanId,
        name: playlistName,
        coverArt,
        trackCount: tracks.length,
      },
      tracks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch playlist tracks' }, { status: 500 });
  }
}
