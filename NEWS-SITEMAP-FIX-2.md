# ClearFact News Sitemap Fix 2

This revision addresses a case where newly published stories could still be missing from `/news-sitemap.xml`.

Changes:
- Removed the internal `getArticleQuality(...).indexable` gate from the Google News sitemap.
- The News sitemap now includes every published WordPress post from the previous 48 hours that has a valid slug and publication date.
- Reduced edge caching for the News sitemap from 30 minutes / 24-hour stale to 5 minutes / 10-minute stale.
- Kept the Google News XML structure and existing direct Cloudflare server route.

After deployment:
1. Publish a new story.
2. Open `https://clearfact.ng/news-sitemap.xml`.
3. Confirm the story appears inside a `<url>` entry.
4. In Google Search Console, resubmit or re-open the existing News sitemap report.

Note: dependency packages are not bundled in this ZIP, so a local typecheck/build requires running `npm install` first.
