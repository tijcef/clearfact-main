import AdSense from "@/components/AdSense";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getPostBySlug,
  getPostsByCategory,
} from "@/lib/wordpress";
import Comments from "@/components/Comments";

import {
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    const post = await getPostBySlug(params.slug);

    if (!post) {
      throw notFound();
    }

    return { post };
  },

  component: ArticlePage,

head: ({ loaderData }) => {
  const post = loaderData.post;

  const description =
    post.excerpt?.rendered
      ?.replace(/<[^>]+>/g, "")
      ?.slice(0, 160) || "";

  const image =
    post._embedded?.["wp:featuredmedia"]?.[0]
      ?.source_url || "";

  const schema = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",

  headline: post.title.rendered.replace(/<[^>]+>/g, ""),

  description,

  image: [image],

  datePublished: post.date,

  dateModified: post.modified,
    author: {
      "@type": "Person",
      name:
        post._embedded?.author?.[0]?.name ||
        "Emmanuel Tijwun",
    },
    publisher: {
  "@type": "Organization",
  name: "ClearFact News",
  url: "https://clearfact.ng",
  logo: {
    "@type": "ImageObject",
    url: "https://clearfact.ng/logo.png",
  },
},
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://clearfact.ng/post/${post.slug}`,
    },
  };

  return {
    title: `${post.title.rendered} | ClearFact News`,

    meta: [
      {
        name: "description",
        content: description,
      },

      {
        property: "og:type",
        content: "article",
      },

      {
        property: "og:title",
        content: post.title.rendered,
      },

      {
        property: "og:description",
        content: description,
      },

      {
        property: "og:url",
        content: `https://clearfact.ng/post/${post.slug}`,
      },

      {
        property: "og:image",
        content: image,
      },

      {
        property: "article:published_time",
        content: post.date,
      },

      {
        property: "article:modified_time",
        content: post.modified,
      },

      {
        property: "article:author",
        content:
          post._embedded?.author?.[0]?.name ||
          "Emmanuel Sunday Tijwun",
      },

      {
        name: "twitter:card",
        content: "summary_large_image",
      },

      {
        name: "twitter:title",
        content: post.title.rendered,
      },

      {
        name: "twitter:description",
        content: description,
      },

      {
        name: "twitter:image",
        content: image,
      },
    ],

    links: [
      {
        rel: "canonical",
        href: `https://clearfact.ng/post/${post.slug}`,
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(schema),
      },
    ],
  };
},

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
          .slice(0, 8)
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

const articleUrl = `https://clearfact.ng/post/${post.slug}`;

const articleTitle = post.title.rendered.replace(
  /<[^>]+>/g,
  ""
);

return (
  <article className="container-news py-12 px-4 max-w-5xl mx-auto">
    <div className="mb-4">
      <span className="inline-flex rounded-full bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
  {post._embedded?.["wp:term"]?.[0]?.[0]?.name || "News"}
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

      <span>
  {Math.max(
    1,
    Math.ceil(
      post.content.rendered
        .replace(/<[^>]+>/g, "")
        .split(" ").length / 200
    )
  )} min read
</span>
    </div>

  {featuredImage && (
  <img
    src={featuredImage}
    alt={post.title.rendered}
    className="w-full rounded-xl mb-8"
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

    <div className="mt-8 border-t pt-6">
  <h3 className="font-semibold mb-4">
    Share this article
  </h3>

  <div className="flex items-center gap-5">
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on Facebook"
    >
      <FaFacebook size={24} />
    </a>

    <a
      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on X"
    >
      <FaXTwitter size={24} />
    </a>

    <a
      href={`https://wa.me/?text=${encodeURIComponent(articleTitle + " " + articleUrl)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on WhatsApp"
    >
      <FaWhatsapp size={24} />
    </a>

    <a
  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Share on LinkedIn"
    >
      <FaLinkedin size={24} />
    </a>
  </div>
</div>

<Comments postId={post.id} />

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
      className="block border border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all duration-300 bg-card"
    >
      {item._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
        <img
          src={item._embedded["wp:featuredmedia"][0].source_url}
          alt=""
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-5">
        <h3
          className="font-semibold"
          dangerouslySetInnerHTML={{
            __html: item.title.rendered,
          }}
        />
      </div>
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