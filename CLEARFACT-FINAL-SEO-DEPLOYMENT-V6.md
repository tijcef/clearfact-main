# ClearFact V6 — Final SEO, Homepage and AdSense Hardening

## What V6 guarantees in code

- Every published WordPress `/post/...` article is eligible for indexing and inclusion in `sitemap.xml`.
- Indexing does not depend on word count, excerpt, citation, heading count or AdSense eligibility.
- `/admin`, `/article`, `/auth`, `/contributor`, `/dashboard`, `/login`, `/search`, and `/api` (including nested paths) receive `X-Robots-Tag: noindex, nofollow`.
- The homepage is explicitly `index,follow,max-image-preview:large`.
- HEAD requests to public pages are normalized through the same renderer as GET requests.
- The homepage is not cached at the Worker/CDN layer during this recovery period, preventing a stale regional 404 from persisting.
- If TanStack unexpectedly returns 404/410 for `/`, V6 serves a real WordPress-backed latest-news homepage with HTTP 200. If WordPress is also unavailable it returns retryable HTTP 503 — never a false 404 for the site root.
- AdSense eligibility remains separate from indexing. `ads.txt` and the publisher ID are unchanged.

## Cloudflare action required

Code cannot override every account-level Cloudflare security product. In Cloudflare:

1. Security > Analytics > Events. Check the exact time of the failed Google Search Console live test. Look for Google-InspectionTool / verified bot requests and note the action/service.
2. Security > Security rules: put a verified-bot exception FIRST. Expression: `(cf.client.bot)`. Action: Skip > All remaining custom rules.
3. If using Super Bot Fight Mode, set Verified bots to Allow.
4. If using Free Bot Fight Mode and events show it challenging the Inspection Tool, turn Bot Fight Mode OFF while indexing is repaired. Free Bot Fight Mode cannot be bypassed by a custom Skip rule.
5. Purge Cloudflare cache completely after deploying V6.

## Post-deploy tests

Check in this order:

1. `https://clearfact.ng/` — must display homepage.
2. Response header should contain `x-clearfact-build: v6-seo-hardening`.
3. `https://clearfact.ng/sitemap.xml` — should contain every published article plus public static/category URLs.
4. `https://clearfact.ng/news-sitemap.xml` — only recent Google News eligible stories.
5. `https://clearfact.ng/robots.txt` — must return HTTP 200.
6. `https://clearfact.ng/ads.txt` — must show `google.com, pub-8967021504063466, DIRECT, f08c47fec0942fa0`.
7. In Search Console, Test Live URL for `/`. Only request indexing after the live test reports the page can be indexed.

## Important

Do not create a rule that blocks verified search-engine bots. Do not make AdSense quality checks control article indexing.
