# Frontpage snapshots

The two bathroom displays are deliberately not driven by an endless RSS list.
This small dependency-free Node service captures each newspaper's start page,
then exposes a small, checked JSON edition for the two private TRMNL plugins.

## Editorial policy

- **Main story**: the first editorially placed story on the newspaper's front
  page. Its own front-page image is the only large image in the layout, and its
  text is the article page's public ingress when that is longer than the teaser.
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

TRMNL polls a Cloudflare Worker, never the mini (see Publishing below):

- `https://trmnl.diane-feedback-relay.workers.dev/dn.json`
- `https://trmnl.diane-feedback-relay.workers.dev/sydsvenskan.json`
- `https://trmnl.diane-feedback-relay.workers.dev/hn.json` (Hacker News top 30, held for 30 minutes)
- `https://trmnl.diane-feedback-relay.workers.dev/las` (`/las/hn`, `/las/dn`, `/las/syd`)
- `https://trmnl.diane-feedback-relay.workers.dev/healthz`

The mini serves the same paths on `http://127.0.0.1:8787` for local checks.

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
`bin/qr-svg HTTPS://TRMNL.DIANE-FEEDBACK-RELAY.WORKERS.DEV/LAS/HN`, which prints
the inline SVG used in the templates. Bookmarking `/las` works too.

The TRMNL X cards reserve up to five lines for the ingress. The older OG layout
keeps its larger type and shorter four-story list.

## Runtime on the Mac mini

The user launch agent `com.tim.trmnl-frontpage` runs `server.mjs` on
`127.0.0.1:8787`. Logs live in `/Users/tim/Library/Logs/trmnl-frontpage.log`;
cached editions live in `/Users/tim/Library/Caches/trmnl-frontpages/`.

## Publishing

After every refresh the mini PUTs each changed JSON edition and `/las` page to the
Worker in `../frontpage-worker` (Cloudflare account tkilaker@gmail.com, free plan).
A Durable Object keeps the latest payloads, so the screens keep the last edition
when the mini is off and nothing at home has to be reachable. The publish token
lives in `~/.config/trmnl-frontpage/publish-token` on the mini (0600) and as the
Worker secret `PUBLISH_TOKEN`. Deploy the Worker with `npx wrangler deploy` in
`../frontpage-worker`.

`/healthz` on the Worker returns 503 when DN or Sydsvenskan has not been published
for 30 minutes, which means the mini or its service stopped. Uptime Kuma on the NAS
(monitor "TRMNL Worker (mini publishing)") checks it and mails on failure.

The workers.dev subdomain `diane-feedback-relay` is shared with the Diane feedback
relay and is hardcoded in the Diane app, so it cannot be renamed.

## Usage

The Worker keeps anonymous daily counters (no IPs) of screen polls and
reading-page views. DN and Sydsvenskan are published recipes; Tim's own instances
set the form field `reader` to `tim`, so `poll:<feed>:tim` is Tim and `poll:<feed>`
is everyone else (from 2026-10-09). HN is not published.

```sh
node ~/dev/trmnl-recipes/frontpage-snapshot/stats.mjs   # on the mini
```

## Verification

Run this after parser or layout changes:

```sh
SNAPSHOT_BASE_URL=https://trmnl.diane-feedback-relay.workers.dev \
  node /Users/tim/dev/trmnl-recipes/frontpage-snapshot/validate-snapshot.mjs
```

It checks the seven stories that can be shown on each full-screen display:
title, meaningful description, topic, non-ad status, image URL and that every
image endpoint returns an image response. After that, force a TRMNL data refresh
and inspect both `markup_full` screenshots.
