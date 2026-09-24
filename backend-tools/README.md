# ClearFact WordPress tools

## Required for AdSense/search quality: headless SEO guard

Install `clearfact-headless-seo-guard.php` as a WordPress plugin on `cms.clearfact.ng`. It keeps the CMS from becoming a duplicate public website by disabling the WordPress sitemap, adding `noindex` signals to CMS-rendered pages, and redirecting public WordPress post/category/author URLs to their canonical `clearfact.ng` equivalents. REST API requests, media files, wp-admin and editor previews are left available.

1. In WordPress, go to **Plugins → Add New Plugin → Upload Plugin**.
2. Upload `clearfact-headless-seo-guard.zip` from this folder and activate it.
3. Purge WordPress and Cloudflare caches.
4. Confirm that opening a normal CMS post URL redirects to the matching `https://clearfact.ng/post/...` URL, while `https://cms.clearfact.ng/wp-json/wp/v2/posts` still returns JSON.

## Required for future content quality: editorial quality checklist

Install `clearfact-editorial-quality.php` as a WordPress plugin. It adds a **ClearFact Editorial Value** panel to the post editor, a quality column to the Posts screen, and a safe `clearfact_editorial` field to the public REST API. The frontend uses that signal together with article length and linked source records to decide whether a page should be indexed and whether an ad unit is eligible to load.

The checklist does **not** claim that word count alone makes journalism high quality. It is a guardrail against obviously thin, unsourced or lightly rewritten pages. Original interviews, field reporting, document/data analysis and fact checks can be marked as such with a short explanation of what ClearFact added.

1. Upload and activate `clearfact-editorial-quality.zip`.
2. Edit every important published article and complete the **ClearFact Editorial Value** panel honestly.
3. Add links to primary records or credible source material inside the article where appropriate.
4. For reports based mainly on a statement or another publisher, add independent verification/context before marking the checklist complete.
5. Purge caches after updating a batch of posts so `clearfact.ng`, `sitemap.xml` and `news-sitemap.xml` receive the new quality metadata.

## Enable comments from the public frontend

WordPress blocks anonymous comment creation through the REST API by default,
even when ordinary website comments are enabled in **Settings → Discussion**.
Install `clearfact-rest-comments.php` as a WordPress plugin:

1. In the ClearFact WordPress dashboard, open **Plugins → Add New Plugin → Upload Plugin**.
2. Upload the separate `clearfact-rest-comments.zip` package supplied with this project.
3. Activate **ClearFact REST Comments**. If version 1.0.0 is already installed, approve WordPress's **Replace current with uploaded** option to install version 1.1.0.
4. Under **Settings → Discussion**, leave both **Comment author must fill out name and email** and **Users must be registered and logged in to comment** unticked. The ClearFact frontend requires the visitor's name but does not request an email address.
5. Purge the WordPress and Cloudflare caches, then submit a test comment from an article on `clearfact.ng`.

Keep comment moderation enabled if you want new comments held for review. The
plugin changes only anonymous `POST /wp/v2/comments` requests; it does not grant
permission to edit or delete comments, posts, users or any other WordPress data.
It also removes the optional Email and Website fields from the native
`cms.clearfact.ng` comment form so both the CMS view and public frontend request
only a name and comment.

## Subcategory cleanup

The frontend shows every live top-level WordPress category and keeps **Elections** as its only public subcategory. Removed subcategory URLs redirect to their closest surviving main category.

To permanently remove the other subcategories from WordPress, run the included one-time WP-CLI script from the WordPress installation:

```bash
wp eval-file backend-tools/remove-empty-categories.php
```

The script keeps all top-level categories and the `elections` subcategory. Before deleting Africa, Finance, Higher Education, International, Misinformation, or any other child category, it adds the affected posts to that child's top-level parent category. **It does not delete articles.**

After running it, purge any WordPress/cache/CDN cache and regenerate or refresh the ClearFact sitemap.
