# ClearFact: complete improvements

This package includes the previous video player update and all five requested improvements.

## Install

1. Deploy the updated frontend using the current deployment method and existing environment variables.
2. In WordPress → Plugins → Add New Plugin → Upload Plugin, install and activate `backend-tools/clearfact-video.zip` (if not already active).
3. Install and activate `backend-tools/clearfact-story-inbox.zip` in the same way. This plugin is required for the new online Submit a Story form.
4. Confirm the Administration Email Address in WordPress → Settings → General. Story alerts go to this address through WordPress mail delivery.

Only the two plugin ZIPs are uploaded inside WordPress. The outer website ZIP contains the frontend source for deployment.

## What changed

- Article previews display concise plain text, remove an exact repeated headline and standalone YouTube URLs, and end at a word boundary.
- Public submissions are saved to a private WordPress Story Inbox. WordPress shows an unread-review count notice and emails its administrator. Submissions never publish automatically.
- Mobile header spacing, article text wrapping, heading sizes and responsive search controls have been improved.
- Search combines keywords, category, tag links and date range on the WordPress server. It has a Load more button, clear filters and error handling. Search pages retain noindex,follow.
- Video labels appear on homepage cards, category cards, related stories and search results. Latest Videos remains below the lead story, with a visible navigation link and a phone button.

## Review a reader submission

Open WordPress → Story Inbox. Open a story and review the information, evidence, private contact details and name-credit preference. Click **Create editorial draft**. Edit the draft, verify claims, choose its categories and featured image, then publish through the normal WordPress publishing controls. The draft includes a supplied contributor credit only when the sender explicitly permitted it. Contact details and evidence fields are not copied into the public draft.

The source may still include identifying details in their story text; editors should review these before publication. Use WordPress Trash to dismiss unwanted submissions. Drafts already created are excluded from the pending-review notice.

## Final live check

- Submit a harmless test story through `/submit-story` and confirm its received message.
- Confirm it appears only in Story Inbox and that the administrator receives the alert. Email delivery depends on the WordPress host/mail configuration.
- Create a draft and confirm it is not publicly visible until deliberately published.
- Check name-credit handling using both private and named submissions.
- Check the homepage, search filters, Videos button and article player on a phone and a desktop.
- Confirm existing ad placements load normally under the site's current eligibility rules.

## Verification completed

Production build, TypeScript validation, focused lint checks, PHP syntax parsing, YouTube regression tests, clean-preview/search tests and sitemap regression tests passed. Eleven ad/indexing files were compared against the supplied original and are byte-for-byte unchanged. AdSense components, ads.txt, sitemap generation and robots files are preserved; existing canonical and category indexing rules are retained.

Browser visual testing was unavailable in this environment. The new WordPress plugin has not been exercised on the live CMS, and email delivery has not been tested. Installing or deploying this package does not itself guarantee advertising approval or search-engine inclusion.
