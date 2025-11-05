# DN News Recipe

Display the latest Swedish news from Dagens Nyheter (DN) on your TRMNL e-ink display with clean article listings, descriptions, and real-time updates.

**Author:** Tim Kilåker

## Features

- **Official branding** - DN's iconic logo in full layout
- **Article descriptions** - Shows the first part of each news story, not just headlines
- **Elapsed time indicators** - Displays "(3h sedan)" directly in headlines
- **Update timestamps** - Shows when the feed was last refreshed
- **Automatic numbering** - Clean numbered list with index markers
- **Optimized display** - Shows top 10 news items
- **Real-time updates** - Fetches from DN RSS feed every 30 minutes
- **Swedish time formatting** - Displays timestamps in Europe/Stockholm timezone
- **Full-screen layout** - Optimized for full TRMNL display
- **E-ink optimized** - High contrast, clear typography perfect for e-ink displays

## Data Source

This recipe fetches data from DN's main RSS feed:

- **Latest News:** `https://www.dn.se/rss/`

Refresh rate: Every 30 minutes

## Layout

The full-screen layout includes:
- 10 latest news items with full descriptions
- DN's official logo and branding
- "Uppdaterad YYYY-MM-DD HH:MM" timestamp showing last refresh
- Each article displays: numbered index, headline with elapsed time, and description (2-line clamp)

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
cd dn-news
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
- Check that DN's RSS feed is accessible
- Verify your internet connection
- Check the TRMNL logs for any errors

### Wrong timezone
- The recipe uses `Europe/Stockholm` timezone
- Update timestamps are formatted in 24-hour format (YYYY-MM-DD HH:MM)
- Article timestamps show elapsed time: "(5m sedan)", "(3h sedan)", "(2d sedan)"

### Items cut off
- Descriptions automatically clamp to 2 lines to ensure proper display
- The layout is optimized to show 10 items comfortably within the display height

## Technical Details

- **Strategy:** Polling (RSS feeds)
- **Refresh:** 30 minutes
- **Template Engine:** Liquid
- **Styling:** TRMNL Framework CSS classes
- **Icon:** 180x180px DN official logo

## About

This is a custom TRMNL recipe that brings Swedish news from Dagens Nyheter directly to your e-ink display. It's designed to provide a clean, newspaper-style reading experience with just the essential information.

## Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request!

## License

MIT License - see [LICENSE](../LICENSE) file for details

---

Created by Tim Kilåker | [TRMNL Recipes](https://github.com/timkilaker/trmnl-recipes)
