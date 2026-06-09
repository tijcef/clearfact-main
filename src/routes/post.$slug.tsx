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
    meta: [
      {
        title: `${loaderData.post.title.rendered} | ClearFact News`,
      },
      {
        name: "description",
        content:
          loaderData.post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, "")
            ?.slice(0, 160) ||
          "Latest verified news from ClearFact News",
      },
      {
        property: "og:type",
        content: "article",
      },
      {
        property: "og:title",
        content: loaderData.post.title.rendered,
      },
      {
        property: "og:description",
        content:
          loaderData.post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, "")
            ?.slice(0, 160) ||
          "Latest verified news from ClearFact News",
      },
      {
        property: "og:url",
        content: `https://clearfact.ng/post/${loaderData.post.slug}`,
      },
      {
  property: "og:image",
  content:
    loaderData.post._embedded?.["wp:featuredmedia"]?.[0]
      ?.source_url || "",
},
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: `https://clearfact.ng/post/${loaderData.post.slug}`,
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
  post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

const contentParts =
  post.content.rendered.split("</p>");

return (
  <article className="container-news py-10 max-w-4xl">
    <h1
  className="font-serif text-4xl md:text-5xl mb-4"
  dangerouslySetInnerHTML={{
    __html: post.title.rendered,
  }}
/>

    <div className="text-sm text-muted-foreground mb-6">
      {new Date(post.date).toLocaleDateString()}
    </div>

    {featuredImage && (
      <img
        src={featuredImage}
        alt={post.title.rendered}
        className="w-full rounded-sm mb-8"
      />
    )}

    <AdSense />

    <div className="prose prose-lg max-w-none">
      {contentParts.map((part: string, index: number) => (
        <div key={index}>
          <div
            dangerouslySetInnerHTML={{
              __html: part + "</p>",
            }}
          />

          {index === 4 && <AdSense />}
          {index === 10 && <AdSense />}
          {index === 16 && <AdSense />}
        </div>
      ))}
    </div>

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