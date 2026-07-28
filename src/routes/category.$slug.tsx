import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getCategoryBySlug,
  getFeaturedImageUrl,
  getPostsByCategory,
  normalizeWpSlug,
  stripHtml,
} from "@/lib/wordpress";

const CATEGORY_ALIASES: Record<string, string[]> = {
  "accountability-journalism": ["accountability-journalism", "accountability"],
};

function categoryLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    try {
      const acceptedSlugs = CATEGORY_ALIASES[params.slug] ?? [params.slug];
      const categoryResults = await Promise.all(
        acceptedSlugs.map((slug) => getCategoryBySlug(slug)),
      );
      const category = categoryResults.find(Boolean);

      if (!category) {
        return { category: null, posts: [], unavailable: false };
      }

      const posts = await getPostsByCategory(category.id, 24);

      return {
        category,
        posts: Array.isArray(posts) ? posts : [],
        unavailable: false,
      };
    } catch (error) {
      console.error(`Category ${params.slug} failed to load:`, error);

      return {
        category: {
          id: 0,
          name: categoryLabel(params.slug),
          slug: params.slug,
          description: "",
        },
        posts: [],
        unavailable: true,
      };
    }
  },

  head: ({ loaderData, params }) => {
  const category = loaderData?.category;
  const categoryName = category?.name?.trim() || "News";

  const categoryTitle =
    categoryName.toLowerCase() === "news"
      ? "Latest News | ClearFact News"
      : `${categoryName} News | ClearFact News`;

  const description =
    category?.description?.replace(/<[^>]+>/g, "") ||
    `Latest verified ${categoryName} reports from ClearFact News.`;

  const canonical = `https://clearfact.ng/category/${params.slug}`;

  return {
    meta: [
      { title: categoryTitle },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large" },
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
});

function CategoryPage() {
  const { category, posts, unavailable } = Route.useLoaderData();
  const categoryName = category?.name ?? "News";
  const router = useRouter();
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    if (!unavailable || posts.length > 0 || retryAttempt >= 2) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        void router.invalidate().finally(() => {
          setRetryAttempt((attempt) => attempt + 1);
        });
      },
      retryAttempt === 0 ? 400 : 1_200,
    );

    return () => window.clearTimeout(timeout);
  }, [posts.length, retryAttempt, router, unavailable]);

  return (
    <div className="container-news py-8 md:py-12">
      <div className="border-b-2 border-primary pb-3 mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Section</div>

        <h1 className="font-serif text-4xl md:text-5xl mt-1">{categoryName}</h1>

        <p className="text-muted-foreground mt-2 max-w-2xl">
          Latest stories from the {categoryName} desk.
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

      {posts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-2">
            {unavailable && retryAttempt < 2
              ? `Loading the latest ${categoryName} reports…`
              : unavailable
                ? "The newsroom feed needs another moment"
                : "No articles found"}
          </h3>

          <p className="text-muted-foreground">
            {unavailable && retryAttempt < 2
              ? "ClearFact is reconnecting automatically. You do not need to refresh the page."
              : unavailable
                ? "Please retry this section."
                : "There are currently no published posts in this category."}
          </p>

          {unavailable && retryAttempt >= 2 && (
            <button
              type="button"
              className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              onClick={() => {
                setRetryAttempt(0);
                void router.invalidate();
              }}
            >
              Retry latest reports
            </button>
          )}
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
