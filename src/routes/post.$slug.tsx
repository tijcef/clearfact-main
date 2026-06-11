import AdSense from "@/components/AdSense";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getPostBySlug,
  getPostsByCategory,
} from "@/lib/wordpress";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    const post = await getPostBySlug(params.slug);

    if (!post) {
      throw notFound();
    }

    return { post };
  },

  component: ArticlePage,

 head: ({ loaderData }) => ({
  title: `${loaderData.post.title.rendered} | ClearFact News`,
  meta: [
    {
      name: "description",
      content:
        loaderData.post.excerpt?.rendered
          ?.replace(/<[^>]+>/g, "")
          ?.slice(0, 160) || "",
    },
  ],
}),

  notFoundComponent: () => (
    <div className="container-news py-16">
      Article not found.
    </div>
  ),
});

function ArticlePage() {
const { post } = Route.useLoaderData();
const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
useEffect(() => {
  const loadRelated = async () => {
    if (post?.categories?.length) {
      const related = await getPostsByCategory(
        post.categories[0]
      );

      setRelatedPosts(
        related
          .filter((item: any) => item.id !== post.id)
          .slice(0, 4)
      );
    }
  };

  loadRelated();
}, [post]);

if (post === null) {
throw notFound();
}

const featuredImage =
  post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

const cleanContent = post.content.rendered
  .replace(/<div[^>]*wp-block-spacer[^>]*>.*?<\/div>/gis, "")
  .replace(/style="height:[^"]*"/gi, "");

return (
  <article className="container-news py-12 px-4 max-w-5xl mx-auto">
    <div className="mb-4">
      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
        Latest News
      </span>
    </div>

    <h1
      className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6"
      dangerouslySetInnerHTML={{
        __html: post.title.rendered,
      }}
    />

    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-8 border-b pb-4">
      <span>
        By{" "}
        <strong>
          {post._embedded?.author?.[0]?.name || "ClearFact News"}
        </strong>
      </span>

      <span>•</span>

      <time dateTime={post.date}>
        {new Date(post.date).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </time>

      <span>•</span>

      <span>5 min read</span>
    </div>

    {featuredImage && (
  <img
    src={featuredImage}
    alt={post.title.rendered}
    className="w-full rounded-lg mb-2"
    loading="eager"
  />
)}

<div
  className="
    prose
    prose-lg
    lg:prose-xl
    max-w-none
    prose-p:leading-8
    prose-p:mb-7
    prose-h2:mt-12
    prose-h2:mb-6
    prose-h2:text-3xl
    prose-h2:font-bold
    prose-h3:mt-10
    prose-h3:mb-4
    prose-blockquote:border-l-4
    prose-blockquote:pl-4
  "
  dangerouslySetInnerHTML={{
    __html: cleanContent,
  }}
/>

    <AdSense />

    {relatedPosts.length > 0 && (
      <section className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Related News
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {relatedPosts.map((item: any) => (
            <Link
              key={item.id}
              to="/post/$slug"
              params={{ slug: item.slug }}
              className="block border rounded-lg p-4 hover:bg-muted"
            >
              <h3
                className="font-semibold"
                dangerouslySetInnerHTML={{
                  __html: item.title.rendered,
                }}
              />
            </Link>
          ))}
        </div>
      </section>
    )}

    <div className="mt-10">
      <Link
        to="/"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Back to homepage
      </Link>
    </div>
  </article>
);
}