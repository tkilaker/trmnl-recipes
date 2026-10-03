# Hacker News Reading List

Top Hacker News stories for TRMNL, numbered, with a QR code that opens
`https://mini.tail899cb0.ts.net/las/hn` on the phone. That page lists the same
stories with links to the article and the HN comments.

Data comes from `/hn.json` in `../frontpage-snapshot`, which holds each top-12
snapshot for 30 minutes so the screen and the phone page agree. The page also
keeps the previous screen under "Förra skärmen".

Layouts: TRMNL X shows 12 stories in two columns, the original TRMNL shows 8.

Preview locally:

```sh
bin/poll-real hn-news
cd hn-news && trmnlp serve
```
