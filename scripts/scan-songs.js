const fs = require('fs');
const path = require('path');
const musicMetadata = require('music-metadata');

const SONGS_DIR = path.join(__dirname, '../public/songs');
const COVERS_DIR = path.join(__dirname, '../public/covers');
const OUTPUT_FILE = path.join(__dirname, '../public/songs-manifest.json');

// Curated high quality vinyl album arts for tracks without embedded cover images
const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445985543470-41fdd7738750?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop',
];

function cleanFilename(filename) {
  const baseName = filename.replace(/\.[^/.]+$/, '').trim();
  const parts = baseName.split(/\s*-\s*/);
  if (parts.length >= 2) {
    const maybeTrackNum = parts[0].trim();
    if (/^\d+$/.test(maybeTrackNum) && parts.length >= 3) {
      return {
        artist: parts[1].trim(),
        title: parts.slice(2).join(' - ').trim(),
      };
    }
    return {
      artist: parts[0].replace(/^\d+[\s._-]+/, '').trim(),
      title: parts.slice(1).join(' - ').trim(),
    };
  }

  const cleanTitle = baseName.replace(/^\d+[\s._-]+/, '').trim();
  return {
    artist: 'Local Artist',
    title: cleanTitle || 'Untitled Track',
  };
}

async function scanSongs() {
  console.log('🎵 Scanning /public/songs/ for audio tracks...');

  if (!fs.existsSync(SONGS_DIR)) {
    fs.mkdirSync(SONGS_DIR, { recursive: true });
  }
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SONGS_DIR);
  const audioFiles = files.filter((f) =>
    /\.(mp3|m4a|wav|aac|flac|ogg)$/i.test(f)
  );

  console.log(`Found ${audioFiles.length} audio file(s) in /public/songs/`);

  const tracks = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const filename = audioFiles[i];
    const filePath = path.join(SONGS_DIR, filename);
    const fallback = cleanFilename(filename);

    let title = fallback.title;
    let artist = fallback.artist;
    let album = 'Local Vinyl Collection';
    let duration_ms = 180000;
    let albumArt = FALLBACK_COVERS[i % FALLBACK_COVERS.length];

    try {
      const metadata = await musicMetadata.parseFile(filePath);

      if (metadata.common.title && metadata.common.title.trim()) {
        title = metadata.common.title.trim();
      }
      if (metadata.common.artist && metadata.common.artist.trim()) {
        artist = metadata.common.artist.trim();
      }
      if (metadata.common.album && metadata.common.album.trim()) {
        album = metadata.common.album.trim();
      }
      if (metadata.format.duration && !isNaN(metadata.format.duration)) {
        duration_ms = Math.round(metadata.format.duration * 1000);
      }

      // Check for embedded album artwork
      const picture = musicMetadata.selectCover(metadata.common.picture);
      if (picture && picture.data) {
        const safeBase = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = picture.format ? picture.format.split('/')[1] || 'jpg' : 'jpg';
        const coverFilename = `cover-${safeBase}.${ext}`;
        const coverPath = path.join(COVERS_DIR, coverFilename);

        fs.writeFileSync(coverPath, picture.data);
        albumArt = `/covers/${coverFilename}`;
      }
    } catch (err) {
      console.warn(`[WARN] Could not parse ID3 tags for "${filename}": ${err.message}. Using filename fallback.`);
    }

    tracks.push({
      id: `song-${i + 1}`,
      name: title,
      artist: artist,
      album: album,
      albumArt: albumArt,
      duration_ms: duration_ms,
      external_url: '',
      preview_url: `/songs/${encodeURIComponent(filename)}`,
      filename: filename,
    });
  }

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tracks, null, 2), 'utf-8');
  console.log(`✅ Generated manifest with ${tracks.length} track(s) at: /public/songs-manifest.json`);

  tracks.forEach((t, idx) => {
    console.log(`  [${String(idx + 1).padStart(2, '0')}] ${t.name} — ${t.artist} (${Math.round(t.duration_ms / 1000)}s) -> ${t.preview_url}`);
  });
}

scanSongs().catch((err) => {
  console.error('Error scanning songs:', err);
  process.exit(1);
});
