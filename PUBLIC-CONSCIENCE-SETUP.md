# ClearFact commentary and video update

1. Deploy this frontend using the existing deployment process. Existing post URLs, ad files, ad placements, server SEO handling, sitemap logic and category indexing threshold are unchanged.
2. In WordPress → Plugins → Add New → Upload Plugin, install backend-tools/clearfact-public-conscience.zip and activate it. This adds Opinion / Commentary (opinion-commentary), its child The Public Conscience (the-public-conscience), Video (video), and Community (community). Existing matching terms are preserved.
3. Open Tools → The Public Conscience → Create first commentary draft. Review the supplied new draft, add a featured image and publish when ready. The supplied text is a new draft, not a recovered copy of yesterday's article. The button reopens the same draft on subsequent clicks.
4. The draft has the requested headline, tags and two commentary categories. Its frontend byline is Emmanuel Sunday Tijwun, Public Affairs and Humanitarian Affairs Commentator. WordPress post ownership remains with the logged-in editor. The column is reserved for this author.
5. For video posts, select Video, add a featured image, descriptive text and a native WordPress Video or Embed block. You may also assign the commentary categories to a video commentary. No autoplay or new video advertising scripts are introduced.

Non-empty categories appear in the existing More menu and footer. The column child is allowed as a public category. Empty sections remain hidden. Category pages retain noindex until five published posts, matching the original indexing policy. No fabricated category counts are used.

This ZIP changes source files only; it does not deploy the live website or install the WordPress plugin automatically. Check the column page, a published article, a video embed, mobile navigation, ads and existing sitemaps after deploying. Purge the existing frontend/category cache if new categories do not appear immediately.

Validation: navigation and indexing assertions passed; existing ad, server, root and sitemap files match the original byte for byte. Full build/typecheck and PHP runtime validation could not run here: npm dependencies were unavailable offline and PHP was not installed. Run npm ci, npm run typecheck, npm run build and PHP lint before deployment.

Community update: assign verified local reports to Community. Its archive links to the existing email-based Submit a Story page. The form opens the reader’s email app; readers must send the email themselves. No automatic public posting is enabled. Existing branding and tagline are unchanged. If version 1.0.0 of the plugin is already installed, upload this updated plugin, replace the existing version, then deactivate and reactivate it to create Community.

Sender credit preference: Submit a Story now includes mutually exclusive choices to keep the sender’s name private (default) or permit publication with their name, plus a name field. Choosing public credit requires a name. The submission email includes the preference and supplied name. Editors must honour the private choice and confirm appropriate authorship/credit before publishing; this is not an automatic WordPress author assignment. Test both options and the missing-name validation after deploying.
