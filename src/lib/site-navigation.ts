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


export type NavigationCategory = (typeof categories)[number] | (typeof moreCategories)[number];

export function filterNavigationCategories(available: Array<{ slug: string; count?: number }>) {
  const active = new Set(
    available
      .filter((category) => (category.count ?? 0) > 0)
      .map((category) => category.slug),
  );

  return {
    main: mainCategories.filter((category) => active.has(category.slug)),
    more: moreCategories.filter((category) => active.has(category.slug)),
  };
}
