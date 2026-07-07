import AdSense from "@/components/AdSense";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getPostBySlug,
  getPostsByCategory,
  getPosts,
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
      post.excerpt?.rendered?.replace(/<[^>]+>/g, "")?.slice(0, 160) || "";

    const image =
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

    const title = post.title.rendered.replace(/<[^>]+>/g, "");

    const schema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      description,
      image: image ? [image] : [],
      datePublished: post.date,
      dateModified: post.modified,
      author: {
        "@type": "Person",
        name: post._embedded?.author?.[0]?.name || "Emmanuel Sunday Tijwun",
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
      title: `${title} | ClearFact News`,

      meta: [
        {
          name: "robots",
          content: "index,follow,max-image-preview:large",
        },
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
          content: title,
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
          content: post._embedded?.author?.[0]?.name || "Emmanuel Sunday Tijwun",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: title,
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
    <div className="container-news py-16">Article not found.</div>
  ),
});

function ArticlePage() {
  const { post } = Route.useLoaderData();

  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [previousPost, setPreviousPost] = useState<any>(null);
  const [nextPost, setNextPost] = useState<any>(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;

      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    const loadRelatedAndNavigation = async () => {
      if (post?.categories?.length) {
        const related = await getPostsByCategory(post.categories[0]);

        setRelatedPosts(
          related
            .filter((item: any) => item.id !== post.id)
            .slice(0, 8)
        );
      }

      const allPosts = await getPosts();
      const currentIndex = allPosts.findIndex(
        (item: any) => item.id === post.id
      );

      setPreviousPost(allPosts[currentIndex + 1] || null);
      setNextPost(allPosts[currentIndex - 1] || null);
    };

    loadRelatedAndNavigation();
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

  const articleTitle = post.title.rendered.replace(/<[^>]+>/g, "");

  const categoryName =
    post._embedded?.["wp:term"]?.[0]?.[0]?.name || "News";

  const categorySlug =
    post._embedded?.["wp:term"]?.[0]?.[0]?.slug || "news";

  const authorName =
    post._embedded?.author?.[0]?.name || "ClearFact News";

  const authorDescription =
    post._embedded?.author?.[0]?.description ||
    `${authorName} writes for ClearFact News, an independent Nigerian newsroom committed to verified, transparent, and fact-based journalism.`;

  const headings = Array.from(
    cleanContent.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)
  ).map((match, index) => ({
    id: `section-${index + 1}`,
    title: match[1].replace(/<[^>]+>/g, ""),
  }));

  let headingIndex = 0;

  const contentWithIds = cleanContent.replace(/<h2([^>]*)>/g, () => {
    headingIndex += 1;
    return `<h2 id="section-${headingIndex}">`;
  });

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-red-600"
        style={{ width: `${progress}%` }}
      />

      <article className="container-news py-12 px-4 max-w-5xl mx-auto">
        <nav className="mb-5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span> / </span>
          <Link
            to="/category/$slug"
            params={{ slug: categorySlug }}
            className="hover:text-primary"
          >
            {categoryName}
          </Link>
          <span> / </span>
          <span>{articleTitle}</span>
        </nav>

        <div className="mb-4">
          <span className="inline-flex rounded-full bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
            {categoryName}
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
            By <strong>{authorName}</strong>
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
            )}{" "}
            min read
          </span>
        </div>

        {featuredImage && (
          <img
            src={featuredImage}
            alt={articleTitle}
            className="w-full rounded-xl mb-8"
            loading="eager"
          />
        )}

        {headings.length >= 2 && (
          <div className="border rounded-xl p-5 mb-8 bg-muted/30">
            <h3 className="font-bold mb-3">Table of Contents</h3>

            <ul className="space-y-2 text-sm">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="hover:text-primary">
                    {h.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
            __html: contentWithIds,
          }}
        />

        <div className="mt-10 border-t pt-6">
          <h3 className="font-bold text-xl mb-2">About the Author</h3>

          <p className="text-muted-foreground leading-7">
            {authorDescription}
          </p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold mb-4">Share this article</h3>

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
            <h2 className="text-2xl font-bold mb-6">Related News</h2>

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

        {(previousPost || nextPost) && (
          <div className="mt-12 grid gap-4 md:grid-cols-2 border-t pt-8">
            {previousPost && (
              <Link
                to="/post/$slug"
                params={{ slug: previousPost.slug }}
                className="border rounded-xl p-5 hover:border-primary hover:shadow-md"
              >
                <span className="text-sm text-muted-foreground">
                  ← Previous Article
                </span>

                <h3
                  className="font-semibold mt-2"
                  dangerouslySetInnerHTML={{
                    __html: previousPost.title.rendered,
                  }}
                />
              </Link>
            )}

            {nextPost && (
              <Link
                to="/post/$slug"
                params={{ slug: nextPost.slug }}
                className="border rounded-xl p-5 hover:border-primary hover:shadow-md md:text-right"
              >
                <span className="text-sm text-muted-foreground">
                  Next Article →
                </span>

                <h3
                  className="font-semibold mt-2"
                  dangerouslySetInnerHTML={{
                    __html: nextPost.title.rendered,
                  }}
                />
              </Link>
            )}
          </div>
        )}

        {typeof window !== "undefined" && <AdSense />}

        <div className="mt-10">
          <Link
            to="/"
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back to homepage
          </Link>
        </div>
      </article>
    </>
  );
}