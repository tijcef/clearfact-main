# ClearFact production handoff

This project is the corrected ClearFact News frontend and Cloudflare Worker.

## Before deployment

1. Copy `.env.example` to `.env` for local development and add the existing
   Supabase public values. Never commit `.env`.
2. Install dependencies with `npm install`.
3. Run the full verification gate:

   ```powershell
   npm run check
   ```

## Publish through the existing repository

Extract this archive, copy its contents into a clean clone of the existing
ClearFact repository, then run:

```powershell
git add .
git commit -m "Improve ClearFact speed, reliability and live ticker"
git push origin main
```

Use the existing Cloudflare project and production domain. Do not create a
second Worker or change the custom domain while deploying this update.

## Production checks

- Open `https://clearfact.ng/api/health`. It should return a JSON response with
  `"status":"ok"`.
- Open the homepage in a private browser window. The live ticker should load
  recent WordPress headlines and pause when hovered.
- Open a category, an article, `/sitemap.xml`, `/news-sitemap.xml`, and
  `/robots.txt`.
- Confirm that WordPress remains available at
  `https://cms.tijcef.org/wp-json/wp/v2/posts`.

The frontend now times out slow WordPress requests quickly, serves cached
content during short CMS outages, keeps old ticker bundles compatible, delays
advertising code until an ad is near the viewport, and caches public pages and
media at the edge.
