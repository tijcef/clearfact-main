# ClearFact AdSense low-value-content recovery

This build reduces the technical signals that can make a headless news site look thin, duplicated or ad-first. It does **not** manufacture originality. Existing WordPress stories still have to contain real ClearFact value: reporting, verification, useful context, primary records, interviews, data/document analysis or clearly attributed evidence.

## What this build changes automatically

- Keeps the AdSense publisher verification meta tag and the existing valid `ads.txt` publisher record.
- Removes manual ad units from the homepage, category archives and Fact Check hub.
- Loads the AdSense script only when an article is eligible for an ad placement.
- Gives every full article an automatic quality assessment based on usable structure, excerpt, source links, statement/press-release signals and optional editorial-value metadata.
- Marks weak articles `noindex,follow` instead of promoting them to search engines.
- Excludes weak articles from both `/sitemap.xml` and `/news-sitemap.xml`.
- Withholds ads from an article unless it is substantive and has either a linked external source record or a completed original-value signal from WordPress.
- Adds visible reporting-transparency information, source links, editorial standards, correction links and Trust Center links to article pages.
- Strengthens author biography handling and keeps thin author profiles out of the index.
- Removes archive/listing pages from ad inventory.
- Narrows the sitemap to core public/trust pages, strong categories and quality-eligible stories.
- Adds a headless WordPress SEO plugin that disables the duplicate CMS sitemap, adds noindex protection to CMS HTML and redirects public CMS content URLs to `clearfact.ng`.
- Adds a WordPress editorial-quality plugin with a reporting-type selector, “What did ClearFact add?” field, four-point editorial checklist and automatic Index/Ads readiness indicator.

## Required WordPress work before another AdSense review

Install the two ZIP files in `backend-tools/`:

- `clearfact-headless-seo-guard.zip`
- `clearfact-editorial-quality.zip`

Then review your most important published stories first. For each one:

1. Keep only claims you can support.
2. Link to the primary record, official document, dataset, court record, institution, direct source or other credible evidence when a public URL exists.
3. If the story contains an interview, field reporting, original verification, document/data analysis or a fact check, select the correct **Reporting type** and explain the concrete ClearFact contribution in **What did ClearFact add?**.
4. Complete the four editorial checklist items only when they are actually true.
5. If the article is mainly a statement or another publisher's report, add independent context/verification before treating it as a strong ClearFact article.
6. Give regular authors a factual newsroom biography in WordPress. Generic author profiles remain available to readers but should not be relied on as indexed authority pages.

The frontend intentionally keeps questionable stories readable while removing them from sitemap promotion and ad inventory. Do not bulk-tick the editorial checklist merely to make pages pass; that would defeat the purpose of the recovery work.

## Production verification

After frontend deployment and WordPress plugin activation:

1. Purge WordPress and Cloudflare caches.
2. Confirm `https://clearfact.ng/ads.txt` still contains the correct publisher ID.
3. Confirm the homepage, category pages and Fact Check hub do not request an AdSense unit.
4. Open a reviewed, strong article. Inspect the rendered page and confirm it has `index,follow`, appears in the sitemap and shows the Reporting transparency panel.
5. Open an intentionally weak or unreviewed statement-based article. Confirm it has `noindex,follow`, is absent from the sitemap and does not load an ad unit.
6. Open a normal post URL on `cms.clearfact.ng`; it should redirect permanently to the matching `clearfact.ng/post/...` URL. The WordPress REST API must remain accessible.
7. Resubmit `/sitemap.xml` and `/news-sitemap.xml` in Google Search Console after the live checks pass.
8. Request another AdSense review only after the public site is consistently showing the stronger content pattern above.

No code change can guarantee AdSense approval because Google also evaluates the actual published material and the account/site review state. This build is designed to stop the website from advertising or promoting obviously weak pages while giving the newsroom a repeatable process for strengthening the content that remains indexable.
