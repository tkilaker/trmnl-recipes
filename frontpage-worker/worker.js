// Serves the editions the Mac mini publishes. The mini pushes, TRMNL polls here,
// so the screens never depend on reaching home. One Durable Object keeps the
// latest payloads and the anonymous daily counters.
import { DurableObject } from 'cloudflare:workers';

const FEEDS = ['dn', 'sydsvenskan', 'hn'];
const PAGES = ['las', 'las/hn', 'las/dn', 'las/syd'];
const STALE_MINUTES = 30;

export default {
  fetch(request, env) {
    return env.STORE.get(env.STORE.idFromName('main')).fetch(request);
  }
};

export class Store extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    const authorized = request.headers.get('authorization') === `Bearer ${this.env.PUBLISH_TOKEN}`;

    if (request.method === 'PUT' && path.startsWith('publish/')) {
      if (!authorized) return new Response('forbidden', { status: 403 });
      const name = path.slice('publish/'.length);
      if (!FEEDS.includes(name) && !PAGES.includes(name)) return new Response('unknown', { status: 404 });
      await this.ctx.storage.put(`payload:${name}`, await request.text());
      await this.ctx.storage.put(`published:${name}`, Date.now());
      return new Response('ok');
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('method not allowed', { status: 405 });

    if (path === 'healthz') {
      const ages = {};
      for (const feed of FEEDS) {
        const at = await this.ctx.storage.get(`published:${feed}`);
        ages[feed] = at ? Math.round((Date.now() - at) / 60000) : null;
      }
      // dn and sydsvenskan are pushed every five minutes; stale means the mini stopped publishing.
      const ok = ['dn', 'sydsvenskan'].every(feed => ages[feed] !== null && ages[feed] < STALE_MINUTES);
      return json({ ok, minutesSincePublish: ages }, ok ? 200 : 503, 'no-store');
    }
    if (path === 'stats') {
      if (!authorized) return new Response('forbidden', { status: 403 });
      const days = await this.ctx.storage.list({ prefix: 'stats:' });
      return json(Object.fromEntries([...days].map(([key, value]) => [key.slice(6), value])), 200, 'no-store');
    }

    const feed = path.match(/^(dn|sydsvenskan|hn)\.json$/)?.[1];
    const page = PAGES.includes(path) ? path : null;
    if (!feed && !page) return json({ error: 'not found' }, 404);

    const body = await this.ctx.storage.get(`payload:${feed || page}`);
    if (!body) return json({ error: 'snapshot not ready' }, 503, 'no-store');
    // Tim's own installs send reader=tim; everything else is someone else.
    const name = feed
      ? `poll:${feed}${url.searchParams.get('reader') === 'tim' ? ':tim' : ''}`
      : `las:${page.split('/')[1] || 'all'}`;
    await this.count(name);
    return feed
      ? new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' } })
      : new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' } });
  }

  async count(name) {
    const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
    const key = `stats:${day}`;
    const stats = (await this.ctx.storage.get(key)) || {};
    stats[name] = (stats[name] || 0) + 1;
    await this.ctx.storage.put(key, stats);
  }
}

function json(body, status = 200, cache = 'no-cache') {
  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache }
  });
}
