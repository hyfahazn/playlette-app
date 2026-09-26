const tracksToTest = [
  // Billie Eilish
  { name: 'everything i wanted', id: '3ZCTVFBt2Brf31RLEnCkWJ' },
  { name: 'when the partys over', id: '43zdsphuZLzwA9k4DJhU0I' },
  { name: 'bellyache', id: '7jioG2pT8oWzCdf0jIknj1' },
  { name: 'bury a friend', id: '4SSnFejRGlZik202WQscXQ' },
  // Stormzy
  { name: 'Big For Your Boots', id: '2Uzyz3BfPzU89f66sYtH6f' },
  { name: 'Blinded By Your Grace Pt 2', id: '7o2W494Yy6eXj88bQZ2p5X' },
  { name: 'Cold', id: '4rA6u3ZJ1yF6u3w1h6v44k' },
  // Ritviz
  { name: 'Pran', id: '2ZtG1v2g0V8oWzCdf0jIkn' },
  { name: 'Thandi Hawa', id: '0vX8rW4u2V1k8q2s1L4z6W' },
  // Videoclub
  { name: 'En nuit', id: '3vK9b2mZ8k4q7s3L9z5Y1p' },
  { name: 'Mai', id: '4rK7c1mX9k3q2s6L8z4X2m' }
];

async function check() {
  for (const t of tracksToTest) {
    try {
      const res = await fetch(`https://open.spotify.com/embed/track/${t.id}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const entity = data.props?.pageProps?.state?.data?.entity;
        if (entity?.audioPreview?.url) {
          console.log(t.name, '->', entity.audioPreview.url);
        }
      }
    } catch {}
  }
}
check();
