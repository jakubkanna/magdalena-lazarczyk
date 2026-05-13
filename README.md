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

## Hosting On WordPress Hosting

This app builds to static files, so it can be hosted on standard WordPress/PHP hosting without running Node on the server. Node is only needed locally or in CI to run the build.

Recommended setup: host the React app in a subdirectory, for example:

```text
https://example.com/magdalena-lazarczyk/
```

The project is currently configured for that path in:

- `vite.config.ts`: `base: "/magdalena-lazarczyk/"`
- `react-router.config.ts`: `basename: "/magdalena-lazarczyk/"`

If the final URL is different, update both values before building. For example, for `https://example.com/portfolio/`, use `/portfolio/`. For the domain root, use `/`.

Build locally:

```bash
npm install
npm run build
```

Upload the contents of `build/client` to the matching folder on the hosting account, for example:

```text
public_html/magdalena-lazarczyk/
```

For client-side routes such as `/post/example`, add an `.htaccess` file in the same uploaded app folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /magdalena-lazarczyk/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /magdalena-lazarczyk/index.html [L]
</IfModule>
```

If using a different folder, update `RewriteBase` and the `RewriteRule` target to match it. Do not replace the main WordPress `.htaccess` unless the app is intentionally hosted at the domain root.

To use WordPress as the editable CMS for bio/contact content, set this before building:

```bash
VITE_WORDPRESS_API_URL=https://example.com npm run build
```

Then create a WordPress page with slug `bio` and expose the expected ACF fields through the REST API. If that environment variable is not set, the app uses `app/data/wordpress-site-content.json` as fallback content.

## Supported WordPress Blocks

The post page currently supports these mocked WordPress block shapes:

- `paragraph`: single text block.
- `columns`: multi-column text content.
- `quote`: right-aligned pull quote.
- `grid`: structured metadata/credits grid.
- `image`: single image block.
- `gallery`: multiple images in one row on desktop, stacked on mobile.

Post images open in an image preview gallery on click. The preview supports close, previous/next navigation, and keyboard controls: `Escape`, `ArrowLeft`, `ArrowRight`.

## Editable Bio And Contact Content

Bio and contact content is loaded through `app/data/site-content.ts`. In development it falls back to `app/data/wordpress-site-content.json`; in WordPress-backed environments set `VITE_WORDPRESS_API_URL` and expose a WordPress page with slug `bio` whose ACF fields match either the nested `bio`/`contact` shape or the flat field names used in that loader.

## GitHub Pages

This project is configured for:

```text
https://jakubkanna.github.io/magdalena-lazarczyk/
```

Deployment runs from `.github/workflows/deploy.yml` on pushes to `main`.

In the GitHub repository settings, set **Pages** source to **GitHub Actions**.
