# ClearFact Sitemap Fix 3

This revision fixes the main reason newly published stories could be live on ClearFact but absent from `/sitemap.xml` and marked `noindex`.

## What changed

- Search indexability no longer depends on a manual excerpt, external citation, or completed `clearfact_editorial` metadata.
- A normal article is indexable when it has a usable title, basic article structure, and at least 220 words.
- AdSense eligibility remains stricter: at least 450 words, a useful excerpt, and an evidence/original-value signal are still required.
- `/news-sitemap.xml` now includes only recent stories that are also indexable, preventing sitemap/robots conflicts.
- News-sitemap pagination now safely handles WordPress's `rest_post_invalid_page_number` response.
- Main `/sitemap.xml` edge caching is reduced to 5 minutes with a 10-minute stale window so new stories appear much sooner after publication.

## After deployment

1. Purge the Cloudflare cache.
2. Open `/sitemap.xml` in a private browser window and confirm recent published stories appear.
3. Open `/news-sitemap.xml` and confirm articles from the previous 48 hours appear.
4. Open one recent article and inspect the robots meta tag; a normal substantive story should say `index,follow,max-image-preview:large`.
5. Resubmit both sitemap URLs in Google Search Console.
