# ClearFact WordPress subcategory cleanup

The frontend shows every live top-level WordPress category and keeps **Elections** as its only public subcategory. Removed subcategory URLs redirect to their closest surviving main category.

To permanently remove the other subcategories from WordPress, run the included one-time WP-CLI script from the WordPress installation:

```bash
wp eval-file backend-tools/remove-empty-categories.php
```

The script keeps all top-level categories and the `elections` subcategory. Before deleting Africa, Finance, Higher Education, International, Misinformation, or any other child category, it adds the affected posts to that child's top-level parent category. **It does not delete articles.**

After running it, purge any WordPress/cache/CDN cache and regenerate or refresh the ClearFact sitemap.
