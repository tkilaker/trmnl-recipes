// Normalises the Sydsvenskan RSS payload into a flat `items[]` for Liquid.
// Also trims to 20 items / 280 chars to stay under TRMNL's 100 KB polling limit
// if the feed ever grows.
function transform(input) {
  const raw = input?.channel?.item || input?.rss?.channel?.item || [];
  const items = raw.slice(0, 20).map(it => ({
    title: String(it.title || '').trim(),
    description: String(it.description || it.summary || it.abstract || '').trim().slice(0, 280),
    pubDate: String(it.pubDate || it.published || '')
  }));
  return { items };
}
