import { Link } from "@tanstack/react-router";

type Props = {
  title: string;
  slug: string;
  posts: any[];
};

export default function CategorySection({ title, slug, posts }: Props) {
  const items = posts.filter((post: any) =>
    post._embedded?.["wp:term"]?.[0]?.some(
      (cat: any) => cat.slug === slug
    )
  );

  if (!items.length) return null;

  return (
    <section className="mb-16">
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
          <article
            key={post.id}
            className="border rounded-2xl overflow-hidden"
          >
            <Link to="/post/$slug" params={{ slug: post.slug }}>
              <img
                src={
                  post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                  "https://via.placeholder.com/800x500"
                }
                alt=""
                className="w-full h-52 object-cover"
              />

              <div className="p-5">
                <h3
                  className="text-xl font-bold leading-tight"
                  dangerouslySetInnerHTML={{
                    __html: post.title.rendered,
                  }}
                />

                <p className="text-sm text-gray-500 mt-3">
                  {new Date(post.date).toDateString()}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}