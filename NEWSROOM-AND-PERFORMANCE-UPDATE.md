# ClearFact newsroom and performance update — 16 October 2026

## Delivery status
Source changes are complete and production builds and local regression checks pass. This archive is not proof of a live deployment. The WordPress admin opened at a login screen, and no authenticated hosting session or repository is connected. No production settings, categories, posts or files have been changed.

## Changes
- New **ClearFact Newsroom Structure** plugin: a Verification & Publishing panel with editorial status, content type, sponsor name/disclosure, private evidence notes, public corrections and an internal reviewer/time record. Editors/admins can record verification; authors cannot grant themselves a verified status through this panel. Public REST exposes an explicit allowlist only. No article is labelled verified by default.
- Posts → **Category Guide** lists the real WordPress categories, slugs, parent relationships and counts. It recommends subject categories and tags, while separating sponsorship from verification. It does not create, delete, merge or rename terms. Existing Opinion / Commentary and Public Conscience integration remains intact.
- Existing Editorial Quality plugin updated to 1.1.0: removes misleading noindex advice and mirrors existing frontend index/ad criteria. Published posts with a slug remain indexable. Ad eligibility still requires adequate article structure, length, excerpt, title and evidence. No frontend thresholds changed.
- Paid-content disclosure appears on articles and WordPress-powered homepage, category, search and author listings. Recognises the new REST metadata and legacy ACF sponsorship/category signals. Missing optional metadata does not break old articles. Corrections and explicit verification status appear on the full article. React escapes disclosure text.
- Homepage starts the video/category branch alongside the news branch, reducing the sequential request delay. It still renders news and videos on the server.
- WordPress image variants are exposed through responsive srcset across the major reading/listing pages. Browsers can download smaller real variants on mobile. Missing image-size metadata falls back to the existing image URL. Existing eager hero and lazy card behaviour remains.
- Bounded request/detail caches retain request deduplication and prevent unbounded growth as users search and navigate. Existing server/edge caching and its invalidation behaviour are unchanged.

## Intentionally preserved
AdSense loader, ad slots and eligibility rules; ads.txt; analytics; canonical post paths; category slugs/routing; robots; normal and news sitemap implementation; headless SEO guard; WordPress REST proxy and media paths; contributor functionality; standard WordPress author/status/scheduling/visibility controls; existing ACF fields and plugins. This update makes no promises about Google indexing speed or ad revenue.

## Install and deploy in order
1. Back up the live WordPress database/plugins and retain the currently deployed frontend release. Confirm this archive matches the current frontend source before replacing the deployment; if production has newer changes, merge these changes into that source first.
2. WordPress → Plugins → Add New → Upload: install **backend-tools/clearfact-newsroom-structure.zip**, activate it. Update **clearfact-editorial-quality.zip** in the same folder if that plugin is already installed, or install it if absent. Keep the SEO guard and other existing plugins active. No database migration or category cleanup script is needed. Do not run `remove-empty-categories.php` for this update.
3. Check a draft in the existing WordPress editor. Confirm the new panel appears, the Category Guide reflects current terms and author/featured image/excerpt/scheduling still work. Fill only evidence-backed statuses; sponsor name and disclosure should be completed for paid content. Missing sponsorship details warn the editor but do not change the existing publishing workflow or silently unpublish articles.
4. Confirm a public REST post contains `clearfact_publishing`, without private notes or reviewer identity. Check the editor panel using both editor and author roles. Existing ACF sponsorship fields remain authoritative legacy inputs and are not overwritten by the new panel; remove a legacy flag explicitly if a post is no longer sponsored.
5. In the existing frontend hosting project, retain its current environment variables/secrets and normal Cloudflare/Vite deployment configuration. Run `npm ci`, `npm run typecheck`, the four regression scripts below, then `npm run build`. Deploy through the existing pipeline. Do not upload only dist/client: this application also uses a server Worker.
6. Purge the affected HTML/API caches using the existing hosting tools. Check an ordinary article, a sponsored article, Public Conscience, search, comments, mobile navigation and ad slots. Inspect actual ad delivery in an eligible article; do not click ads during QA.
7. Run `node scripts/seo-check.mjs https://clearfact.ng` after deployment. Check robots, both sitemaps and canonical URLs. Compare mobile Lighthouse/PageSpeed results before and after deployment, including LCP, INP and CLS. Origin response time, installed WordPress plugins, image availability, hosting and third-party ads can still affect live performance.

## Validation completed in this workspace
- `npm run typecheck`: passed.
- `npm run build`: production client and Worker builds passed.
- `node scripts/reader-regression.mjs`: passed.
- `node scripts/seo-regression.mjs`: passed.
- `node scripts/video-regression.mjs`: passed.
- `node scripts/newsroom-regression.mjs`: passed; covers responsive image variants, unchanged ad/index decisions, shared requests/cache, sponsorship compatibility, escaped disclosures and explicit verification.
- PHP syntax parsed successfully for both changed/new plugins with php-parser. A PHP runtime/WordPress integration test was not available in this workspace.
- Byte comparison against the input archive confirms ad component, ads.txt, server, news sitemap helper, category navigation, robots, sitemaps and SEO guard are unchanged.
- Live authenticated admin, deployment, visual browser QA, mobile speed measurements and real ad delivery remain pending. No claim of a flawless live deployment is made.

## Rollback
Redeploy the previous frontend build if needed. Deactivate the new Newsroom Structure plugin to remove its panels and REST field; it retains its metadata and does not alter posts, taxonomies or ad/index settings. Restore the earlier Editorial Quality plugin if required. Optional public fields are backward compatible, so plugin-first deployment and frontend rollback remain safe.
