import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/post/$slug")({
  component: PostPage,
});

const API =
  "https://cms.tijcef.org/wp/wp-json/wp/v2/posts?_embed";

async function getPost(slug: string) {
  const response = await fetch(
    `${API}&slug=${slug}`
  );

  const data = await response.json();

  return data[0];
}

function PostPage() {
  const { slug } = Route.useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PostContent slug={slug} />
    </div>
  );
}

async function PostContent({
  slug,
}: {
  slug: string;
}) {
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="text-3xl font-bold">
        Post not found
      </div>
    );
  }

  return (
    <article>
      <img
        src={
          post._embedded?.["wp:featuredmedia"]?.[0]
            ?.source_url ||
          "https://via.placeholder.com/1200x700"
        }
        alt=""
        className="w-full rounded-xl mb-8"
      />

      <h1
        className="text-5xl font-bold mb-6"
        dangerouslySetInnerHTML={{
          __html: post.title.rendered,
        }}
      />

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{
          __html: post.content.rendered,
        }}
      />
    </article>
  );
}