# ClearFact News Sitemap Fix

This package hardens `https://clearfact.ng/news-sitemap.xml` so it is served directly by the Cloudflare edge worker as well as through the TanStack route.

## What changed

- Shared News sitemap generation moved to `src/lib/news-sitemap.ts`.
- `src/routes/news-sitemap[.]xml.ts` still exposes the normal TanStack route.
- `src/server.ts` now intercepts `/news-sitemap.xml` before framework page routing, preventing a framework route miss from becoming a 404.
- GET and HEAD are supported. Other methods return 405.
- The sitemap contains only indexable stories published in the preceding 48 hours.
- If there are no eligible recent stories, the endpoint still returns HTTP 200 with a valid empty News sitemap.
- If WordPress is temporarily unavailable, the endpoint returns 503 rather than a misleading 404.

## After deployment

1. Open `https://clearfact.ng/news-sitemap.xml` in a private browser window.
2. Confirm it returns XML and not a 404 page.
3. If no article has been published in the previous 48 hours, an empty `<urlset>` is normal.
4. Publish or verify a recent indexable article, then confirm it appears in the News sitemap.
5. In Google Search Console, resubmit `https://clearfact.ng/news-sitemap.xml`.
