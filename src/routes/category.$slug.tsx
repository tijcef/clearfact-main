import { Link } from "@tanstack/react-router";
import { createFileRoute, notFound } from "@tanstack/react-router";
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
      console.log("Current slug:", slug);

      const categories = await getCategories();
      console.log("Categories:", categories);

      const cat = categories.find(
        (c: any) => c.slug.toLowerCase() === slug.toLowerCase()
      );

      console.log("Found category:", cat);

      if (!cat) {
        setLoading(false);
        return;
      }

      setCategory(cat);

      const categoryPosts = await getPostsByCategory(cat.id);

console.log("SLUG:", slug);
console.log("CATEGORY:", cat);
console.log("POSTS:", categoryPosts);

setPosts(categoryPosts);

      console.log("Posts returned:", categoryPosts);

      setPosts(Array.isArray(categoryPosts) ? categoryPosts : []);
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
            className="border border-border rounded-sm overflow-hidden"
          >
            {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
              <img
                src={post._embedded["wp:featuredmedia"][0].source_url}
                alt=""
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4">
              <Link
  to="/post/$slug"
  params={{ slug: post.slug }}
>
  <h2
    className="font-serif text-xl hover:underline"
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
    </div>
  );
}