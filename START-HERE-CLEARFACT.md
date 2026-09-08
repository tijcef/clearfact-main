# ClearFact update — 8 September 2026

This is an update to your existing ClearFact website. It has not been deployed to clearfact.ng.

## Added sections

| Page | Purpose |
| --- | --- |
| /books | Books catalogue managed in WordPress |
| /e-print | Digital newspaper editions managed in WordPress |
| /advertise | Service brief, agreed payment instructions, and proof-of-payment email link |
| /partnership | Applications from individuals and organisations |
| /team | Emmanuel Sunday Tijwun — Lead / Founder; Nuhu Danladi Mamtso — Chief Editor |
| /staff | WordPress and existing newsroom sign-in links |

All appear in the header and footer. Leadership is also updated on About.

## Activate the new services

1. Back up the live site and WordPress database. Deploy this source update through the existing ClearFact repository and Cloudflare project. Retain the existing domain, Worker identity and Supabase environment values. Do not upload the entire website ZIP as a WordPress plugin.
2. In WordPress at cms.clearfact.ng, open Plugins → Add New → Upload Plugin. Upload the **clearfact-services-plugin.zip** included in this package, then activate **ClearFact Services & Publications**. This is separate from the existing document-verification plugin.
3. Open WordPress Settings → ClearFact Services. Add the verified company bank, account name and number, and/or your approved HTTPS payment checkout link. Add any payment instructions. No bank account, price, payment provider or actual publication was invented in this update.
4. Copy the connection value shown on that settings page into a **server-side Cloudflare Worker secret** named `CLEARFACT_SERVICES_SECRET`. Redeploy the existing Worker. Do not use a VITE variable or publish the secret in the repository. Forms are enabled only when the website and plugin connection values match.
5. Configure and test the WordPress outgoing mail service. Confirm that **ads@clearfact.ng** and **info@clearfact.ng** receive mail and that customer acknowledgements and receipts arrive. Mail delivery was not tested on your live server. No emails were sent during development.
6. Add books in WordPress → ClearFact Books and newspaper editions in ClearFact E-Print. Use the title, description, featured image, author, edition, display price and HTTPS read/buy link. Publish to list an item; drafts stay hidden. A paid publication needs a store or delivery link that enforces payment—do not place paid PDFs at an unrestricted public URL.
7. Give authorised administrators access to WordPress service records. Publishing editors can manage catalogue content; only administrators can inspect applications and issue receipts. Keep existing newsroom roles in Supabase; public self-assignment was removed from the dashboard.
8. Purge old Cloudflare and WordPress caches after deployment.

Frontend build: `npm ci` followed by `npm run build`. Deploy using the existing Cloudflare workflow. The included `dist` was built without your private environment; rebuilding with your existing configuration is recommended. This is a Worker application, not a plain static Pages upload. Do not replace existing production secrets with empty example values.

The older CLEARFACT-DEPLOYMENT.md is retained for reference. Its category cleanup procedure is a prior migration and is **not required for this update**. Do not rerun taxonomy cleanup as part of adding services.

## Advertising and receipts

1. Customer submits a service brief. A private record and a reference such as CF-2026-000123 are created; staff are notified at ads@clearfact.ng.
2. Staff agree the service, price and schedule. The customer pays using the confirmed bank details or configured external payment page. This update does not automatically charge cards or verify provider webhooks.
3. The customer emails payment proof and creative files to ads@clearfact.ng, quoting the reference. The website's email link prepares the subject and message; the customer attaches files in their email app. There is no public storage of payment proof.
4. An authorised administrator opens WordPress → ClearFact Requests, checks the bank/provider transaction independently, enters the amount actually received, transaction ID and payment date, ticks the verification box and updates the record.
5. The plugin stores an immutable numbered receipt with the verifying staff user and emails a plain-text receipt to the customer. An acknowledgement is never called a payment receipt. Duplicate transaction IDs cannot generate a second receipt. If the mail system rejects the receipt, the record offers a retry.
6. Staff update the request status through review, awaiting payment, in progress, completed or declined. Payment does not publish an article automatically.

Partnership applications follow the same private-record process, are emailed to info@clearfact.ng, and do not create receipts or partnership agreements automatically.

## Indexing and advertisements

- Existing news article paths, article metadata, news publishing and AdSense client/slot values are retained.
- AdSense component, script, placement rules and ads.txt are unchanged. New service/catalogue/staff pages do not add ad placements.
- New pages and advertising use `noindex, follow`; requests and service APIs are not indexable. Existing informational pages retain their prior policy. The advertising page was removed from the general sitemap to match its new form-focused purpose.
- Published WordPress news remains eligible for the existing sitemaps. Drafts, private service records and partnership applications do not enter them. Sitemap feed caches are reduced to 60 seconds; sitemap outage fallback is limited to five minutes instead of a week. These are cache settings, not indexing deadlines.
- The news sitemap covers the latest 48 hours, excludes future timestamps and is capped at 1,000 articles. Exact page-boundary pagination now handles WordPress's end-of-results response.
- Submit https://clearfact.ng/sitemap.xml and https://clearfact.ng/news-sitemap.xml in Search Console after deployment. Use URL Inspection on a newly published article.
- Google controls whether and when a page is indexed. No code can guarantee instant indexing or AdSense approval, fill or earnings.

Google documentation: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl

## Verification and remaining live checks

Completed locally: production build, TypeScript check, lint of new service files, PHP syntax validation, proxy contract tests, and PHP contract tests with in-memory WordPress doubles. Tests cover private storage, input validation, retries, mailbox routing, permission/nonce enforcement, verified receipt immutability, email failures and duplicate transaction protection. PHP doubles do not replace testing on your actual WordPress installation.

After configuration, make one test advertising request and one partnership application. Confirm records appear, emails arrive, the payment link/account is correct, and a legitimate verified test payment produces the right receipt. Publish a real book/edition and check its link on mobile and desktop. Check a news article, ads.txt, both sitemaps and staff sign-in. Live payment settlement, mail delivery, account permissions, ad serving, production page rendering and Search Console state have not been verified in this package-only task.

Repeat local tests with `node tests/services-proxy.test.mjs` and `php tests/services-plugin.test.php` (PHP 7.4+).
