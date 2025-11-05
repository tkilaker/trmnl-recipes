# Sydsvenskan News Recipe

Display Swedish news from Sydsvenskan newspaper on your TRMNL e-ink display in a clean, two-column layout.

## Features

- **Dual-column layout** - Latest news on the left, sport or additional latest news on the right
- **Configurable display** - Choose how many items to show and what appears in the right column
- **Real-time updates** - Fetches from Sydsvenskan RSS feeds every 30 minutes
- **Swedish time formatting** - Displays timestamps in Europe/Stockholm timezone
- **All layout sizes** - Supports full, half vertical, half horizontal, and quadrant layouts
- **E-ink optimized** - High contrast, clear typography perfect for e-ink displays

## Configuration Options

### Number of news items per column
- **Type:** Integer (1-10)
- **Default:** 10
- **Description:** How many news articles to display in each column

### Right column content
- **Type:** Select (Sport / Latest News)
- **Default:** Sport
- **Description:** Choose whether to display sport news or duplicate latest news in the right column

## Data Sources

This recipe fetches data from Sydsvenskan's RSS feeds:

1. **Latest News:** `https://sydsvenskan.se/feeds/feed.xml`
2. **Sport News:** `https://sydsvenskan.se/feeds/section/sport`

Refresh rate: Every 30 minutes

## Layout Examples

### Full Layout
```
┌─────────────────────────────────────────┐
│ Sydsvenskan                      08:30  │
├─────────────────┬───────────────────────┤
│ SENASTE NYTT    │ SPORT                 │
│                 │                       │
│ • News Item 1   │ • Sport Item 1        │
│   08:30         │   09:00               │
│                 │                       │
│ • News Item 2   │ • Sport Item 2        │
│   08:15         │   08:45               │
│                 │                       │
│ • News Item 3   │ • Sport Item 3        │
│   08:00         │   08:30               │
│                 │                       │
│ ...             │ ...                   │
└─────────────────┴───────────────────────┘
```

### Half Vertical Layout
```
┌──────────────────┐
│ Sydsvenskan 8:30 │
├──────────────────┤
│ SENASTE NYTT     │
│                  │
│ • News Item 1    │
│   08:30          │
│                  │
│ • News Item 2    │
│   08:15          │
│                  │
│ ...              │
└──────────────────┘
```

### Half Horizontal Layout
```
┌────────────────────────────┐
│ Sydsvenskan          08:30 │
├────────────────────────────┤
│ • News Item 1         8:30 │
│ • News Item 2         8:15 │
│ • News Item 3         8:00 │
└────────────────────────────┘
```

### Quadrant Layout
```
┌─────────────┐
│ Sydsvenskan │
├─────────────┤
│ • Item 1    │
│ • Item 2    │
│ • Item 3    │
│ • Item 4    │
└─────────────┘
```

## Installation

### Prerequisites

- **Ruby 3.x or higher** - [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/)

### Steps

1. Install the TRMNL local development server:
```bash
gem install trmnl_preview
```
   (This installs the `trmnlp` command)

2. Navigate to this recipe directory:
```bash
cd sydsvenskan-news
```

3. Test locally:
```bash
trmnlp serve
```

4. Push to TRMNL:
```bash
trmnlp push
```

## Local Development

The `.trmnlp.yml` file contains mock data for local testing. You can modify the `custom_fields` section to test different configurations:

```yaml
custom_fields:
  news_count: 8
  right_column: sport  # or "latest"
```

## Troubleshooting

### No news showing
- Check that Sydsvenskan's RSS feeds are accessible
- Verify your internet connection
- Check the TRMNL logs for any errors

### Wrong timezone
- The recipe uses `Europe/Stockholm` timezone
- Times are formatted in 24-hour format (HH:MM)

### Items cut off
- Titles automatically truncate to fit:
  - Full/Half Vertical: 2 lines per title
  - Half Horizontal/Quadrant: 1 line per title
- Adjust `news_count` to show fewer items

## Technical Details

- **Strategy:** Polling (RSS feeds)
- **Refresh:** 30 minutes
- **Template Engine:** Liquid
- **Styling:** TRMNL Framework CSS classes

## Contributing

Found a bug or have a suggestion? Please open an issue or submit a pull request!

## License

MIT License - see [LICENSE](../LICENSE) file for details
