# Sydsvenskan News Recipe

Display the latest Swedish news from Sydsvenskan newspaper on your TRMNL e-ink display with clean article listings, descriptions, and real-time updates.

**Author:** Tim Kilåker

## Features

- **Official branding** - Sydsvenskan's iconic knight logo in full layout
- **Editorial front page** - A main story with a longer ingress, plus supporting stories
- **Full refresh timestamp** - Shows `YYYY-MM-DD HH:MM` so stale updates are obvious
- **Automatic numbering** - Clean numbered list with index markers
- **Two-layer edition** - Three latest stories, then a frozen editorial front-page selection
- **Swedish time formatting** - Displays timestamps in Europe/Stockholm timezone
- **Full-screen layout** - Optimized for full TRMNL display
- **E-ink optimized** - High contrast, clear typography perfect for e-ink displays

## Data Source

Tim's installed recipe polls the local front-page snapshot service described in
`../frontpage-snapshot/README.md`. It uses Sydsvenskan's own RSS feed only for
the three items marked `JUST NU`; the main image and remaining stories are
taken from the editorial front page. The source is refreshed every five minutes
and the editorial edition is frozen morning and afternoon.

The default polling URL in the public recipe can still be any RSS URL. The
transform accepts both RSS and snapshot JSON.

## Layout

The full-screen layout includes:
- TRMNL X: a photo-led main story and six supporting stories
- Original TRMNL: a photo-led main story and four supporting stories
- A Stockholm-local `HÄMTAD YYYY-MM-DD HH.MM` timestamp in the header
- Topic and, when supplied, story time on each supporting article
- A meaningful ingress for every displayed article

## Installation

This recipe is designed for TRMNL e-ink display users. You can use it in two ways:

### Option 1: Use on TRMNL (Recommended)

If this recipe is published to the TRMNL marketplace, simply add it to your display from the TRMNL dashboard.

### Option 2: Local Development & Custom Deployment

**Prerequisites:**
- **Ruby 3.x or higher** - [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/)
- **TRMNL account** - Sign up at [usetrmnl.com](https://usetrmnl.com)

**Steps:**

1. Install the TRMNL local development server:
```bash
gem install trmnl_preview
```

2. Navigate to this recipe directory:
```bash
cd sydsvenskan-news
```

3. Test locally:
```bash
trmnlp serve
```
   Open http://localhost:4567 in your browser to preview

4. Deploy to your TRMNL account:
```bash
trmnlp push
```
   This will create/update the plugin in your TRMNL account

## Local Development

The `.trmnlp.yml` file contains mock data for local testing with sample news articles.

## Troubleshooting

### No news showing
- Check that Sydsvenskan's RSS feed is accessible
- Verify your internet connection
- Check the TRMNL logs for any errors

### Wrong timezone
- The recipe uses `Europe/Stockholm` timezone
- Update timestamps are formatted in 24-hour format (YYYY-MM-DD HH:MM)
- Article timestamps show elapsed time: "(5m sedan)", "(3h sedan)", "(2d sedan)"

### Text cut off
- The main story intentionally reserves several lines for its headline and ingress
- Supporting stories are clamped to keep the front page stable

## Technical Details

- **Strategy:** Polling (RSS feeds)
- **Refresh:** 15 minutes
- **Template Engine:** Liquid
- **Styling:** TRMNL Framework CSS classes
- **Icon:** 512x512px Sydsvenskan official knight logo

## About

This is a custom TRMNL recipe that brings Swedish news from Sydsvenskan directly to your e-ink display. It's designed to provide a clean, newspaper-style reading experience with just the essential information.

## Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request!

## License

MIT License - see [LICENSE](../LICENSE) file for details

---

Created by Tim Kilåker | [TRMNL Recipes](https://github.com/timkilaker/trmnl-recipes)
