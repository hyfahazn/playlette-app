import { Playlist, Track, UserProfile } from './types';

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
];

// PKCE Helper Functions (client-side, standard Web Crypto API)
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function getDefaultRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/callback`;
  }
  return 'http://localhost:3000/callback';
}

export async function redirectToSpotifyAuth(clientId: string, redirectUri?: string) {
  const targetRedirectUri = redirectUri || getDefaultRedirectUri();
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('spotify_code_verifier', codeVerifier);
    window.sessionStorage.setItem('spotify_client_id', clientId);
    window.sessionStorage.setItem('spotify_redirect_uri', targetRedirectUri);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: targetRedirectUri,
  });

  window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{ accessToken: string; expiresIn: number; refreshToken?: string }> {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify token exchange failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;
  const expiresAt = Date.now() + expiresIn * 1000;

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('spotify_access_token', accessToken);
    window.sessionStorage.setItem('spotify_token_expires_at', expiresAt.toString());
    if (data.refresh_token) {
      window.sessionStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
  }

  return {
    accessToken,
    expiresIn,
    refreshToken: data.refresh_token,
  };
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem('spotify_access_token');
  const expiresAtStr = window.sessionStorage.getItem('spotify_token_expires_at');
  if (!token) return null;

  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    // 60 second safety buffer
    if (Date.now() > expiresAt - 60000) {
      clearToken();
      return null;
    }
  }
  return token;
}

export function setStoredToken(token: string, expiresIn = 3600) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem('spotify_access_token', token);
  window.sessionStorage.setItem('spotify_token_expires_at', (Date.now() + expiresIn * 1000).toString());
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('spotify_access_token');
  window.sessionStorage.removeItem('spotify_token_expires_at');
  window.sessionStorage.removeItem('spotify_code_verifier');
}

export async function fetchCurrentUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Spotify user profile (${res.status})`);
  }
  const data = await res.json();
  return {
    id: data.id,
    displayName: data.display_name || 'Spotify Listener',
    images: data.images || [],
    email: data.email,
    product: data.product,
  };
}

export async function fetchUserPlaylists(token: string): Promise<Playlist[]> {
  const res = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Spotify playlists (${res.status})`);
  }
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    name: item.name || 'Untitled Playlist',
    description: item.description || '',
    images: item.images || [],
    trackCount: item.tracks?.total || 0,
    owner: item.owner?.display_name || 'Spotify User',
    external_url: item.external_urls?.spotify || '',
  }));
}

export async function fetchPlaylistTracks(token: string, playlistId: string): Promise<Track[]> {
  const res = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch playlist tracks (${res.status})`);
  }
  const data = await res.json();
  const tracks: Track[] = [];

  (data.items || []).forEach((item: any) => {
    const t = item.track;
    if (!t || !t.id) return;

    tracks.push({
      id: t.id,
      name: t.name || 'Unknown Title',
      artist: (t.artists || []).map((a: any) => a.name).join(', ') || 'Unknown Artist',
      album: t.album?.name || 'Single',
      albumArt:
        t.album?.images?.[0]?.url ||
        t.album?.images?.[1]?.url ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
      duration_ms: t.duration_ms || 180000,
      external_url: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
      preview_url: t.preview_url || null,
      uri: t.uri,
    });
  });

  return tracks;
}

export { TARGET_ARTISTS, correctArtistName, getInitialArtistPool } from './artistPoolData';
import { getInitialArtistPool } from './artistPoolData';

export async function fetchArtistPoolTracks(token?: string | null): Promise<Track[]> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/spotify/search', {
      method: 'GET',
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from search API route, using verified fallback:', err);
  }
  return getInitialArtistPool();
}

import haifaSpotifyData from './haifaSpotifyData.json';

export const HAIFA_PROFILE = haifaSpotifyData.profile;
export const HAIFA_PLAYLISTS: Playlist[] = haifaSpotifyData.playlists as Playlist[];
export const HAIFA_TRACKS_BY_PLAYLIST: Record<string, Track[]> = haifaSpotifyData.tracksByPlaylist as Record<string, Track[]>;

// Curated Playlists (Haifa's Spotify Playlists featured directly)
export const DEMO_PLAYLISTS: Playlist[] = [
  ...HAIFA_PLAYLISTS,
  {
    id: 'demo-psychedelic',
    name: 'CHROME PSYCHEDELIA // 2026',
    description: 'Analog synthesizers, fuzzy basslines, and hypnotic guitar loops.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
      },
    ],
    trackCount: 8,
    owner: 'Playlette Curators',
    external_url: 'https://open.spotify.com',
  },
  {
    id: 'demo-synthwave',
    name: 'METALLIC DRIFT // NOIR',
    description: 'Dystopian night drives through brushed chrome and neon silhouettes.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop',
      },
    ],
    trackCount: 7,
    owner: 'Midnight Transmission',
    external_url: 'https://open.spotify.com',
  },
  {
    id: 'demo-grunge',
    name: 'SILVER RECORD VAULT',
    description: 'Vintage 7-inch pressings, rare B-sides, and raw stereo mixes.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop',
      },
    ],
    trackCount: 6,
    owner: 'Wax & Steel',
    external_url: 'https://open.spotify.com',
  },
];

export const DEMO_TRACKS_BY_PLAYLIST: Record<string, Track[]> = {
  ...HAIFA_TRACKS_BY_PLAYLIST,
  'demo-psychedelic': [
    {
      id: 'demo-1',
      name: 'Borderline',
      artist: 'Tame Impala',
      album: 'The Slow Rush',
      albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop',
      duration_ms: 237000,
      external_url: 'https://open.spotify.com/track/5hM5arv9KDbCHS0k9uqwjr',
      preview_url: '/songs/Tame%20Impala%20-%20Borderline.wav',
    },
    {
      id: 'demo-2',
      name: 'The Less I Know The Better',
      artist: 'Tame Impala',
      album: 'Currents',
      albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop',
      duration_ms: 216000,
      external_url: 'https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ',
      preview_url: '/songs/Tame%20Impala%20-%20The%20Less%20I%20Know%20The%20Better.wav',
    },
    {
      id: 'demo-3',
      name: 'Feels Like We Only Go Backwards',
      artist: 'Tame Impala',
      album: 'Lonerism',
      albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop',
      duration_ms: 192000,
      external_url: 'https://open.spotify.com/track/0LtOwyZoSNZKJwhqjzADNy',
      preview_url: '/songs/Tame%20Impala%20-%20Feels%20Like%20We%20Only%20Go%20Backwards.wav',
    },
    {
      id: 'demo-4',
      name: 'Instant Crush',
      artist: 'Daft Punk ft. Julian Casablancas',
      album: 'Random Access Memories',
      albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
      duration_ms: 337000,
      external_url: 'https://open.spotify.com/track/2cGxRwrMygjFu8x01uwARp',
      preview_url: '/songs/Daft%20Punk%20-%20Instant%20Crush.wav',
    },
    {
      id: 'demo-5',
      name: 'Breathe (In the Air)',
      artist: 'Pink Floyd',
      album: 'The Dark Side of the Moon',
      albumArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop',
      duration_ms: 169000,
      external_url: 'https://open.spotify.com/track/2ctvdKmETyOzPb2GiJJT53',
      preview_url: '/songs/Pink%20Floyd%20-%20Breathe%20(In%20the%20Air).wav',
    },
    {
      id: 'demo-6',
      name: 'Chamber of Reflection',
      artist: 'Mac DeMarco',
      album: 'Salad Days',
      albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
      duration_ms: 231000,
      external_url: 'https://open.spotify.com/track/77vP0bY7p0o8Z4c9rD3KjW',
      preview_url: '/songs/Mac%20DeMarco%20-%20Chamber%20of%20Reflection.wav',
    },
    {
      id: 'demo-7',
      name: 'Redbone',
      artist: 'Childish Gambino',
      album: '"Awaken, My Love!"',
      albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop',
      duration_ms: 326000,
      external_url: 'https://open.spotify.com/track/0wXuerDYiBnERgIpbbMuUC',
      preview_url: '/songs/Childish%20Gambino%20-%20Redbone.wav',
    },
    {
      id: 'demo-8',
      name: 'Dreams',
      artist: 'Fleetwood Mac',
      album: 'Rumours',
      albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop',
      duration_ms: 257000,
      external_url: 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz',
      preview_url: '/songs/Fleetwood%20Mac%20-%20Dreams.wav',
    },
  ],
  'demo-synthwave': [
    {
      id: 'synth-1',
      name: 'Do I Wanna Know?',
      artist: 'Arctic Monkeys',
      album: 'AM',
      albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
      duration_ms: 272000,
      external_url: 'https://open.spotify.com/track/5FVd6KXrgO9B3JPmC8OPst',
      preview_url: '/songs/Arctic%20Monkeys%20-%20Do%20I%20Wanna%20Know.wav',
    },
    {
      id: 'synth-2',
      name: 'Feel Good Inc.',
      artist: 'Gorillaz',
      album: 'Demon Days',
      albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop',
      duration_ms: 222000,
      external_url: 'https://open.spotify.com/track/0d28khcov9ApubBr0GQqpQ',
      preview_url: '/songs/Gorillaz%20-%20Feel%20Good%20Inc.wav',
    },
    {
      id: 'synth-3',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      albumArt: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop',
      duration_ms: 200000,
      external_url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
      preview_url: '/songs/The%20Weeknd%20-%20Blinding%20Lights.wav',
    },
    {
      id: 'synth-4',
      name: 'Lovebomb',
      artist: 'The Neighbourhood',
      album: 'Hard To Imagine',
      albumArt: 'https://images.unsplash.com/photo-1445985543470-41fdd7738750?w=600&auto=format&fit=crop',
      duration_ms: 215000,
      external_url: 'https://open.spotify.com/track/7lPN2DXiMsVn7XUKtOW1CS',
      preview_url: '/songs/The%20Neighbourhood%20-%20Lovebomb.wav',
    },
  ],
  'demo-grunge': [
    {
      id: 'grunge-1',
      name: 'Instant Crush',
      artist: 'Daft Punk',
      album: 'Random Access Memories',
      albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop',
      duration_ms: 337000,
      external_url: 'https://open.spotify.com/track/2cGxRwrMygjFu8x01uwARp',
      preview_url: '/songs/Daft%20Punk%20-%20Instant%20Crush.wav',
    },
    {
      id: 'grunge-2',
      name: 'Borderline',
      artist: 'Tame Impala',
      album: 'The Slow Rush',
      albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop',
      duration_ms: 237000,
      external_url: 'https://open.spotify.com/track/5hM5arv9KDbCHS0k9uqwjr',
      preview_url: '/songs/Tame%20Impala%20-%20Borderline.wav',
    },
  ],
};
