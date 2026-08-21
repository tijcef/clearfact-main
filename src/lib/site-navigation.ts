export const categories = [
  { name: "Breaking", slug: "breaking" },
  { name: "News", slug: "news" },
  { name: "Politics", slug: "politics" },
  { name: "Crime & Security", shortName: "Security", slug: "crime-security" },
  { name: "Law & Judiciary", shortName: "Judiciary", slug: "law-judiciary" },
  { name: "Business", slug: "business" },
  { name: "Investigations", slug: "investigations" },
  {
    name: "Accountability Journalism",
    shortName: "Accountability",
    slug: "accountability-journalism",
  },
  { name: "Education", slug: "education" },
  { name: "Health", slug: "health" },
  { name: "Technology", slug: "technology" },
  { name: "Opportunities", slug: "opportunities" },
] as const;

export const mainCategories = categories.filter((category) => category.slug !== "breaking");

export const moreCategories = [
  { name: "Features", slug: "features" },
  { name: "Metro", slug: "metro" },
  { name: "World", slug: "world" },
  { name: "Opinion", slug: "opinion" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Sports", slug: "sports" },
  { name: "Climate", slug: "climate-environment" },
  { name: "Research", slug: "data-research" },
  { name: "Video", slug: "video" },
] as const;

/**
 * Public category slugs do not always match the historic WordPress taxonomy.
 * Keep that translation in one place so navigation, category loaders and the
 * sitemap all agree on the single public URL for each section.
 */
export const categorySourceSlugs: Record<string, readonly string[]> = {
  "accountability-journalism": ["accountability"],
};

/**
 * Historic URLs that have either been renamed or folded into a broader desk.
 * These are permanent moves, not aliases: only the destination should be
 * canonical and indexable.
 */
export const legacyCategoryRedirects: Record<string, string> = {
  accountability: "accountability-journalism",
  economy: "business",
  finance: "business",
  elections: "politics",
  "higher-ducation": "education",
  africa: "world",
  international: "world",
  misinformation: "accountability-journalism",
};

export function getCategorySourceSlugs(publicSlug: string) {
  return categorySourceSlugs[publicSlug] ?? [publicSlug];
}

export type NavigationCategory = (typeof categories)[number] | (typeof moreCategories)[number];

export function filterNavigationCategories(available: Array<{ slug: string; count?: number }>) {
  const active = new Set(
    available.filter((category) => (category.count ?? 0) > 0).map((category) => category.slug),
  );

  return {
    main: mainCategories.filter((category) =>
      getCategorySourceSlugs(category.slug).some((slug) => active.has(slug)),
    ),
    more: moreCategories.filter((category) =>
      getCategorySourceSlugs(category.slug).some((slug) => active.has(slug)),
    ),
  };
}
