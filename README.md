# Magdalena Lazarczyk

Animated React Router homepage prepared for GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The static GitHub Pages artifact is generated in `build/client`.

## Supported WordPress Blocks

The post page currently supports these mocked WordPress block shapes:

- `paragraph`: single text block.
- `columns`: multi-column text content.
- `quote`: right-aligned pull quote.
- `grid`: structured metadata/credits grid.
- `image`: single image block.
- `gallery`: multiple images in one row on desktop, stacked on mobile.

Post images open in an image preview gallery on click. The preview supports close, previous/next navigation, and keyboard controls: `Escape`, `ArrowLeft`, `ArrowRight`.

## GitHub Pages

This project is configured for:

```text
https://jakubkanna.github.io/magdalena-lazarczyk/
```

Deployment runs from `.github/workflows/deploy.yml` on pushes to `main`.

In the GitHub repository settings, set **Pages** source to **GitHub Actions**.
