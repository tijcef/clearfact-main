import { Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getFeaturedImageUrl, normalizeWpSlug, stripHtml, isVideoPost } from "@/lib/wordpress";

type Props = {
  title: string;
  slug: string;
  posts: any[];
  prefiltered?: boolean;
};

export default function CategorySection({ title, slug, posts, prefiltered = false }: Props) {
  const items = prefiltered
    ? posts
    : posts.filter((post: any) =>
        post._embedded?.["wp:term"]?.[0]?.some((cat: any) => cat.slug === slug),
      );

  if (!items.length) return null;

  return (
    <section className="content-auto mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-black">{title}</h2>

        <Link
          to="/category/$slug"
          params={{ slug }}
          className="text-blue-600 font-semibold hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.slice(0, 3).map((post: any) => (
          <article key={post.id} className="border rounded-2xl overflow-hidden">
            <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
              <div className="relative">
                <img
                  src={getFeaturedImageUrl(post, "/logo.jpg", "medium_large")}
                  alt={stripHtml(post.title.rendered)}
                  className="w-full h-52 object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />

                {(slug === "video" || isVideoPost(post)) && (
                  <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white shadow-lg">
                      <Play className="h-6 w-6 fill-current" />
                    </span>
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold leading-tight">
                  {stripHtml(post.title.rendered)}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Africa/Lagos",
                  })}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
