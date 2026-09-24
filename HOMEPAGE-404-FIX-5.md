# ClearFact V5 — Homepage 404 fix

## Problem confirmed on 24 September 2026

Google Search Console's live URL test reported `https://clearfact.ng/` as `404 Not Found`, while public article URLs continued to render.

The repository still contained a legacy root `index.html` from an older SPA setup. That file referenced `/src/main.tsx`, but `src/main.tsx` does not exist in this TanStack Start application. The application now uses TanStack Start SSR through `src/server.ts` and the file-based `/` route in `src/routes/index.tsx`.

Cloudflare's Vite plugin treats static assets specially. To prevent the legacy SPA shell/static-asset layer from taking precedence over the SSR homepage, V5:

1. Removes the stale root `index.html`.
2. Adds `assets.run_worker_first: ["/"]` to `wrangler.jsonc`, so the homepage request is handled by the SSR Worker first.
3. Preserves the V4 indexing rules: every published `/post/...` article is indexable and included in the main sitemap, while `/admin`, `/article`, `/auth`, `/contributor`, `/dashboard`, `/login`, `/search`, and `/api` receive `X-Robots-Tag: noindex, nofollow`.
4. Preserves the separate AdSense quality gate. Ad eligibility does not control article indexability.

## After deployment

1. Purge the Cloudflare cache.
2. Open `https://clearfact.ng/` in a private/incognito browser. It must load normally.
3. Run Search Console > URL Inspection > Test Live URL on `https://clearfact.ng/`.
4. Confirm Page availability is no longer `Not found (404)` and that the page is indexable.
5. Only then click Request Indexing.
6. Re-check `https://clearfact.ng/sitemap.xml`, `https://clearfact.ng/news-sitemap.xml`, `https://clearfact.ng/robots.txt`, and `https://clearfact.ng/ads.txt`.
