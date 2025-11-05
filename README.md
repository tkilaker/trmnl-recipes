# TRMNL Recipes

A collection of TRMNL recipes (plugins) for e-ink displays, focused on Swedish content sources.

## Recipes

### ✅ Sydsvenskan News
Display the latest Swedish news from Sydsvenskan newspaper with article descriptions, elapsed time indicators, and official branding.

[→ View Recipe Details](./sydsvenskan-news/README.md)

### ✅ Swedish Text-TV
Display classic SVT Text-TV (teletext) pages in authentic monospace styling with configurable page numbers and subpage support.

[→ View Recipe Details](./swedish-texttv/README.md)

## Getting Started

### Prerequisites

**Required:**
- **Ruby 3.x or higher** - [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/)

**Optional (for PNG rendering):**
- Firefox
- ImageMagick

Once Ruby is installed, install the TRMNL local development server:

```bash
# Install trmnl_preview (provides the trmnlp command)
gem install trmnl_preview
```

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/yourusername/trmnl-recipes.git
cd trmnl-recipes
```

2. Navigate to a recipe directory:
```bash
cd sydsvenskan-news
# or
cd swedish-texttv
```

3. Start the development server:
```bash
trmnlp serve
```

4. Open your browser to view the recipe at the provided local URL

### Publishing to TRMNL

1. Ensure you're in a recipe directory
2. Push to TRMNL:
```bash
trmnlp push
```

3. Follow the prompts to authenticate and publish your recipe

## Recipe Structure

Each recipe follows this structure:

```
recipe-name/
├── README.md              # Recipe documentation
├── icon.png              # Plugin icon (512x512px)
├── .trmnlp.yml           # Local development config
└── src/
    ├── settings.yml      # Plugin configuration
    └── *.liquid          # Layout templates (full, half_vertical, etc.)
```

## Resources

- [TRMNL Framework Documentation](https://usetrmnl.com/framework)
- [trmnlp GitHub Repository](https://github.com/usetrmnl/trmnlp)
- [Liquid Template Language](https://shopify.github.io/liquid/)
- [Recipe Best Practices](https://help.usetrmnl.com/en/articles/11395668)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details
