# ClearFact indexing recovery — 7 October 2026

This is a source-code patch, not a live deployment. The uploaded v6 project was reviewed. Live clearfact.ng could not be reached from this environment; the Search Console email does not identify affected URLs, dates or server logs. Therefore the exact production cause and every affected URL remain unconfirmed.

## Changes
- General sitemap requests now fetch only metadata, not full article bodies or editorial fields. Requests stop after the last page rather than speculatively fetching up to three unnecessary pages whose errors could discard a valid sitemap.
- News sitemap requests also omit full article content. UTC dates are requested and used for publication timestamps. Future, old, untitled and duplicate entries are excluded; the News sitemap is limited to 1,000 entries.
- Four independent article requests may run concurrently instead of a single server-wide queue, reducing cross-request waiting. Request deduplication remains.
- Worker cache keys are versioned, preventing this build from reading old v6 cached responses. Private utility pages are excluded from HTML caching.
- Background refresh failures are handled and logged.
- Homepage recovery also runs for SSR 5xx responses and thrown SSR exceptions, using actual published WordPress headlines when available. If WordPress itself is down, a real error is still returned.
- An interrupted HTML stream is no longer returned after its body has been consumed while attempting caching.
- The build marker is `v7-indexing-recovery`.
- `scripts/seo-check.mjs` checks all URLs discovered in both sitemaps, including HTTP status, noindex, redirects and article canonicals, and exits with failure when problems are found.

## Noindex assessment
Published /post/ pages already explicitly use index,follow in v6; no global article noindex bug was established. /admin, /article (editor/revision tools), /auth, /contributor, /dashboard, /login, /search and /api are intentionally excluded. The WordPress headless SEO guard also intentionally noindexes CMS HTML on cms.clearfact.ng to prevent duplicates; keep that protection. Missing pages and insufficiently populated categories are also intentionally noindex. These must not all be made indexable just to clear an alert. The sitemap's category policy follows the category page policy. Error pages can carry noindex; fixing the upstream error is the required remedy.

## Deploy
1. Extract this project and replace the corresponding source files in your existing ClearFact repository, preserving deployment secrets and environment variables. Do not upload the ZIP as a static website.
2. Run `npm ci`, `npm run typecheck`, `node scripts/seo-regression.mjs`, and `npm run build`.
3. Deploy the built Cloudflare Worker through your existing pipeline. For Wrangler deployment use `npx wrangler deploy --config dist/server/wrangler.json`, after reviewing the generated worker name, bindings and domain configuration. Do not deploy the unbuilt src/server.ts directly.
4. Purge Cloudflare's zone cache for clearfact.ng after deployment. Worker cache versioning bypasses old internal entries, but external cache rules can still hold old responses. Review any Cloudflare rule adding X-Robots-Tag or caching error pages.
5. Run `node scripts/seo-check.mjs https://clearfact.ng`. Resolve every FAIL before starting Search Console validation. Check that responses show X-ClearFact-Build: v7-indexing-recovery.
6. In Search Console > Indexing > Pages, open both reasons and inspect their example URLs. Run URL Inspection > Test live URL on affected public articles. Confirm HTTP 200, complete rendered article, correct canonical and indexing allowed.
7. Use Request indexing for a few important affected articles. Then click Validate fix on each issue after confirming the affected URLs are fixed. Do not validate intentional private/search exclusions as errors.
8. In Sitemaps, resubmit https://clearfact.ng/sitemap.xml and https://clearfact.ng/news-sitemap.xml. An empty News sitemap is expected when no qualifying reports were published within the last 48 hours; older reports remain in the general sitemap.

## If 5xx continues
Use Cloudflare Worker logs and WordPress hosting logs at the failing request time. Verify https://cms.clearfact.ng/wp-json/wp/v2/posts?per_page=1 returns JSON reliably. Check DNS, TLS, hosting resource limits, PHP errors and firewall challenges. A code patch cannot guarantee availability of the CMS host. /api/health only proves the Worker is running, not that the CMS is healthy.

## Verification
TypeScript and production build were checked; focused regression tests cover UTC publication time, filtering, deduplication, slim payloads and sitemap final-page termination. The modified server, News sitemap and sitemap route pass targeted ESLint checks. No live endpoint audit or Search Console validation was possible here. Successful deployment and HTTP 200 do not guarantee Google indexing.

Google references:
https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
https://developers.google.com/crawling/docs/troubleshooting/http-status-codes
https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
