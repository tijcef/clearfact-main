import { createFileRoute } from "@tanstack/react-router";
import { getPost } from "../lib/wordpress";

export const Route = createFileRoute(
  "/post/$slug"
)({
  component: PostPage,
});

async function PostPage() {
  const { slug } = Route.useParams();

  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="p-10">
        Post not found
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Featured Image */}
      <img
        src={
          post._embedded?.[
            "wp:featuredmedia"
          ]?.[0]?.source_url
        }
        alt=""
        className="w-full rounded-3xl mb-8 aspect-video object-cover"
      />

      {/* Categories */}
      <div className="flex gap-2 flex-wrap mb-4">

        {post._embedded?.["wp:term"]?.[0]?.map(
          (cat: any) => (
            <span
              key={cat.id}
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
            >
              {cat.name}
            </span>
          )
        )}

      </div>

      {/* Title */}
      <h1
        className="text-5xl font-black leading-tight"
        dangerouslySetInnerHTML={{
          __html: post.title.rendered,
        }}
      />

      {/* Meta */}
      <p className="text-gray-500 mt-5">
        {new Date(post.date).toDateString()}
      </p>

      <p className="text-gray-500 mt-1 mb-10">
        By{" "}
        {post._embedded?.author?.[0]?.name}
      </p>

      {/* Article Body */}
      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{
          __html: post.content.rendered,
        }}
      />

    </main>
  );
}