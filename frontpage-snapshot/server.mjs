#!/usr/bin/env node

import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const CACHE_DIR = process.env.CACHE_DIR || join(homedir(), 'Library', 'Caches', 'trmnl-frontpages');
const DISPLAY_TIME_ZONE = process.env.DISPLAY_TIME_ZONE || 'Europe/Stockholm';
const USER_AGENT = 'TimNewsSnapshot/1.0 (+local read-only display)';

const sources = {
  dn: {
    name: 'Dagens Nyheter',
    origin: 'https://www.dn.se',
    latestFeed: 'https://www.dn.se/rss/',
    async items(html) {
      const found = [];
      const pattern = /<a\b([^>]*data-link-category="teaser"[^>]*)>([\s\S]*?)<\/a>/gi;
      for (const match of html.matchAll(pattern)) {
        const attrs = match[1];
        const component = attribute(attrs, 'data-component-type');
        const href = absoluteUrl(attribute(attrs, 'href'), this.origin);
        const title = clean(attribute(attrs, 'data-label') || firstTag(match[2], 'h2|h3'));
        if (!['large', 'standard'].includes(component) || !articleUrl(href) || title.length < 12) continue;
        found.push(item({ title, href, context: match[0], kind: 'editorial' }));
      }
      return uniqueItems(found);
    }
  },
  sydsvenskan: {
    name: 'Sydsvenskan',
    origin: 'https://www.sydsvenskan.se',
    latestFeed: 'https://www.sydsvenskan.se/feeds/feed.xml',
    async items(html) {
      const found = [];
      const pattern = /<a\b([^>]*\bclass="[^"]*\bblock-link-overlay\b[^"]*"[^>]*)>/gi;
      for (const match of html.matchAll(pattern)) {
        const href = absoluteUrl(attribute(match[1], 'href'), this.origin);
        if (!articleUrl(href)) continue;
        const start = html.lastIndexOf('<div class="teaser-j2-base ', match.index);
        if (start < 0) continue;
        const context = html.slice(start, match.index);
        const title = clean(attribute(context.slice(0, 900), 'data-article-title') || lastTag(context, 'h1|h2|h3'));
        if (title.length < 12) continue;
        found.push(item({ title, href, context, imageContext: context, kind: 'editorial' }));
      }
      return uniqueItems(found);
    }
  }
};

function decode(value = '') {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ouml;/gi, 'ö').replace(/&Ouml;/g, 'Ö')
    .replace(/&aring;/gi, 'å').replace(/&Aring;/g, 'Å')
    .replace(/&auml;/gi, 'ä').replace(/&Auml;/g, 'Ä')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '');
}

function clean(value = '') {
  return decode(String(value).replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function attribute(attrs, name) {
  const match = attrs.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? decode(match[1] || match[2] || match[3] || '') : '';
}

function firstTag(html, tagPattern) {
  const match = html.match(new RegExp(`<(${tagPattern})\\b[^>]*>([\\s\\S]*?)<\\/\\1>`, 'i'));
  return match ? match[2] : '';
}

function lastTag(html, tagPattern) {
  const matches = [...html.matchAll(new RegExp(`<(${tagPattern})\\b[^>]*>([\\s\\S]*?)<\\/\\1>`, 'gi'))];
  return matches.at(-1)?.[2] || '';
}

function absoluteUrl(value, origin) {
  try { return new URL(value, origin).toString(); } catch { return ''; }
}

function articleUrl(url) {
  if (!url.startsWith('https://www.dn.se/') && !url.startsWith('https://www.sydsvenskan.se/')) return false;
  return !/\/(direkt|spel|nyhetsbrev|prenumerera|sok|om)\/?($|\?)/.test(new URL(url).pathname);
}

function imageUrl(context) {
  const candidates = [...context.matchAll(/<(?:img|source)\b[^>]*(?:src|data-src|srcset)="([^"]+)"[^>]*>/gi)]
    .flatMap(match => decode(match[1]).split(',').map(value => value.trim().split(/\s+/)[0]))
    .filter(value => value.startsWith('https://'));
  return candidates.at(0) || '';
}

function description(context, title) {
  const paragraphs = [...context.matchAll(/<p\b[^>]*class="[^"]*(?:ds-teaser__text|teaser-j2-text)[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => clean(match[1]))
    .filter(text => text.length > 30 && text !== title && !/^(annons|annonsering|prenumerera)/i.test(text));
  return (paragraphs.at(0) || '').slice(0, 600);
}

function metaDescription(html) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)];
  for (const match of tags) {
    const name = attribute(match[0], 'name') || attribute(match[0], 'property');
    if (!/^(description|og:description)$/i.test(name)) continue;
    const text = clean(attribute(match[0], 'content'));
    if (text.length >= 30 && !/^(annons|annonsering|prenumerera)/i.test(text)) return text;
  }
  return '';
}

async function enrichEditorial(items) {
  return Promise.all(items.map(async entry => {
    if (entry.description.length >= 160) return entry;
    try {
      const article = await fetchHtml(entry.url);
      const expanded = metaDescription(article);
      return expanded.length > entry.description.length + 40
        ? { ...entry, description: expanded.slice(0, 600) }
        : entry;
    } catch {
      return entry;
    }
  }));
}

function category(href) {
  const section = new URL(href).pathname.split('/').filter(Boolean)[0] || '';
  return ({ sverige: 'Sverige', varlden: 'Världen', ekonomi: 'Ekonomi', kultur: 'Kultur', sport: 'Sport', malmo: 'Malmö', lund: 'Lund', skane: 'Skåne', opinion: 'Opinion', debatt: 'Debatt', ledare: 'Ledare', stockholm: 'Stockholm', noje: 'Nöje', 'dygnet-runt': 'Dygnet runt' })[section] || 'Nyheter';
}

function item({ title, href, context, imageContext = context, kind = 'editorial' }) {
  return {
    title,
    description: description(context, title),
    image: imageUrl(imageContext),
    category: category(href),
    url: href,
    kind,
    time: ''
  };
}

function localTimestamp(value = new Date()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(value);
  const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}.${values.minute}`;
}

function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return clean(match?.[1] || '');
}

function latestItems(xml, origin) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => {
    const entry = match[1];
    const href = absoluteUrl(tag(entry, 'link'), origin);
    const image = attribute(entry.match(/<media:content\b[^>]*>/i)?.[0] || '', 'url');
    return {
      title: tag(entry, 'title'),
      description: tag(entry, 'description').slice(0, 600),
      image: decode(image),
      category: category(href),
      url: href,
      pubDate: tag(entry, 'pubDate'),
      kind: 'latest',
      time: localTimestamp(new Date(tag(entry, 'pubDate')))
    };
  }).filter(entry => entry.title && entry.url);
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item.title || item.description.length < 30 || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, 10);
}

function combineItems(latest, editorial) {
  const seen = new Set();
  const hero = editorial.slice(0, 1);
  const rest = editorial.slice(1);
  return [...hero, ...latest.slice(0, 3), ...rest].filter(entry => {
    if (!entry.title || entry.description.length < 30 || seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  }).slice(0, 10);
}

function stockholmNow() {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit'
  }).formatToParts();
  return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
}

function edition() {
  const now = stockholmNow();
  const date = `${now.year}-${now.month}-${now.day}`;
  const hour = Number(now.hour);
  if (hour >= 15) return `${date}-eftermiddag`;
  if (hour >= 7) return `${date}-morgon`;

  const yesterday = new Date(`${date}T12:00:00+02:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  const previous = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(yesterday).replaceAll('/', '-');
  return `${previous}-eftermiddag`;
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

async function snapshotPath(key) {
  await mkdir(CACHE_DIR, { recursive: true });
  return join(CACHE_DIR, `${key}.json`);
}

async function load(key) {
  try { return JSON.parse(await readFile(await snapshotPath(key), 'utf8')); } catch { return null; }
}

async function save(key, snapshot) {
  const path = await snapshotPath(key);
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, path);
}

async function refresh(key, force = false) {
  const existing = await load(key);
  const currentEdition = edition();
  const source = sources[key];
  let editorialItems = existing?.editorialItems || existing?.items || [];
  if (force || existing?.edition !== currentEdition) {
    const html = await fetchHtml(source.origin);
    editorialItems = await enrichEditorial(await source.items(html));
  }
  if (editorialItems.length < 5) throw new Error(`${source.name}: only ${editorialItems.length} editorial candidates found`);

  let latest = [];
  if (source.latestFeed) {
    latest = latestItems(await fetchHtml(source.latestFeed), source.origin);
    if (latest.length < 3) throw new Error(`${source.name}: only ${latest.length} latest candidates found`);
  }

  const snapshot = {
    source: source.name,
    capturedAt: new Date().toISOString(),
    capturedAtLocal: localTimestamp(),
    edition: currentEdition,
    latestCount: latest.length ? 3 : 0,
    editorialItems,
    items: combineItems(latest, editorialItems)
  };
  await save(key, snapshot);
  console.log(`${key}: saved ${snapshot.items.length} articles for ${currentEdition}`);
  return snapshot;
}

async function refreshAll(force = false) {
  for (const key of Object.keys(sources)) {
    try { await refresh(key, force); } catch (error) { console.error(`${key}: ${error.message}`); }
  }
}

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' });
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname === '/healthz') return json(response, 200, { ok: true, edition: edition() });
  const key = pathname.match(/^\/(dn|sydsvenskan)\.json$/)?.[1];
  if (!key) return json(response, 404, { error: 'not found' });
  const snapshot = await load(key);
  if (!snapshot) return json(response, 503, { error: 'snapshot not ready' });
  return json(response, 200, snapshot);
});

await refreshAll(true);
setInterval(refreshAll, 5 * 60 * 1000).unref();
server.listen(PORT, HOST, () => console.log(`frontpage snapshot listening on http://${HOST}:${PORT}`));
