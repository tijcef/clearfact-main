import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";

import { VerificationBadge } from "@/components/site/VerificationBadge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  getAuthorById,
  getFeaturedImageUrl,
  getPostsByAuthor,
  normalizeWpSlug,
  stripHtml,
  type WordPressAuthor,
} from "@/lib/wordpress";

type Article = Database["public"]["Tables"]["articles"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type WordPressAuthorData = {
  author: WordPressAuthor;
  posts: any[];
};

export const Route = createFileRoute("/author/$id")({
  loader: async ({ params }) => {
    const authorId = Number(params.id);

    if (!Number.isInteger(authorId) || authorId <= 0) {
      return { wordpress: null as WordPressAuthorData | null };
    }

    const [authorResult, postsResult] = await Promise.allSettled([
      getAuthorById(authorId),
      getPostsByAuthor(authorId, 50),
    ]);

    const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
    const embeddedAuthor = posts[0]?._embedded?.author?.[0];
    const author =
      authorResult.status === "fulfilled"
        ? authorResult.value
        : embeddedAuthor
          ? {
              id: authorId,
              name: embeddedAuthor.name,
              slug: embeddedAuthor.slug || String(authorId),
              description: embeddedAuthor.description,
              avatar_urls: embeddedAuthor.avatar_urls,
            }
          : null;

    return {
      wordpress: author ? ({ author, posts } satisfies WordPressAuthorData) : null,
    };
  },

  head: ({ loaderData }) => {
    const data = loaderData?.wordpress;

    if (!data) {
      return {
        meta: [
          { title: "Author profile — ClearFact News" },
          { name: "description", content: "ClearFact News contributor profile and reports." },
          { name: "robots", content: "noindex,follow" },
        ],
      };
    }

    const { author, posts } = data;
    const description =
      stripHtml(author.description || "") ||
      `Read verified reports by ${author.name} for ClearFact News.`;
    const canonical = `https://clearfact.ng/author/${author.id}`;
    const avatar = author.avatar_urls?.["96"] || author.avatar_urls?.["48"];
    const isSubstantialProfile = description.length >= 100 && posts.length >= 3;
    const schema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: canonical,
      mainEntity: {
        "@type": "Person",
        name: author.name,
        description,
        ...(avatar ? { image: avatar } : {}),
        worksFor: {
          "@type": "NewsMediaOrganization",
          "@id": "https://clearfact.ng/#organization",
          name: "ClearFact News",
        },
      },
    };

    return {
      meta: [
        { title: `${author.name} — ClearFact News` },
        { name: "description", content: description.slice(0, 160) },
        {
          name: "robots",
          content: isSubstantialProfile ? "index,follow" : "noindex,follow",
        },
        { property: "og:title", content: `${author.name} — ClearFact News` },
        { property: "og:description", content: description.slice(0, 160) },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: canonical },
        ...(avatar ? [{ property: "og:image", content: avatar }] : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(schema),
        },
      ],
    };
  },

  component: AuthorPage,
  notFoundComponent: () => <div className="container-news py-16">Author not found.</div>,
});

function AuthorPage() {
  const { wordpress } = Route.useLoaderData();

  if (wordpress) {
    return <WordPressAuthorPage data={wordpress} />;
  }

  return <ContributorAuthorPage />;
}

function WordPressAuthorPage({ data }: { data: WordPressAuthorData }) {
  const { author, posts } = data;
  const avatar = author.avatar_urls?.["96"] || author.avatar_urls?.["48"];

  return (
    <main className="container-news py-10 md:py-14">
      <header className="flex items-start gap-5 border-b border-border pb-7">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground">
          {avatar ? (
            <img src={avatar} alt={author.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            ClearFact author
          </p>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">{author.name}</h1>

          {author.description ? (
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {stripHtml(author.description)}
            </p>
          ) : (
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              Reporting and analysis published by {author.name} for ClearFact News.
            </p>
          )}

          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">
            {posts.length} published report{posts.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <section className="mt-9" aria-labelledby="author-reports">
        <h2 id="author-reports" className="font-serif text-3xl font-bold">
          Reports by {author.name}
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              {getFeaturedImageUrl(post) && (
                <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                  <img
                    src={getFeaturedImageUrl(post, "", "medium_large")}
                    alt={stripHtml(post.title?.rendered || "")}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-full object-cover"
                  />
                </Link>
              )}

              <div className="p-5">
                <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                  <h3 className="font-serif text-xl font-bold hover:text-primary">
                    {stripHtml(post.title?.rendered || "")}
                  </h3>
                </Link>

                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ContributorAuthorPage() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    void (async () => {
      const { data: contributorProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();
      setProfile(contributorProfile ?? null);

      const { data: publishedArticles } = await supabase
        .from("articles")
        .select("*")
        .eq("author_id", id)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);
      setArticles(publishedArticles ?? []);
    })();
  }, [id]);

  if (profile === undefined) {
    return (
      <div className="container-news flex items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading author…
      </div>
    );
  }

  if (profile === null && articles.length === 0) throw notFound();

  const name = profile?.display_name || articles[0]?.author_name || "ClearFact Newsroom";

  return (
    <main className="container-news py-10">
      <header className="flex items-start gap-5 border-b border-border pb-6">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl">{name}</h1>
          {profile?.bio && <p className="mt-2 max-w-2xl text-muted-foreground">{profile.bio}</p>}
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {articles.length} verified report{articles.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.id} className="border-b border-border pb-5">
            {article.cover_image && (
              <Link to="/post/$slug" params={{ slug: article.slug }}>
                <img
                  src={article.cover_image}
                  alt={article.title}
                  loading="lazy"
                  className="mb-3 aspect-[16/10] w-full rounded-sm object-cover"
                />
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {article.category}
              </span>
              <VerificationBadge status={article.verification} />
            </div>
            <Link to="/post/$slug" params={{ slug: article.slug }}>
              <h2 className="mt-1 font-serif text-xl decoration-gold underline-offset-4 hover:underline">
                {article.title}
              </h2>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
