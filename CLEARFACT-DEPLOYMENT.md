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

## WordPress category cleanup

From the existing WordPress installation, run the included one-time taxonomy
cleanup after deploying the frontend:

```bash
wp eval-file backend-tools/remove-empty-categories.php
```

This changes the misspelled `higher-ducation` slug to `higher-education`,
preserves its articles, deletes only empty non-default categories and leaves
valid WordPress subcategories intact. Purge the WordPress/CDN cache after the
command completes.

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

## AdSense account checks

The code now declares the publisher account, loads the approved AdSense client
and provides the required advertising disclosures. Account-level controls still
have to be completed in Google AdSense:

1. In **Privacy & messaging**, publish a GDPR message using a Google-certified
   consent management platform for visitors in the EEA, United Kingdom and
   Switzerland. Include the site's ad partners and consent options.
2. In **Sites**, confirm `clearfact.ng` is **Ready** and resolve every item in
   **Policy center** before requesting another review.
3. Confirm `https://clearfact.ng/ads.txt` is reachable and contains the same
   publisher ID used by the application: `pub-8967021504063466`.
4. Test in a private browser with extensions disabled. Consent controls should
   appear where legally required and ads should request only after the page's ad
   placement approaches the viewport.

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
  `/category/higher-education` and `/category/accountability-journalism`
  redirects to `/category/accountability`.
- Inspect the rendered HTML and confirm each public indexable page has one
  preferred canonical URL and its expected robots directive.
- Confirm that WordPress remains available at
  `https://cms.clearfact.ng/wp-json/wp/v2/posts`.
- Submit a comment from an article while logged out. It should be accepted or
  held for moderation, not return `rest_comment_login_required`.

The frontend now avoids shipping full article bodies in listing-page HTML,
keeps preferred category URLs consistent, makes the fact-check hub data-driven,
and prevents temporary CMS failures from being indexed as empty pages.
