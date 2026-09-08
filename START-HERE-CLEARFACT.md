# ClearFact bookstore and forms update — 8 September 2026

This package updates your existing ClearFact website. It has not been deployed or installed on the live WordPress site from this conversation.

## Fix the blocked service and partnership forms first

The previous frontend disabled the entire form while waiting for a configured connection secret. This update removes that dependency. Payment settings do not control whether someone can apply.

1. In WordPress, upload **clearfact-services-plugin.zip** from this package. Replace the previous ClearFact Services & Publications plugin and activate version **1.1.0**. Keep the existing records; do not delete the plugin's data.
2. Deploy the updated frontend through your existing ClearFact repository and Cloudflare Worker. Retain all production environment values and the existing domain. Purge the old site cache.
3. Visit `/advertise` and `/partnership`. All fields should be editable immediately. Submit one request of each type and confirm that it appears in WordPress → ClearFact Requests.
4. Advertising notifications go to **ads@clearfact.ng**. Partnership notifications go to **info@clearfact.ng**. Test actual delivery through your WordPress mail service.

`CLEARFACT_SERVICES_SECRET` is now optional. Keeping a matching value enables stricter per-visitor rate limiting, but a missing secret no longer blocks public submissions. The public endpoint can create a request only; it does not expose records. Validation, a honeypot, rate limits and idempotent request references remain in place.

The forms include **Prepare email submission**. If online saving fails, it prepares the completed application for the visitor's email app. The visitor must send that email; preparing it does not mean an application was received and does not create a website reference. Long messages may need to be copied into the email manually.

The WordPress plugin must be installed for online records to be saved. Updating the frontend alone cannot create a missing backend.

## Activate the bookstore

1. Install and activate **WooCommerce** on `cms.clearfact.ng`. Finish its setup and create the cart, checkout and My Account pages. Set the store currency to **NGN**. Configure the business identity and applicable tax settings correctly.
2. Upload and activate **clearfact-books-store-plugin.zip** from this package. Keep **ClearFact Services & Publications 1.1.0** active; it supplies the catalogue endpoint to the frontend.
3. In WordPress → Settings → ClearFact Books, set your commission percentage **before inviting authors**. It defaults to **0%**, so no unapproved commission is imposed. The rate displayed and accepted at submission is saved with that book. Later setting changes affect only new submissions; they do not silently change existing author agreements.
4. In WooCommerce → Settings → Payments, connect your chosen online provider. One supported option is the official **Paystack WooCommerce Payment Gateway** by Paystack. Use your own merchant account and test keys first. Configure the webhook URL shown by that gateway, then verify payment, failure and refund handling before switching to live keys. No gateway keys or merchant account are bundled.
5. Test WordPress account-setup and password-reset emails, WooCommerce order confirmations, and ClearFact review emails. WooCommerce's paid-order email includes the secure book download link. It is an order/payment confirmation, not a separate tax-invoice or fiscal-receipt system.
6. Set PHP `upload_max_filesize` to at least **20M** and `post_max_size` to at least **32M**. The initial bookstore accepts full PDF books up to **20 MB**, sample PDFs up to **2 MB**, and JPEG/PNG covers up to **3 MB**. Cover dimensions must not exceed 6000 pixels on either side.
7. Exclude WordPress `admin-post.php`, cart, checkout, My Account and payment callbacks from CDN and page caches. Ensure HTTPS works on the CMS domain. Use the standard WooCommerce checkout; purchasers must have a signed-in account or create one during checkout.
8. Deploy the frontend from this package. `/books` now links to the author portal and purchases, shows approved books, their prices and samples, and sends readers to their WooCommerce product/checkout pages. Account, checkout and download operations take place on `cms.clearfact.ng`.

Provider setup instructions: https://wordpress.org/plugins/woo-paystack/

## Author experience

Authors open **Books → Submit your book / Author dashboard**. The portal supports account creation with an emailed password setup link, existing-account sign-in and password resets.

Once signed in, an author submits the title, author/pen name, description, proposed NGN price, cover, sample and full PDF. They confirm publishing rights and accept the displayed commission. The submission is pending until reviewed. The proposed price is used if approved; staff do not silently substitute a new price.

The author portal displays their books, review decisions/notes, order references, sales after refunds, commission, author earnings, recorded payouts and unpaid balance. It does not reveal customer contact details or other authors' records.

Authors cannot edit live books directly. A requested revision should be submitted as a new version for review. Previously purchased files remain available unless access is revoked by the order/refund state. EPUB, DRM, subscriptions and automated bank payouts are not included in this first release.

## ClearFact review and publication

Open WordPress → **Book Submissions**. Review the full PDF, public sample, cover, description and rights. Choose Pending, Approve, Request changes, Reject or Withdraw, add an author-visible note, then Update.

Approval creates a virtual WooCommerce product at the submitted price. The author receives a review-update email. Only approved books with complete private files enter the public catalogue. Withdrawal removes the product from sale while preserving existing buyer files and sales history. Review the PDF for malware as part of editorial intake; this plugin does not include a malware scanner.

Legacy book links and e-print entries from the earlier catalogue are preserved. Legacy books are not automatically converted to protected store products; submit their PDFs through the new author workflow if you want them sold through this system.

## Payments, receipts and downloads

The connected WooCommerce gateway handles checkout and verifies payment. The book plugin trusts WooCommerce's authenticated payment state; it never treats a browser success page, screenshot or submitted amount as proof of payment. Staff with order-management permissions can also change payment state, so limit those permissions to trusted staff.

Full book files are stored in **private database chunks**, not WordPress's public Media Library. The download handler checks the logged-in buyer, their order, the purchased book, confirmed paid status and refund state every time. Guessing or sharing a link does not grant another account access. The author and authorised reviewers can access the author's own submission before publication.

The buyer gets a paid-order confirmation with a download link and can return to **Books → My purchases & downloads**. Links require the original purchasing account. Files are checked for integrity before delivery. This prevents unauthorised website downloads; it cannot stop a purchaser from redistributing a file after downloading it.

Any refund on an order suspends all book downloads for that order, including partial refunds. Staff should review access when issuing a partial refund. Repeated payment notifications do not duplicate earnings. Book-only orders are marked complete after verified payment.

Offline WooCommerce methods (cash on delivery, cheque and unverified direct transfer) are excluded for book carts. Advertising bank transfers remain available through the separate service workflow.

## Commission and author payouts

Commission is calculated on the discounted book line amount, excluding tax and refunded amounts. ClearFact bears payment-provider fees. For example, a NGN 1,000 net book sale at a 20% agreed commission produces NGN 200 commission and NGN 800 author earnings. This is an example, not the configured default rate.

Line-allocated refunds reduce the related book's earnings. Unallocated order-level refunds are conservatively apportioned across line totals. For precise author accounting, record refunds against their specific WooCommerce book lines.

Open WooCommerce → **ClearFact author payouts** to inspect balances. Verify order/payment/refund records and confirm the author's bank details privately. Staff transfer money outside this dashboard, then record the amount and unique bank/provider transfer reference. The plugin records the staff member and time, rejects duplicate references and amounts above the unpaid balance, and displays the payment in the author's history. It does not initiate a bank transfer.

Refunds after a payout can create a negative author balance. Resolve that balance before further payment. A reconciliation control refreshes the ledger from existing WooCommerce orders in pages of 50; process all pages before relying on a restored ledger. Do not delete paid orders or payout records; retain them for reconciliation and use WooCommerce's refund/cancellation process.

## Preserve the news site

The existing news article routes, article metadata, robots/sitemap logic, AdSense component, ad placement settings, publisher ID and ads.txt are unchanged by this bookstore update. New bookstore account/payment/download routes are not added to article sitemaps. CMS store product pages are marked noindex so they do not compete with ClearFact news URLs.

No category cleanup or domain migration is required. The older CLEARFACT-DEPLOYMENT.md describes previous work; do not rerun its taxonomy cleanup for this update.

Build the existing frontend with `npm ci` then `npm run build` and deploy through the same Cloudflare workflow. The included build is for review; rebuild using your existing production environment. This is a Worker application, not a plain static upload. Do not overwrite production secrets with blank `.env.example` values.

## Checks completed and checks still required

Completed locally: production build, TypeScript, lint of changed service/frontend files, syntax checks of both PHP plugins, service/proxy contract tests, and bookstore accounting/download contract tests. Tests use WordPress/WooCommerce doubles and send no real emails or payments.

Before launch, complete these on a staging copy or in payment-provider test mode:

- Submit advertising and partnership requests; verify saved records and delivered emails.
- Create an author account, set its password, submit a PDF and confirm it stays out of the catalogue before approval.
- Approve the book, open its cover/sample, inspect the WooCommerce product and price, and purchase with a separate buyer account.
- Verify the paid-order email, download and purchase history. A signed-out browser and another account must not receive the paid PDF.
- Test pending/failed payment, repeated webhook delivery, partial/full refunds, commission totals and a recorded test payout. Use test data and no real transfer for the payout-record test.
- Check normal news pages, ads.txt, sitemaps and the existing staff tools.

Live WordPress/WooCommerce integration, gateway credentials, real settlement, email delivery, browser rendering and live deployment were not verified or changed from this conversation. Installation and live configuration are necessary; this ZIP alone does not activate the store on clearfact.ng.
