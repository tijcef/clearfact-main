export const categories = [
  { name: "News", slug: "news" },
  { name: "Politics", slug: "politics" },
  { name: "Security", slug: "crime-security" },
  { name: "Judiciary", slug: "law-judiciary" },
  { name: "Business", slug: "business" },
  { name: "Accountability", slug: "accountability" },
  { name: "Education", slug: "education" },
  { name: "Health", slug: "health" },
  { name: "Technology", slug: "technology" },
  { name: "Investigations", slug: "investigations" },
  { name: "Opportunities", slug: "opportunities" },
] as const;

export const mainCategories = categories;

export const moreCategories = [
  { name: "Features", slug: "features" },
  { name: "Metro", slug: "metro" },
  { name: "World", slug: "world" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Sports", slug: "sports" },
] as const;

export const MIN_INDEXABLE_CATEGORY_POSTS = 5;

/**
 * Server-rendered fallbacks keep navigation useful to readers and crawlers
 * while live WordPress category data is loading or temporarily unavailable.
 *
 * Only categories that currently exist in WordPress should be listed here.
 */
const fallbackMainSlugs = new Set([
  "news",
  "politics",
  "crime-security",
  "law-judiciary",
  "business",
  "accountability",
  "education",
]);

const fallbackMoreSlugs = new Set([
  "features",
  "metro",
  "world",
  "entertainment",
  "sports",
]);

export const fallbackNavigationCategories = {
  main: mainCategories.filter((category) =>
    fallbackMainSlugs.has(category.slug),
  ),
  more: moreCategories.filter((category) =>
    fallbackMoreSlugs.has(category.slug),
  ),
};

/**
 * Public category slugs now match the current WordPress category slugs.
 *
 * Keep this object available in case a future public URL needs to map to a
 * different WordPress taxonomy slug.
 */
export const categorySourceSlugs: Record<
  string,
  readonly string[]
> = {};

/**
 * Permanent redirects for genuinely OLD category URLs.
 *
 * Do NOT place active WordPress subcategories here.
 *
 * Current active subcategories such as:
 * finance
 * elections
 * higher-ducation
 * africa
 * international
 * misinformation
 *
 * must remain accessible and must not redirect to their parent categories.
 */
export const legacyCategoryRedirects: Record<string, string> = {
  "accountability-journalism": "accountability",
};

/**
 * Return the WordPress taxonomy slug corresponding to a public category.
 */
export function getCategorySourceSlugs(publicSlug: string) {
  return categorySourceSlugs[publicSlug] ?? [publicSlug];
}

export type NavigationCategory =
  | (typeof categories)[number]
  | (typeof moreCategories)[number];

/**
 * Only display navigation categories that actually exist in WordPress
 * and contain at least one published article.
 *
 * This prevents deleted/empty categories from continuing to generate
 * frontend navigation links that search engines can discover.
 */
export function filterNavigationCategories(
  available: Array<{
    slug: string;
    count?: number;
  }>,
) {
  const active = new Set(
    available
      .filter((category) => (category.count ?? 0) > 0)
      .map((category) => category.slug),
  );

  return {
    main: mainCategories.filter((category) =>
      getCategorySourceSlugs(category.slug).some((slug) =>
        active.has(slug),
      ),
    ),

    more: moreCategories.filter((category) =>
      getCategorySourceSlugs(category.slug).some((slug) =>
        active.has(slug),
      ),
    ),
  };
}