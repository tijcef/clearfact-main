export type WordPressCategory = {
  id?: number;
  name: string;
  slug: string;
  parent?: number;
  count?: number;
  description?: string;
};

export type NavigationCategory = WordPressCategory & {
  shortName?: string;
};

/**
 * The frontend taxonomy is sourced from WordPress. These values control only
 * presentation order and compact labels; they never create a missing category.
 */
const navigationOrder = [
  "news",
  "politics",
  "crime-security",
  "law-judiciary",
  "business",
  "education",
  "accountability",
  "entertainment",
  "features",
  "health",
  "investigations",
  "metro",
  "opportunities",
  "sports",
  "technology",
  "world",
];

const mainNavigationSlugs = new Set(navigationOrder.slice(0, 6));

const shortNames: Record<string, string> = {
  "crime-security": "Security",
  "law-judiciary": "Judiciary",
};

const allowedSubcategorySlugs = new Set(["elections"]);

/** Old or removed category URLs resolve to their closest surviving section. */
export const legacyCategoryRedirects: Record<string, string> = {
  "accountability-journalism": "accountability",
  africa: "world",
  economy: "business",
  finance: "business",
  "higher-ducation": "education",
  "higher-education": "education",
  international: "world",
  misinformation: "accountability",
};

export const MIN_INDEXABLE_CATEGORY_POSTS = 5;

export function getCategorySourceSlugs(publicSlug: string) {
  return [publicSlug];
}

export function getPublicCategorySlug(sourceSlug: string) {
  return sourceSlug;
}

export function getPublicCategoryName(category: Pick<WordPressCategory, "name" | "slug">) {
  return category.name.trim();
}

/** Only top-level WordPress categories and the Elections subcategory are public. */
export function isAllowedPublicCategory(category: Pick<WordPressCategory, "slug" | "parent">) {
  return (
    Number(category.parent ?? 0) === 0 || allowedSubcategorySlugs.has(category.slug.toLowerCase())
  );
}

function normalizeCategory(category: WordPressCategory): NavigationCategory {
  const slug = getPublicCategorySlug(category.slug);

  return {
    ...category,
    name: getPublicCategoryName(category),
    slug,
    ...(shortNames[slug] ? { shortName: shortNames[slug] } : {}),
  };
}

function sortCategories(a: NavigationCategory, b: NavigationCategory) {
  const aIndex = navigationOrder.indexOf(a.slug);
  const bIndex = navigationOrder.indexOf(b.slug);
  const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
  const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

  return normalizedA - normalizedB || a.name.localeCompare(b.name, "en");
}

function normalizeUniqueCategories(available: WordPressCategory[]) {
  const categories = new Map<string, NavigationCategory>();

  for (const category of available) {
    if (!category?.slug || !category?.name || Number(category.count ?? 0) <= 0) {
      continue;
    }

    const normalized = normalizeCategory(category);
    const existing = categories.get(normalized.slug);

    if (!existing) {
      categories.set(normalized.slug, normalized);
      continue;
    }

    categories.set(normalized.slug, {
      ...existing,
      count: Number(existing.count ?? 0) + Number(normalized.count ?? 0),
    });
  }

  return Array.from(categories.values()).sort(sortCategories);
}

/**
 * Header, footer and homepage navigation contain only non-empty top-level
 * categories returned by WordPress. New WordPress categories automatically
 * appear in the More menu.
 */
export function filterNavigationCategories(available: WordPressCategory[]) {
  const all = normalizeUniqueCategories(
    available.filter((category) => Number(category.parent ?? 0) === 0),
  );

  return {
    all,
    main: all.filter((category) => mainNavigationSlugs.has(category.slug)),
    more: all.filter((category) => !mainNavigationSlugs.has(category.slug)),
  };
}

/** Category selectors may show every main category plus the retained Elections child category. */
export function filterEditorialCategories(available: WordPressCategory[]) {
  return normalizeUniqueCategories(available.filter(isAllowedPublicCategory));
}

/**
 * Category sitemap entries include main categories and Elections only, and
 * only when the live term has enough reporting to avoid a thin page.
 */
export function getIndexablePublicCategories(available: WordPressCategory[]) {
  return normalizeUniqueCategories(
    available.filter(
      (category) =>
        isAllowedPublicCategory(category) &&
        Number(category.count ?? 0) >= MIN_INDEXABLE_CATEGORY_POSTS,
    ),
  );
}

/**
 * Used only during a temporary taxonomy request failure. Every item mirrors a
 * category verified on WordPress on 24 Aug 2026; no frontend-only category is
 * included.
 */
const fallbackWordPressCategories: WordPressCategory[] = [
  { name: "Accountability", slug: "accountability", parent: 0, count: 5 },
  { name: "Business", slug: "business", parent: 0, count: 20 },
  { name: "Education", slug: "education", parent: 0, count: 23 },
  { name: "Elections", slug: "elections", parent: 4, count: 11 },
  { name: "Entertainment", slug: "entertainment", parent: 0, count: 7 },
  { name: "Features", slug: "features", parent: 0, count: 6 },
  { name: "Health", slug: "health", parent: 0, count: 4 },
  { name: "Investigations", slug: "investigations", parent: 0, count: 3 },
  { name: "Judiciary", slug: "law-judiciary", parent: 0, count: 6 },
  { name: "Metro", slug: "metro", parent: 0, count: 7 },
  { name: "News", slug: "news", parent: 0, count: 41 },
  { name: "Opportunities", slug: "opportunities", parent: 0, count: 3 },
  { name: "Politics", slug: "politics", parent: 0, count: 50 },
  { name: "Security", slug: "crime-security", parent: 0, count: 48 },
  { name: "Sports", slug: "sports", parent: 0, count: 9 },
  { name: "Technology", slug: "technology", parent: 0, count: 3 },
  { name: "World", slug: "world", parent: 0, count: 3 },
];

export const fallbackNavigationCategories = filterNavigationCategories(fallbackWordPressCategories);
export const fallbackEditorialCategories = filterEditorialCategories(fallbackWordPressCategories);
