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
- Inspect the rendered HTML and confirm each public indexable page has one
  preferred canonical URL and its expected robots directive.
- Confirm that WordPress remains available at
  `https://cms.clearfact.ng/wp-json/wp/v2/posts`.

The frontend now avoids shipping full article bodies in listing-page HTML,
keeps preferred category URLs consistent, makes the fact-check hub data-driven,
and prevents temporary CMS failures from being indexed as empty pages.
