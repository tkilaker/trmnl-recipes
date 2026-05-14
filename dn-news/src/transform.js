// Trims the DN RSS payload to fit under TRMNL's 100KB polling limit.
// Returns a flat `items[]` for Liquid templates.
function transform(input) {
  const raw = input?.channel?.item || input?.rss?.channel?.item || [];
  const items = raw.slice(0, 10).map(it => ({
    title: String(it.title || '').trim(),
    description: String(it.description || it.summary || it.abstract || '').trim().slice(0, 280),
    pubDate: String(it.pubDate || it.published || '')
  }));
  return { items };
}
