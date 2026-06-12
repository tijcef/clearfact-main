import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCategories, getPostsByCategory } from "@/lib/wordpress";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();

  const [category, setCategory] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await getCategories();

        const cat = categories.find(
          (c: any) => c.slug.toLowerCase() === slug.toLowerCase()
        );

        if (!cat) {
          setLoading(false);
          return;
        }

        setCategory(cat);

        const categoryPosts = await getPostsByCategory(cat.id);

        setPosts(
          Array.isArray(categoryPosts) ? categoryPosts : []
        );
      } catch (error) {
        console.error("CATEGORY ERROR:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-news py-12">
        Loading...
      </div>
    );
  }

  return (
    <div className="container-news py-8 md:py-12">
      <div className="border-b-2 border-primary pb-3 mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Section
        </div>

        <h1 className="font-serif text-4xl md:text-5xl mt-1">
          {category?.name}
        </h1>

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
              {post._embedded?.["wp:featuredmedia"]?.[0]
                ?.source_url && (
                <img
                  src={
                    post._embedded["wp:featuredmedia"][0]
                      .source_url
                  }
                  alt={post.title?.rendered || ""}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4">
                <Link
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                >
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
          <h3 className="text-2xl font-semibold mb-2">
            No articles found
          </h3>

          <p className="text-muted-foreground">
            There are currently no published posts in this
            category.
          </p>
        </div>
      )}

      <div className="mt-16 rounded-2xl bg-primary text-white p-8 md:p-12 text-center">
        <h3 className="text-3xl font-bold mb-3">
          Stay Ahead with Verified News
        </h3>

        <p className="text-white/80 max-w-2xl mx-auto mb-6">
          Get trusted reports, investigations, fact-checks and
          breaking news delivered directly to your inbox.
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