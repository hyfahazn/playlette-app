const artists = [
  'Hasan Raheem',
  'Ritviz',
  'Tame Impala',
  'The Neighbourhood',
  'Billie Eilish',
  'Videoclub',
  'Stormzy'
];

async function findTracksForArtist(artist) {
  // Let's search or scrape embed for tracks
  const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(artist)}`;
  console.log('Searching for:', artist);
}

run();
async function run() {
  for (const a of artists) {
    await findTracksForArtist(a);
  }
}
