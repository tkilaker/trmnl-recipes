# Hacker News Reading List

Top Hacker News stories for TRMNL in the style of TRMNL's native Hacker News plugin, numbered, with a QR code that opens
`https://trmnl.diane-feedback-relay.workers.dev/las/hn` on the phone. That page lists the same
stories with links to the article and the HN comments.

Data comes from `/hn.json` in `../frontpage-snapshot`, which holds each top-12
snapshot for 30 minutes so the screen and the phone page agree. The page also
keeps the previous screen under "Förra skärmen".

Layouts: TRMNL X shows 24 stories in two columns, the original TRMNL shows 16. Columns are split in Liquid rather than by the framework overflow engine so the QR rail fits.

Preview locally:

```sh
bin/poll-real hn-news
cd hn-news && trmnlp serve
```
