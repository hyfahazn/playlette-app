async function test() {
  const ids = ['1yFryDjhXXIIaJA1dKqrab', '46L6o4d7xP5l40v8cE8v6O'];
  for (const id of ids) {
    const res = await fetch(`https://open.spotify.com/embed/track/${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (match) {
      const ent = JSON.parse(match[1]).props?.pageProps?.state?.data?.entity;
      console.log(id, ent?.title, ent?.audioPreview?.url);
    }
  }
}
test();
