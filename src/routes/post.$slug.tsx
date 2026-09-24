import AdSense from "@/components/AdSense";
import { createFileRoute, notFound, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getAdjacentPosts,
  getFeaturedImageUrl,
  getPublicPostPath,
  getPostBySlug,
  getRelatedPosts,
  normalizeWpSlug,
  proxyWpMediaInHtml,
  stripHtml,
} from "@/lib/wordpress";
import Comments from "@/components/Comments";

import { FaFacebook, FaLinkedin, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    let post;

    try {
      post = await getPostBySlug(params.slug);
    } catch (error) {
      console.error(`Article ${params.slug} failed to load:`, error);

      return {
        post: null,
        unavailable: true,
      };
    }

    if (!post) {
      throw notFound();
    }

    return {
      post,
      unavailable: false,
    };
  },

  component: ArticlePage,

  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {};
    }

    const post = loaderData.post;

    const description = post.excerpt?.rendered?.replace(/<[^>]+>/g, "")?.slice(0, 160) || "";

    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

    const title = stripHtml(post.title.rendered);

    const articleUrl = `https://clearfact.ng${getPublicPostPath(post.slug)}`;

    const category = post._embedded?.["wp:term"]?.[0]?.[0];

    const categoryName = category?.name || "News";
    const categorySlug = category?.slug || "news";

    const authorName =
      post._embedded?.author?.[0]?.name || post.authors?.[0]?.display_name || "ClearFact News";

    const schema = {
      "@context": "https://schema.org",

      "@graph": [
        {
          "@type": "NewsArticle",
          "@id": `${articleUrl}#article`,

          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },

          headline: title,
          description,
          image: image ? [image] : [],
          datePublished: post.date,
          dateModified: post.modified,
          articleSection: categoryName,

          author: {
            "@type": "Person",
            name: authorName,
          },

          publisher: {
            "@type": "NewsMediaOrganization",
            "@id": "https://clearfact.ng/#organization",
            name: "ClearFact News",
            legalName: "Clearfact Media Ltd",
            url: "https://clearfact.ng/",

            logo: {
              "@type": "ImageObject",
              url: "https://clearfact.ng/logo.jpg",
            },
          },

          isAccessibleForFree: true,
        },

        {
          "@type": "BreadcrumbList",
          "@id": `${articleUrl}#breadcrumb`,

          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://clearfact.ng/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: categoryName,
              item: `https://clearfact.ng/category/${categorySlug}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: articleUrl,
            },
          ],
        },
      ],
    };

    return {
      meta: [
        { title: `${title} | ClearFact News` },
        { name: "description", content: description },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: articleUrl },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: articleUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(schema),
        },
      ],
    };
  },

  notFoundComponent: () => <div className="container-news py-16">Article not found.</div>,
});

function ArticlePage() {
  const { post, unavailable } = Route.useLoaderData();

  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [previousPost, setPreviousPost] = useState<any>(null);
  const [nextPost, setNextPost] = useState<any>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;

      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    if (!post) {
      return;
    }

    const loadRelatedAndNavigation = async () => {
      try {
        const [related, adjacent] = await Promise.all([
          post?.categories?.length
            ? getRelatedPosts(post.categories[0], post.id, 8)
            : Promise.resolve([]),
          getAdjacentPosts(post.date_gmt || post.date, post.id),
        ]);

        setRelatedPosts(related);
        setPreviousPost(adjacent.previousPost);
        setNextPost(adjacent.nextPost);
      } catch (error) {
        console.error("Failed to load related articles:", error);
      }
    };

    void loadRelatedAndNavigation();
  }, [post]);

  useEffect(() => {
    if (!unavailable || post || retryAttempt >= 2) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        void router.invalidate().finally(() => {
          setRetryAttempt((attempt) => attempt + 1);
        });
      },
      retryAttempt === 0 ? 500 : 1_500,
    );

    return () => window.clearTimeout(timeout);
  }, [post, retryAttempt, router, unavailable]);

  if (!post) {
    return (
      <main className="container-news py-12">
        <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
            ClearFact Newsroom
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold">
            {retryAttempt < 2 ? "Opening this report…" : "This report needs another moment"}
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            {retryAttempt < 2
              ? "The newsroom is reconnecting automatically. You do not need to refresh the page."
              : "The news server is responding slowly. Try the report again while ClearFact keeps the rest of the site available."}
          </p>

          {retryAttempt >= 2 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                onClick={() => {
                  setRetryAttempt(0);
                  void router.invalidate();
                }}
              >
                Retry report
              </button>

              <Link
                to="/"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold"
              >
                Latest news
              </Link>
            </div>
          )}
        </section>
      </main>
    );
  }

  const featuredImage = getFeaturedImageUrl(post, "", "large");

  const cleanContent = proxyWpMediaInHtml(
    post.content.rendered
      .replace(/<div[^>]*wp-block-spacer[^>]*>.*?<\/div>/gis, "")
      .replace(/style="height:[^"]*"/gi, ""),
  );

  const articleUrl = `https://clearfact.ng${getPublicPostPath(post.slug)}`;

  const articleTitle = stripHtml(post.title.rendered);

  const categoryName = post._embedded?.["wp:term"]?.[0]?.[0]?.name || "News";

  const categorySlug = post._embedded?.["wp:term"]?.[0]?.[0]?.slug || "news";

  const authorName =
    post._embedded?.author?.[0]?.name || post.authors?.[0]?.display_name || "ClearFact News";

  const authorDescription =
    post._embedded?.author?.[0]?.description ||
    post.authors?.[0]?.description ||
    `${authorName} writes for ClearFact News, an independent Nigerian newsroom committed to verified, transparent, and fact-based journalism.`;

  const headings = Array.from(cleanContent.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)).map(
    (match, index) => ({
      id: `section-${index + 1}`,
      title: stripHtml(match[1]),
    }),
  );

  let headingIndex = 0;

  const contentWithIds = cleanContent.replace(/<h2([^>]*)>/g, () => {
    headingIndex += 1;
    return `<h2 id="section-${headingIndex}">`;
  });

  return (
    <>
      <div className="fixed top-0 left-0 z-50 h-1 bg-red-600" style={{ width: `${progress}%` }} />

      <article className="container-news py-12 px-4 max-w-5xl mx-auto">
        <nav className="mb-5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span> / </span>
          <Link to="/category/$slug" params={{ slug: categorySlug }} className="hover:text-primary">
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

        <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
          {articleTitle}
        </h1>

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
              Math.ceil(post.content.rendered.replace(/<[^>]+>/g, "").split(" ").length / 200),
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
            decoding="async"
            fetchPriority="high"
            sizes="(min-width: 1024px) 960px, 100vw"
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

          <p className="text-muted-foreground leading-7">{authorDescription}</p>
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
                  params={{ slug: normalizeWpSlug(item.slug) }}
                  className="block border border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all duration-300 bg-card"
                >
                  {getFeaturedImageUrl(item) && (
                    <img
                      src={getFeaturedImageUrl(item, "", "medium_large")}
                      alt={stripHtml(item.title.rendered)}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  )}

                  <div className="p-5">
                    <h3 className="font-semibold">{stripHtml(item.title.rendered)}</h3>
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
                params={{ slug: normalizeWpSlug(previousPost.slug) }}
                className="border rounded-xl p-5 hover:border-primary hover:shadow-md"
              >
                <span className="text-sm text-muted-foreground">← Previous Article</span>

                <h3 className="font-semibold mt-2">{stripHtml(previousPost.title.rendered)}</h3>
              </Link>
            )}

            {nextPost && (
              <Link
                to="/post/$slug"
                params={{ slug: normalizeWpSlug(nextPost.slug) }}
                className="border rounded-xl p-5 hover:border-primary hover:shadow-md md:text-right"
              >
                <span className="text-sm text-muted-foreground">Next Article →</span>

                <h3 className="font-semibold mt-2">{stripHtml(nextPost.title.rendered)}</h3>
              </Link>
            )}
          </div>
        )}

        <AdSense />

        <div className="mt-10">
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">
            ← Back to homepage
          </Link>
        </div>
      </article>
    </>
  );
}
