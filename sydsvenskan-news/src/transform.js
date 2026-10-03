// Normalises the Sydsvenskan RSS payload into a flat `items[]` for Liquid.
// Also trims to 10 items / 280 chars to stay under TRMNL's 100 KB polling limit
// if the feed ever grows.
function imageUrl(item) {
  const candidates = [
    item?.image,
    item?.['media:content'],
    item?.mediaContent,
    item?.content,
    item?.['media:thumbnail'],
    item?.thumbnail,
    item?.enclosure
  ].flatMap(value => Array.isArray(value) ? value : [value]);

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && /^https?:\/\//.test(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      const url = candidate.url || candidate['@url'] || candidate?._attributes?.url;
      if (typeof url === 'string' && /^https?:\/\//.test(url)) return url;
    }
  }
  return '';
}

function cleanText(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function transform(input) {
  const raw = input?.items || input?.channel?.item || input?.rss?.channel?.item || [];
  const items = raw.slice(0, 10).map(it => ({
    title: cleanText(it.title),
    description: cleanText(it.description || it.summary || it.abstract).slice(0, 560),
    pubDate: String(it.pubDate || it.published || input?.capturedAt || ''),
    image: imageUrl(it),
    category: cleanText(it.category),
    kind: cleanText(it.kind),
    time: cleanText(it.time)
  }));
  return { capturedAt: input?.capturedAtLocal || input?.capturedAt || new Date().toISOString(), latestCount: input?.latestCount || 0, items };
}
