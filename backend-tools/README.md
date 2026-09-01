# ClearFact WordPress tools

## Enable comments from the public frontend

WordPress blocks anonymous comment creation through the REST API by default,
even when ordinary website comments are enabled in **Settings → Discussion**.
Install `clearfact-rest-comments.php` as a WordPress plugin:

1. In the ClearFact WordPress dashboard, open **Plugins → Add New Plugin → Upload Plugin**.
2. Upload the separate `clearfact-rest-comments.zip` package supplied with this project.
3. Activate **ClearFact REST Comments**.
4. Under **Settings → Discussion**, leave **Users must be registered and logged in to comment** unticked.
5. Purge the WordPress and Cloudflare caches, then submit a test comment from an article on `clearfact.ng`.

Keep comment moderation enabled if you want new comments held for review. The
plugin changes only anonymous `POST /wp/v2/comments` requests; it does not grant
permission to edit or delete comments, posts, users or any other WordPress data.

## Subcategory cleanup

The frontend shows every live top-level WordPress category and keeps **Elections** as its only public subcategory. Removed subcategory URLs redirect to their closest surviving main category.

To permanently remove the other subcategories from WordPress, run the included one-time WP-CLI script from the WordPress installation:

```bash
wp eval-file backend-tools/remove-empty-categories.php
```

The script keeps all top-level categories and the `elections` subcategory. Before deleting Africa, Finance, Higher Education, International, Misinformation, or any other child category, it adds the affected posts to that child's top-level parent category. **It does not delete articles.**

After running it, purge any WordPress/cache/CDN cache and regenerate or refresh the ClearFact sitemap.
