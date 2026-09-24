import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import {
  getCategories,
  getFeaturedImageUrl,
  getPostsByCategory,
  normalizeWpSlug,
  stripHtml,
} from "@/lib/wordpress";
import {
  getCategorySourceSlugs,
  getPublicCategoryName,
  getPublicCategorySlug,
  isAllowedPublicCategory,
  legacyCategoryRedirects,
  MIN_INDEXABLE_CATEGORY_POSTS,
} from "@/lib/site-navigation";
import AdSense from "@/components/AdSense";

function categoryLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const redirectSlug = legacyCategoryRedirects[params.slug];

    if (redirectSlug) {
      throw redirect({
        to: "/category/$slug",
        params: { slug: redirectSlug },
        statusCode: 301,
      });
    }

    const acceptedSlugs = getCategorySourceSlugs(params.slug);
    let matchedCategories: any[] = [];

    try {
      // The root route already needs the complete category list for navigation.
      // Reusing that same request lets the WordPress client deduplicate it instead
      // of making an additional, slow category lookup for every section page.
      const categories = await getCategories();
      const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));

      matchedCategories = acceptedSlugs
        .map((slug) => categoriesBySlug.get(slug))
        .filter(
          (category) =>
            category && isAllowedPublicCategory(category) && Number(category.count ?? 0) > 0,
        );
    } catch (error) {
      console.error(`Category ${params.slug} failed to load:`, error);
      throw new Error(`The ${categoryLabel(params.slug)} desk is temporarily unavailable.`, {
        cause: error,
      });
    }

    if (!matchedCategories.length) {
      throw notFound();
    }

    const primaryCategory = matchedCategories[0];
    const publicSlug = getPublicCategorySlug(primaryCategory.slug);

    if (publicSlug !== params.slug) {
      throw redirect({
        to: "/category/$slug",
        params: { slug: publicSlug },
        statusCode: 301,
      });
    }

    try {
      const postGroups = await Promise.all(
        matchedCategories.map((category) => getPostsByCategory(category.id, 24)),
      );
      const uniquePosts = new Map<number, any>();

      postGroups.flat().forEach((post) => uniquePosts.set(post.id, post));

      const posts = Array.from(uniquePosts.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 24);
      const category = {
        ...primaryCategory,
        name: getPublicCategoryName(primaryCategory),
        slug: publicSlug,
        count: matchedCategories.reduce((total, item) => total + Number(item.count ?? 0), 0),
      };

      return {
        category,
        posts,
      };
    } catch (error) {
      console.error(`Category ${params.slug} posts failed to load:`, error);
      throw new Error(
        `The ${getPublicCategoryName(primaryCategory)} desk is temporarily unavailable.`,
        {
          cause: error,
        },
      );
    }
  },

  head: ({ loaderData, params }) => {
    const category = loaderData?.category;

    if (!category) {
      return {
        meta: [
          { title: "Section not found | ClearFact News" },
          { name: "robots", content: "noindex,follow" },
        ],
      };
    }

    const categoryName = category?.name?.trim() || "News";

    const categoryTitle =
      categoryName.toLowerCase() === "news"
        ? "Latest News | ClearFact News"
        : `${categoryName} News | ClearFact News`;

    const description =
      category?.description?.replace(/<[^>]+>/g, "") ||
      `Latest verified ${categoryName} reports from ClearFact News.`;

    const canonical = `https://clearfact.ng/category/${category?.slug || params.slug}`;
    return {
      meta: [
        { title: categoryTitle },
        { name: "description", content: description },
        {
          name: "robots",
          content:
            Number(category?.count ?? 0) >= MIN_INDEXABLE_CATEGORY_POSTS
              ? "index,follow,max-image-preview:large"
              : "noindex,follow",
        },
        { property: "og:title", content: categoryTitle },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },

  component: CategoryPage,
  notFoundComponent: () => (
    <>
      <title>Section not found | ClearFact News</title>
      <meta name="robots" content="noindex,follow" />

      <main className="container-news py-16">
        <h1 className="font-serif text-4xl font-bold">Section not found</h1>
        <p className="mt-3 text-muted-foreground">This news section does not exist.</p>
        <Link to="/" className="mt-6 inline-flex font-semibold text-primary hover:underline">
          Return to the latest news
        </Link>
      </main>
    </>
  ),
});

function CategoryPage() {
  const { category, posts } = Route.useLoaderData();
  const categoryName = category?.name ?? "News";

  return (
    <div className="container-news py-8 md:py-12">
      <div className="border-b-2 border-primary pb-3 mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Section</div>

        <h1 className="font-serif text-4xl md:text-5xl mt-1">{categoryName}</h1>

        <p className="text-muted-foreground mt-2 max-w-2xl">
          {category?.description
            ? stripHtml(category.description)
            : `Verified reports, context and public-interest updates from the ${categoryName} desk.`}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(posts) &&
          posts.map((post) => (
            <article
              key={post.id}
              className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              {getFeaturedImageUrl(post) && (
                <img
                  src={getFeaturedImageUrl(post, "", "medium_large")}
                  alt={stripHtml(post.title?.rendered)}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              )}

              <div className="p-4">
                <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                  <h2 className="font-serif text-xl hover:text-primary transition-colors">
                    {stripHtml(post.title.rendered)}
                  </h2>
                </Link>

                <div
                  className="text-sm text-muted-foreground mt-2 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: post.excerpt.rendered,
                  }}
                />
              </div>
            </article>
          ))}
      </div>

      {posts.length > 0 && <AdSense key={category.id} />}

      {posts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-2">No articles found</h3>

          <p className="text-muted-foreground">
            There are currently no published posts in this category.
          </p>
        </div>
      )}

      <div className="mt-16 rounded-2xl bg-primary text-white p-8 md:p-12 text-center">
        <h3 className="text-3xl font-bold mb-3">Stay Ahead with Verified News</h3>

        <p className="text-white/80 max-w-2xl mx-auto mb-6">
          Get trusted reports, investigations, fact-checks and breaking news delivered directly to
          your inbox.
        </p>

        <Link
          to="/newsletter"
          className="inline-flex bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}
