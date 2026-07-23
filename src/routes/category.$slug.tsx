import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { getCategories, getFeaturedImageUrl, getPostsByCategory } from "@/lib/wordpress";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const categories = await getCategories();
    const category = categories.find(
      (item: any) => item.slug.toLowerCase() === params.slug.toLowerCase(),
    );

    if (!category) {
      return { category: null, posts: [] };
    }

    const posts = await getPostsByCategory(category.id, 24);

    return {
      category,
      posts: Array.isArray(posts) ? posts : [],
    };
  },

  head: ({ loaderData, params }) => {
    const category = loaderData?.category;
    const categoryName = category?.name ?? "News";
    const description =
      category?.description?.replace(/<[^>]+>/g, "") ||
      `Latest verified ${categoryName} reports from ClearFact News.`;
    const canonical = `https://clearfact.ng/category/${params.slug}`;

    return {
      title: `${categoryName} News | ClearFact News`,
      meta: [
        { name: "description", content: description },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: `${categoryName} News` },
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
  const { category, posts } = Route.useLoaderData();

  return (
    <div className="container-news py-8 md:py-12">
      <div className="border-b-2 border-primary pb-3 mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Section</div>

        <h1 className="font-serif text-4xl md:text-5xl mt-1">{category?.name}</h1>

        <p className="text-muted-foreground mt-2 max-w-2xl">
          Latest stories from the {category?.name} desk.
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
                  src={getFeaturedImageUrl(post)}
                  alt={post.title?.rendered || ""}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}

              <div className="p-4">
                <Link to="/post/$slug" params={{ slug: post.slug }}>
                  <h2
                    className="font-serif text-xl hover:text-primary transition-colors"
                    dangerouslySetInnerHTML={{
                      __html: post.title.rendered,
                    }}
                  />
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
