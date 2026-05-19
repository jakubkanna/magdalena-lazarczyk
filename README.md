# Magdalena Lazarczyk

Animated React Router homepage prepared for GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Local WordPress Backend

This repository includes a fresh local WordPress container for headless CMS work.

Start WordPress and MySQL:

```bash
docker compose up -d
```

WordPress will be available at:

```text
http://localhost:8081
```

Complete the WordPress installer in the browser, then use the REST API from the React app with:

```bash
VITE_WORDPRESS_API_URL=http://localhost:8081 npm run dev
```

In local development the frontend defaults to `http://localhost:8081` when `VITE_WORDPRESS_API_URL` is not set.

The containers use Docker volumes named `magdalena-lazarczyk_wordpress_data` and `magdalena-lazarczyk_wordpress_db_data`, so CMS files, uploads, plugins, and database content persist between restarts.

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

Set the WordPress REST API base URL before building for production:

```bash
VITE_WORDPRESS_API_URL=https://example.com npm run build
```

The backend should expose:

- pages with slugs `bio` and `contact`; their WordPress block content is rendered in the info panels
- project posts assigned to the `Teatr`, `Sztuka`, or `Warsztaty` categories
- featured images for project cards and project hero images
- ACF fields on posts for `project_venue`, `project_place`, `project_year`, `project_credits`, `project_gallery`, and `project_external_url`
- ACF fields on the `contact` page for `contact_email`, `contact_phone`, and `contact_instagram_url`

## WordPress Blocks

Project, bio, and contact body content is loaded from WordPress block HTML via the REST API. Project images and gallery images inside post blocks open in an image preview gallery on click. The preview supports close, previous/next navigation, and keyboard controls: `Escape`, `ArrowLeft`, `ArrowRight`.

## Editable Bio And Contact Content

Bio and contact content is loaded through `app/data/site-content.ts` from WordPress pages. Edit those pages with normal WordPress blocks.

## GitHub Pages

This project is configured for:

```text
https://jakubkanna.github.io/magdalena-lazarczyk/
```

Deployment runs from `.github/workflows/deploy.yml` on pushes to `main`.

In the GitHub repository settings, set **Pages** source to **GitHub Actions**.
