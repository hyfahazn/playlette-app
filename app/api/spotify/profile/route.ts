import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing profile URL or user ID' }, { status: 400 });
    }

    // Extract user ID from URL or bare string
    let userId = url.trim();
    const userMatch = userId.match(/user\/([a-zA-Z0-9]+)/);
    if (userMatch) {
      userId = userMatch[1];
    }

    const profileRes = await fetch(`https://open.spotify.com/user/${userId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    const html = await profileRes.text();

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const displayName = titleMatch ? titleMatch[1].replace(' on Spotify', '').trim() : userId;

    const rawPlaylists = html.match(/playlist\/([a-zA-Z0-9]+)/g) || [];
    const playlistIds = [...new Set(rawPlaylists.map((p) => p.replace('playlist/', '')))];

    const playlists = [];
    for (const id of playlistIds.slice(0, 12)) {
      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${id}`);
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          playlists.push({
            id,
            name: oembed.title || 'Untitled Playlist',
            description: `${displayName}'s Spotify Crate`,
            images: [{ url: oembed.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600' }],
            trackCount: 0,
            owner: displayName,
            external_url: `https://open.spotify.com/playlist/${id}`,
          });
        }
      } catch {
        // Skip failed item
      }
    }

    return NextResponse.json({
      profile: {
        id: userId,
        displayName,
        profileUrl: `https://open.spotify.com/user/${userId}`,
      },
      playlists,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to resolve Spotify profile' }, { status: 500 });
  }
}
