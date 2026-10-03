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
- `http://127.0.0.1:8787/hn.json` (Hacker News top 30, held for 30 minutes)
- `http://127.0.0.1:8787/las` (`/las/hn`, `/las/dn`, `/las/syd`)
- `http://127.0.0.1:8787/healthz`

Each endpoint returns `capturedAtLocal`, `edition`, `latestCount` and an
`items[]` array. An item has `title`, `description`, `image`, `category`,
`url`, `kind` (`latest` or `editorial`) and `time` when the newspaper supplied
one. The transforms in `../dn-news/src/transform.js` and
`../sydsvenskan-news/src/transform.js` accept this shape as well as the old RSS
shape, which keeps local preview and marketplace use intact.

## Read more

Each screen carries a QR code for `/las/<screen>`: a phone page listing only
that screen's stories (most installs have one recipe), with the same numbers as
the display and a quiet footer link to the other lists. `/las` shows all of them.
Each story links to the article (and the
HN comments). Paths are case-insensitive so the QR codes can use the compact
alphanumeric mode. Regenerate a code with
`qrencode -t ASCII -l M -m 0 HTTPS://MINI.TAIL899CB0.TS.NET/LAS/HN` and convert
it to the inline SVG path used in the templates. Bookmarking `/las` works too.

The TRMNL X cards reserve up to five lines for the ingress. The older OG layout
keeps its larger type and shorter four-story list.

## Runtime on the Mac mini

The user launch agent `com.tim.trmnl-frontpage` runs `server.mjs` on
`127.0.0.1:8787`. Logs live in `/Users/tim/Library/Logs/trmnl-frontpage.log`;
cached editions live in `/Users/tim/Library/Caches/trmnl-frontpages/`.

## Public route

Tailscale Funnel publishes only that port at a fixed hostname:

```sh
tailscale funnel --bg --yes 8787   # persisted by tailscaled across reboots
tailscale funnel status
```

TRMNL polls `https://mini.tail899cb0.ts.net/dn.json?source=frontpage-v1` and
`https://mini.tail899cb0.ts.net/sydsvenskan.json?source=frontpage-v1`. The
service is read-only: anything except `/healthz`, `/las`, `/hn.json`, `/dn.json` and
`/sydsvenskan.json` returns 404, and requests never trigger an upstream fetch.
No router port-forwarding is required.

## Verification

Run this after parser or layout changes:

```sh
node /Users/tim/dev/trmnl-recipes/frontpage-snapshot/validate-snapshot.mjs
```

It checks the seven stories that can be shown on each full-screen display:
title, meaningful description, topic, non-ad status, image URL and that every
image endpoint returns an image response. After that, force a TRMNL data refresh
and inspect both `markup_full` screenshots.
