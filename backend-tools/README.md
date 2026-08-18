# ClearFact WordPress category cleanup

The frontend now hides any navigation category whose live WordPress `count` is zero, and empty category routes return a real 404 instead of a thin/empty page.

To permanently remove empty categories from the WordPress backend, run the included one-time WP-CLI script from the WordPress installation:

```bash
wp eval-file backend-tools/remove-empty-categories.php
```

The script deletes only categories with `count = 0` and preserves WordPress's configured default category.

After running it, purge any WordPress/cache/CDN cache and regenerate or refresh the ClearFact sitemap.
