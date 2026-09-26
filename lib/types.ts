export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration_ms: number;
  external_url: string;
  preview_url: string | null;
  uri?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height?: number; width?: number }[];
  trackCount: number;
  owner: string;
  external_url: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  images: { url: string }[];
  email?: string;
  product?: string;
}

export interface LyricsData {
  lyrics: string;
  lines: string[];
  source: string;
  error?: string;
}

export type ViewState = 'landing' | 'playlists' | 'wheel' | 'now_playing';
