# Frontpage snapshots

The two bathroom displays are deliberately not driven by an endless RSS list.
This small dependency-free Node service captures each newspaper's start page,
then exposes a small, checked JSON edition for the two private TRMNL plugins.

## Editorial policy

- **Main story**: the first editorially placed story on the newspaper's front
  page. Its own front-page image is the only large image in the layout.
- **Three latest**: the three newest entries in each newspaper's official RSS
  feed are placed immediately after the main story and labelled `JUST NU`.
- **The rest**: selected front-page stories, labelled `UTVALT`.
- **Context**: every displayed story must have a title, article description,
  topic and article image. Advertisements, bylines and malformed teaser pairs
  are rejected rather than being shown. When a front-page teaser is too terse,
  the service reads the article's own metadata description and keeps it only if
  it adds meaningful context.
- **Cadence**: the editorial set is frozen once before 07:00 as the previous
  afternoon edition, once at 07:00, and once at 15:00. The three latest
  stories are refreshed every five minutes.

`capturedAtLocal` is deliberately rendered as Stockholm local time. It is the
time the source was actually read, not the time TRMNL happens to render the
screen, so a stuck source is visible.

## Data contract

Endpoints, available only on the Mac mini:

- `http://127.0.0.1:8787/dn.json`
- `http://127.0.0.1:8787/sydsvenskan.json`
- `http://127.0.0.1:8787/healthz`

Each endpoint returns `capturedAtLocal`, `edition`, `latestCount` and an
`items[]` array. An item has `title`, `description`, `image`, `category`,
`url`, `kind` (`latest` or `editorial`) and `time` when the newspaper supplied
one. The transforms in `../dn-news/src/transform.js` and
`../sydsvenskan-news/src/transform.js` accept this shape as well as the old RSS
shape, which keeps local preview and marketplace use intact.

The TRMNL X cards reserve up to five lines for the ingress. The older OG layout
keeps its larger type and shorter four-story list.

## Runtime on the Mac mini

Two user launch agents keep the setup alive:

| Agent | Responsibility |
| --- | --- |
| `com.tim.trmnl-frontpage` | Runs `server.mjs` on `127.0.0.1:8787`. |
| `com.tim.trmnl-frontpage-tunnel` | Runs `quick-tunnel.mjs`, discovers the tunnel URL and updates the two private TRMNL polling URLs. |

Logs live in `/Users/tim/Library/Logs/trmnl-frontpage.log` and
`/Users/tim/Library/Logs/trmnl-frontpage-tunnel.log`. Cached editions and the
current tunnel URL live in `/Users/tim/Library/Caches/trmnl-frontpages/`.

The service never listens on the LAN. Cloudflare Tunnel is the only public
route, and it carries read-only JSON only. No router port-forwarding or public
Mini IP is required.

## Tunnel state and stable-domain migration

The current account has no Cloudflare zone, so `quick-tunnel.mjs` uses a
Cloudflare Quick Tunnel. That hostname changes after a tunnel restart, but the
companion updates the private TRMNL plugin settings automatically.

For the final setup, add an owned domain to Cloudflare, create a named Tunnel,
and map a single hostname such as `news.example.se` to
`http://127.0.0.1:8787`. Replace the Quick Tunnel launch agent only after the
named route responds. The TRMNL polling paths remain `/dn.json` and
`/sydsvenskan.json`.

## Verification

Run this after parser or layout changes:

```sh
node /Users/tim/dev/trmnl-recipes/frontpage-snapshot/validate-snapshot.mjs
```

It checks the seven stories that can be shown on each full-screen display:
title, meaningful description, topic, non-ad status, image URL and that every
image endpoint returns an image response. After that, force a TRMNL data refresh
and inspect both `markup_full` screenshots.
