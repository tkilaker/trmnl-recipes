#!/usr/bin/env node

const BASE_URL = process.env.SNAPSHOT_BASE_URL || 'http://127.0.0.1:8787';
const sources = ['dn', 'sydsvenskan'];

async function checkImage(url, label) {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15_000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
    throw new Error(`${label}: image is not usable (${response.status} ${response.headers.get('content-type') || 'unknown type'})`);
  }
}

for (const source of sources) {
  const response = await fetch(`${BASE_URL}/${source}.json`, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${source}: snapshot returned HTTP ${response.status}`);
  const snapshot = await response.json();
  const displayed = snapshot.items.slice(0, 7);
  if (displayed.length < 7) throw new Error(`${source}: only ${displayed.length} displayable stories`);

  for (const [index, item] of displayed.entries()) {
    const label = `${source} #${index + 1} ${item.title || '(untitled)'}`;
    if (!item.title || item.title.length < 12) throw new Error(`${label}: missing title`);
    if (!item.description || item.description.length < 30) throw new Error(`${label}: missing meaningful description`);
    if (!item.category) throw new Error(`${label}: missing topic`);
    if (/^annons/i.test(item.description) || /^annons/i.test(item.title)) throw new Error(`${label}: advertisement selected`);
    if (!item.image?.startsWith('https://')) throw new Error(`${label}: missing image URL`);
    await checkImage(item.image, label);
  }
  console.log(`${source}: ${displayed.length} displayed articles verified (${snapshot.capturedAtLocal})`);
}
