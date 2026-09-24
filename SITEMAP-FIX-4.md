# ClearFact Sitemap / Indexing Fix V4

## Search indexing rule

Every WordPress post returned with `status=publish` and a valid slug is included in `sitemap.xml` and its public `/post/<slug>` page emits:

`index,follow,max-image-preview:large`

Indexing no longer depends on word count, excerpt length, headings, citations, editorial checklist fields, or AdSense eligibility.

## Routes that must not be indexed

The edge server returns `X-Robots-Tag: noindex, nofollow` for the exact route and every nested route under:

- `/admin`
- `/article`
- `/auth`
- `/contributor`
- `/dashboard`
- `/login`
- `/search`
- `/api`

These routes are not present in the sitemap. `robots.txt` allows crawling so search engines can actually see the `noindex` header; blocking them in robots.txt could prevent de-indexing.

## Google News sitemap

Every published post within the 48-hour Google News window is eligible for `news-sitemap.xml` as long as it has a slug. The content-quality filter was removed from News sitemap inclusion.

## AdSense

Search indexing and advertising are separated. A published article can always be indexed, while the existing ad-quality gate remains stricter: usable title/structure, at least 450 words, useful excerpt, and an evidence/editorial-value signal. This protects AdSense quality without hiding published journalism from Google.
