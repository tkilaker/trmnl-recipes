# Swedish Text-TV Recipe

Display classic SVT Text-TV (teletext) pages on your TRMNL e-ink display with authentic monospace styling.

## Features

- **Authentic Text-TV styling** - Monospace font with classic yellow-on-black color scheme
- **Configurable pages** - Display any Text-TV page from 100-899
- **Subpage support** - Optional display of subpages when available
- **Real-time updates** - Fetches from TextTV.nu API every 15 minutes
- **Swedish time formatting** - Displays in Europe/Stockholm timezone
- **All layout sizes** - Supports full, half vertical, half horizontal, and quadrant layouts
- **E-ink optimized** - High contrast display perfect for e-ink screens

## Configuration Options

### Text-TV Page Number
- **Type:** Integer (100-899)
- **Default:** 100
- **Description:** Which Text-TV page to display

Common pages:
- 100 - Table of contents
- 101 - Sport overview
- 200 - Swedish news
- 300 - International news
- 400 - Culture & entertainment
- 500 - Economy
- 600 - Weather
- 700 - Sport results

### Show subpages
- **Type:** Boolean
- **Default:** false
- **Description:** Display subpages if available (may require additional API calls)

## Data Source

This recipe fetches data from the **TextTV.nu API**:

- Base URL: `https://api.texttv.nu/api/get/{page}`
- Query params: `?app=trmnl-texttv&includePlainTextContent=1`
- Returns JSON with page content

Example: `https://api.texttv.nu/api/get/100?app=trmnl-texttv&includePlainTextContent=1`

Refresh rate: Every 15 minutes

## Layout Examples

### Full Layout
```
┌───────────────────────────────────────────┐
│ Text-TV 100                        08:30  │
├───────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐ │
│ │ 100      SVT Text-TV    2025-11-05   │ │
│ │                                       │ │
│ │            INNEHÅLL                   │ │
│ │                                       │ │
│ │ 101  Sport och idrott                │ │
│ │ 200  Inrikes nyheter                 │ │
│ │ 300  Utrikes nyheter                 │ │
│ │ 400  Kultur och nöje                 │ │
│ │ 500  Ekonomi                         │ │
│ │ 600  Väder                           │ │
│ │ 700  Sport resultat                  │ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

### Half Vertical Layout
```
┌────────────────────┐
│ Text-TV 100  08:30 │
├────────────────────┤
│ ┌────────────────┐ │
│ │ 100  SVT Text  │ │
│ │                │ │
│ │ INNEHÅLL       │ │
│ │                │ │
│ │ 101  Sport     │ │
│ │ 200  Inrikes   │ │
│ │ 300  Utrikes   │ │
│ │ ...            │ │
│ └────────────────┘ │
└────────────────────┘
```

### Half Horizontal Layout
```
┌──────────────────────────────┐
│ Text-TV 100            08:30 │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ 100  INNEHÅLL            │ │
│ │ 101  Sport               │ │
│ │ 200  Inrikes             │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Quadrant Layout
```
┌──────────────┐
│ Text-TV 100  │
├──────────────┤
│ ┌──────────┐ │
│ │ 100      │ │
│ │ INNEHÅLL │ │
│ │ 101      │ │
│ └──────────┘ │
└──────────────┘
```

## Installation

1. Ensure you have `trmnlp` installed:
```bash
gem install trmnlp
```

2. Navigate to this recipe directory:
```bash
cd swedish-texttv
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

The `.trmnlp.yml` file contains mock data for local testing. You can modify the `custom_fields` section to test different page numbers:

```yaml
custom_fields:
  page_number: 100  # Try 200, 300, 700, etc.
  show_subpages: false
```

## Troubleshooting

### No content showing
- Check that the TextTV.nu API is accessible
- Verify your internet connection
- Try a different page number (100-899)
- Check the TRMNL logs for any errors

### Page not found
- Not all page numbers are active
- Common active pages: 100, 200, 300, 400, 500, 600, 700
- Check [texttv.nu](https://texttv.nu) to see which pages are available

### Content is truncated
- Smaller layouts (half horizontal, quadrant) show fewer lines
- This is intentional to fit the limited space
- Use full or half vertical layout for complete content

### Styling issues
- The monospace font and yellow-on-black colors are inline styles
- If styling doesn't appear correctly, check that inline styles are supported
- Background color (black) and text color (yellow) mimic classic Text-TV

## API Information

The TextTV.nu API is a free, public API for accessing SVT Text-TV content:

- Documentation: Check [texttv.nu](https://texttv.nu) for API details
- Rate limiting: Be respectful with API calls (15-minute refresh is recommended)
- `app` parameter: Identifies your app to the API (use `trmnl-texttv`)
- `includePlainTextContent=1`: Returns plain text version of content

### API Response Format

```json
{
  "num": 100,
  "title": "Innehåll",
  "content": "<div>HTML content</div>",
  "content_plain": "Plain text version..."
}
```

The recipe uses `content_plain` for authentic monospace display.

## Technical Details

- **Strategy:** Polling (API)
- **Refresh:** 15 minutes
- **Template Engine:** Liquid
- **Styling:** Inline CSS for monospace and colors

## Popular Pages

- **100** - Table of contents
- **101** - Sport headlines
- **200** - Swedish news
- **300** - International news
- **400** - Culture
- **500** - Economy/Business
- **600** - Weather forecasts
- **700** - Sport results and schedules
- **800** - TV guide

## Contributing

Found a bug or have a suggestion? Please open an issue or submit a pull request!

## License

MIT License - see [LICENSE](../LICENSE) file for details

## Credits

This recipe uses the excellent [TextTV.nu](https://texttv.nu) API for accessing SVT Text-TV content.
