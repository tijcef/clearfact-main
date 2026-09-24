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
git commit -m "Repair ClearFact indexing, ads compliance and page performance"
git push origin main
```

Use the existing Cloudflare project and production domain. Do not create a
second Worker or change the custom domain while deploying this update. Purge
the existing Cloudflare cache after the deployment so corrected status codes,
canonical tags and reduced HTML payloads are served immediately.

## Required WordPress quality/SEO plugins

Two plugins in `backend-tools/` are part of this AdSense/search-quality update:

1. Upload and activate `clearfact-headless-seo-guard.zip`. This prevents `cms.clearfact.ng` from behaving like a second public copy of the newsroom, disables the CMS sitemap and consolidates normal WordPress post/category/author URLs to `clearfact.ng`. The REST API, media, wp-admin and previews remain available.
2. Upload and activate `clearfact-editorial-quality.zip`. This adds the **ClearFact Editorial Value** panel to WordPress posts and exposes a safe `clearfact_editorial` REST field used by the frontend quality gate.
3. Edit important published stories and complete the editorial-value panel honestly. Add direct links to primary records or credible source material where appropriate, and explain what ClearFact independently added when the story contains original reporting, document/data analysis or fact checking.
4. Purge WordPress and Cloudflare caches after activating the plugins and after updating a batch of stories.

The public frontend remains available even if the editorial-quality plugin is temporarily absent. In that case it falls back to article structure, excerpt, word count and visible source links, but original-reporting metadata will not be available.

## WordPress category cleanup

From the existing WordPress installation, run the included one-time taxonomy
cleanup after deploying the frontend:

```bash
wp eval-file backend-tools/remove-empty-categories.php
```

This keeps every top-level category and the Elections subcategory. Before it
deletes any other subcategory, it adds that subcategory's articles to the
closest surviving top-level category. No article is deleted. Purge the
WordPress/CDN cache after the command completes.

## Enable frontend comments

The public comment form uses the WordPress REST API. WordPress requires a
separate opt-in before anonymous REST comments are accepted; the normal
Discussion screen alone does not provide that opt-in.

1. In WordPress, open **Plugins → Add New Plugin → Upload Plugin**.
2. Upload `clearfact-rest-comments.zip` and activate **ClearFact REST Comments**. Replace version 1.0.0 if WordPress reports that the plugin already exists.
3. Open **Settings → Discussion** and confirm both **Comment author must fill out name and email** and **Users must be registered and logged in to comment** are unticked. The public form requires only a name and comment.
4. Keep **Comment must be manually approved** enabled if every new comment should wait for moderation.
5. Purge WordPress and Cloudflare caches, then submit a test comment from a live article.

The frontend now displays the real WordPress error when a submission fails and
correctly tells the reader when a successful comment is awaiting moderation.
An approved comment is added to the visible article discussion immediately from
the successful WordPress response instead of waiting for the 60-second comment cache.
Comment writes use a longer timeout than ordinary CMS reads because the live
WordPress origin may take several seconds to complete its spam and moderation checks.
Plugin version 1.1.0 also removes Email and Website from the native WordPress
comment form, keeping it consistent with the name-and-comment-only frontend.

## Author and brand trust signals

The public frontend uses the ClearFact production domain and `cms.clearfact.ng` only as its content API/media origin. Author pages prefer a substantive WordPress newsroom biography when one is available and otherwise fall back to a ClearFact-specific biography. Thin author profiles remain `noindex`. Keep each regular author biography factual, role-specific and focused on the writer's reporting background or beat.

## AdSense account checks

The code keeps the AdSense ownership meta tag and valid `ads.txt`, and it does not load ad units on the homepage, category archives or the Fact Check hub. Every genuinely published WordPress article remains indexable and belongs in the main sitemap. AdSense eligibility is intentionally separate and stricter: the script is loaded lazily only when a public article passes the ad-quality gate. Articles that do not yet qualify for ads remain indexable and readable; they simply do not request an ad unit. Unfilled or blocked units collapse without breaking the article. Account-level controls still have to be completed in Google AdSense:

1. In **Privacy & messaging**, publish a GDPR message using a Google-certified
   consent management platform for visitors in the EEA, United Kingdom and
   Switzerland. Include the site's ad partners and consent options.
2. In **Sites**, confirm `clearfact.ng` is **Ready** and resolve every item in
   **Policy center** before requesting another review.
3. Confirm `https://clearfact.ng/ads.txt` is reachable and contains the same
   publisher ID used by the application: `pub-8967021504063466`.
4. Test in a private browser with extensions disabled. Consent controls should appear where legally required. Confirm that archive/policy pages do not request AdSense, and that a quality-eligible article requests its ad only when the placement approaches the viewport.

## Production checks

- Open `https://clearfact.ng/api/health`. It should return a JSON response with
  `"status":"ok"`.
- Open the homepage in a private browser window. The live ticker should load
  recent WordPress headlines and pause when hovered.
- Open a current category, a legacy category URL, an article, `/fact-check`,
  `/sitemap.xml`, `/news-sitemap.xml`, `/robots.txt` and `/ads.txt`.
- Confirm legacy category URLs return a permanent redirect to their preferred
  URL and that a temporary WordPress outage returns an error instead of a
  cacheable empty success page.
- Confirm `/category/higher-ducation` permanently redirects to
  `/category/education` and `/category/accountability-journalism`
  redirects to `/category/accountability`.
- Inspect the rendered HTML and confirm each public indexable page has one
  preferred canonical URL and its expected robots directive.
- Confirm that WordPress remains available at `https://cms.clearfact.ng/wp-json/wp/v2/posts`, while opening a normal CMS post URL returns a permanent redirect to the matching `clearfact.ng/post/...` page.
- Open two published articles, including one with minimal editorial metadata. Both should render `index,follow` and appear in the main sitemap. A page that does not satisfy the separate AdSense quality gate should remain indexable but should not request an ad unit.
- Submit a comment from an article while logged out. It should be accepted or
  held for moderation, not return `rest_comment_login_required`.
- In Google Search Console, resubmit `/sitemap.xml` and `/news-sitemap.xml`,
  verify both show **Success**, then use URL Inspection on the homepage and two
  newly published articles. Request indexing only after the live test confirms
  the preferred canonical URL and an `index,follow` robots directive.

The frontend keeps listing pages lightweight, consolidates preferred URLs, includes every genuinely published article in search discovery, surfaces source/editorial transparency on article pages, withholds ad inventory from pages that do not satisfy the separate ad-quality gate, and prevents temporary CMS failures or duplicate CMS pages from becoming indexable public content.
