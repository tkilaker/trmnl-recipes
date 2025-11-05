# Sydsvenskan News Recipe

Display the latest Swedish news from Sydsvenskan newspaper on your TRMNL e-ink display with clean article listings, descriptions, and real-time updates.

## Features

- **Official branding** - Sydsvenskan's iconic knight logo in full layout
- **Article descriptions** - Shows the first part of each news story, not just headlines
- **Elapsed time indicators** - Displays "(3h sedan)" directly in headlines
- **Update timestamps** - Shows when the feed was last refreshed
- **Automatic numbering** - Clean numbered list with index markers
- **Configurable display** - Choose how many items to show (1-15)
- **Real-time updates** - Fetches from Sydsvenskan RSS feed every 30 minutes
- **Swedish time formatting** - Displays timestamps in Europe/Stockholm timezone
- **Full-screen layout** - Optimized for full TRMNL display
- **E-ink optimized** - High contrast, clear typography perfect for e-ink displays

## Configuration Options

### Number of news items
- **Type:** Integer (1-15)
- **Default:** 10
- **Description:** How many news articles to display

## Data Source

This recipe fetches data from Sydsvenskan's main RSS feed:

- **Latest News:** `https://www.sydsvenskan.se/feeds/feed.xml`

Refresh rate: Every 30 minutes

## Layout

The full-screen layout includes:
- Up to 15 news items with full descriptions
- Sydsvenskan's official knight logo and branding
- "Uppdaterad YYYY-MM-DD HH:MM" timestamp showing last refresh
- Each article displays: numbered index, headline with elapsed time, and description (2-line clamp)

## Installation

### Prerequisites

- **Ruby 3.x or higher** - [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/)

### Steps

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

4. Push to TRMNL:
```bash
trmnlp push
```

## Local Development

The `.trmnlp.yml` file contains mock data for local testing. You can modify the `custom_fields` section to test different configurations:

```yaml
custom_fields:
  news_count: 8
```

## Troubleshooting

### No news showing
- Check that Sydsvenskan's RSS feed is accessible
- Verify your internet connection
- Check the TRMNL logs for any errors

### Wrong timezone
- The recipe uses `Europe/Stockholm` timezone
- Update timestamps are formatted in 24-hour format (YYYY-MM-DD HH:MM)
- Article timestamps show elapsed time: "(5m sedan)", "(3h sedan)", "(2d sedan)"

### Items cut off
- Descriptions automatically clamp to 2 lines to ensure proper display
- Adjust `news_count` to show fewer items if needed

## Technical Details

- **Strategy:** Polling (RSS feeds)
- **Refresh:** 30 minutes
- **Template Engine:** Liquid
- **Styling:** TRMNL Framework CSS classes
- **Icon:** 512x512px Sydsvenskan official knight logo

## Contributing

Found a bug or have a suggestion? Please open an issue or submit a pull request!

## License

MIT License - see [LICENSE](../LICENSE) file for details
