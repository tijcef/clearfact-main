import { Link, createFileRoute } from "@tanstack/react-router";
import { getFeaturedImageUrl, getPosts, normalizeWpSlug, stripHtml } from "../lib/wordpress";
import CategorySection from "@/components/home/CategorySection";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const posts = await getPosts(24);

      return {
        posts: Array.isArray(posts) ? posts : [],
      };
    } catch (error) {
      console.error("Homepage posts failed to load:", error);
      throw new Error("The ClearFact newsroom is temporarily unavailable.", {
        cause: error,
      });
    }
  },

  head: () => {
    const schema = {
      "@context": "https://schema.org",

      "@graph": [
        {
          "@type": "NewsMediaOrganization",
          "@id": "https://clearfact.ng/#organization",

          name: "ClearFact News",
          legalName: "ClearFact Media Ltd",
          url: "https://clearfact.ng/",

          logo: {
            "@type": "ImageObject",
            url: "https://clearfact.ng/logo.jpg",
          },

          description:
            "ClearFact News is an independent Nigerian newsroom delivering verified, transparent and timely journalism.",

          email: "info@clearfact.ng",

          address: {
            "@type": "PostalAddress",
            streetAddress: "32 Demsawo, Jimeta",
            addressLocality: "Yola",
            addressRegion: "Adamawa State",
            addressCountry: "NG",
          },

          sameAs: [
            "https://facebook.com/clearfactng",
            "https://x.com/clearfactng",
            "https://instagram.com/clearfactng",
            "https://youtube.com/@clearfactng",
            "https://linkedin.com/company/clearfact-news",
          ],
        },

        {
          "@type": "WebSite",
          "@id": "https://clearfact.ng/#website",

          url: "https://clearfact.ng/",
          name: "ClearFact News",
          alternateName: "ClearFact",

          inLanguage: "en-NG",

          publisher: {
            "@id": "https://clearfact.ng/#organization",
          },

          potentialAction: {
            "@type": "SearchAction",
            target: "https://clearfact.ng/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };

    return {
      meta: [
        {
          title: "ClearFact News | Verified Journalism From Nigeria",
        },
        {
          name: "description",
          content:
            "ClearFact News delivers verified, transparent and timely journalism from Nigeria.",
        },
        {
          name: "robots",
          content: "index,follow,max-image-preview:large",
        },
        {
          property: "og:title",
          content: "ClearFact News",
        },
        {
          property: "og:description",
          content: "Verified journalism from Nigeria.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:url",
          content: "https://clearfact.ng/",
        },
        {
          property: "og:image",
          content: "https://clearfact.ng/logo.jpg",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: "ClearFact News",
        },
        {
          name: "twitter:description",
          content: "Verified journalism from Nigeria.",
        },
        {
          name: "twitter:image",
          content: "https://clearfact.ng/logo.jpg",
        },
      ],

      links: [
        {
          rel: "canonical",
          href: "https://clearfact.ng/",
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

  component: Home,
});

function Home() {
  const { posts } = Route.useLoaderData();

  if (!posts.length) {
    return (
      <main className="container-news py-10">
        <section className="rounded-2xl border border-border bg-muted/40 p-8 text-center md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
            ClearFact Newsroom
          </p>
          <h1 className="mt-3 text-3xl font-black">Verified reporting is being refreshed</h1>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The newsroom feed is taking longer than expected. This page will recover automatically;
            you can also try again now.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Refresh latest stories
          </a>
        </section>
      </main>
    );
  }

  const heroPost = posts[0];
  const topStories = posts.slice(1, 5);
  const latestPosts = posts.slice(5, 11);

  const trendingPosts = posts.filter((post: any) => post.acf?.trending);

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-600 text-white";
      case "Fact-Checked":
        return "bg-blue-600 text-white";
      case "Developing":
        return "bg-yellow-500 text-black";
      case "Opinion":
        return "bg-purple-600 text-white";
      case "Breaking":
        return "bg-red-600 text-white";
      case "False Claim":
        return "bg-red-800 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <main className="container-news py-6">
      <section className="mb-14 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[1.35fr_0.9fr]">
        <Link
          to="/post/$slug"
          params={{ slug: normalizeWpSlug(heroPost.slug) }}
          className="block min-h-72 overflow-hidden bg-muted lg:min-h-[470px]"
        >
          <img
            src={getFeaturedImageUrl(heroPost, "/logo.jpg", "large")}
            alt={stripHtml(heroPost.title.rendered)}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.015]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="(min-width: 1024px) 62vw, 100vw"
          />
        </Link>

        <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-red-600">
            Lead Story
          </p>
          <div className="flex gap-2 flex-wrap mb-4">
            {heroPost._embedded?.["wp:term"]?.[0]?.map((cat: any) => (
              <span
                key={cat.id}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
              >
                {cat.name}
              </span>
            ))}

            {heroPost.acf?.verification_status && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${getVerificationColor(
                  heroPost.acf.verification_status,
                )}`}
              >
                {heroPost.acf.verification_status}
              </span>
            )}
          </div>

          <Link to="/post/$slug" params={{ slug: normalizeWpSlug(heroPost.slug) }}>
            <h1 className="text-balance font-serif text-3xl font-black leading-[1.06] hover:underline sm:text-4xl lg:text-5xl">
              {stripHtml(heroPost.title.rendered)}
            </h1>
          </Link>

          <p className="mt-5 text-sm text-muted-foreground">
            {new Date(heroPost.date).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Africa/Lagos",
            })}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            By{" "}
            {heroPost._embedded?.author?.[0]?.name ||
              heroPost.authors?.[0]?.display_name ||
              "ClearFact News"}
          </p>

          <div
            className="mt-5 line-clamp-4 text-base leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: heroPost.excerpt.rendered,
            }}
          />
        </div>
      </section>

      {topStories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-4xl font-black mb-8">Top Stories</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topStories.map((post: any) => (
              <article key={post.id} className="border rounded-2xl overflow-hidden">
                <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                  <img
                    src={getFeaturedImageUrl(post, "/logo.jpg", "medium_large")}
                    alt={stripHtml(post.title.rendered)}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />

                  <div className="p-4">
                    <h3 className="text-lg font-bold leading-tight">
                      {stripHtml(post.title.rendered)}
                    </h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <form action="/search" method="get" className="mb-12" role="search">
        <label htmlFor="home-search" className="sr-only">
          Search ClearFact News
        </label>
        <input
          id="home-search"
          name="q"
          type="search"
          placeholder="Search ClearFact News…"
          className="w-full rounded-xl border border-border bg-background p-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </form>

      <section className="mb-16">
        <h2 className="text-4xl font-black mb-8">Latest News</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post: any) => (
            <article key={post.id} className="border rounded-2xl overflow-hidden">
              <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                <img
                  src={getFeaturedImageUrl(post, "/logo.jpg", "medium_large")}
                  alt={stripHtml(post.title.rendered)}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />

                <div className="p-5">
                  <h3 className="text-2xl font-bold leading-tight">
                    {stripHtml(post.title.rendered)}
                  </h3>

                  <p className="text-sm text-gray-500 mt-3">{new Date(post.date).toDateString()}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {trendingPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-4xl font-black mb-8">Trending News</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {trendingPosts.slice(0, 3).map((post: any) => (
              <article key={post.id} className="border rounded-2xl p-5">
                <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                  <h3 className="text-xl font-bold">{stripHtml(post.title.rendered)}</h3>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <CategorySection title="News" slug="news" posts={posts} />
      <CategorySection title="Politics" slug="politics" posts={posts} />
      <CategorySection title="Crime & Security" slug="crime-security" posts={posts} />
      <CategorySection title="Law & Judiciary" slug="law-judiciary" posts={posts} />
      <CategorySection title="Business" slug="business" posts={posts} />
      <CategorySection title="Investigations" slug="investigations" posts={posts} />
      <CategorySection
        title="Accountability Journalism"
        slug="accountability-journalism"
        posts={posts}
      />
      <CategorySection title="Education" slug="education" posts={posts} />
      <CategorySection title="Health" slug="health" posts={posts} />
      <CategorySection title="Technology" slug="technology" posts={posts} />
      <CategorySection title="Opportunities" slug="opportunities" posts={posts} />
      <CategorySection title="Entertainment" slug="entertainment" posts={posts} />

      <section className="content-auto mb-16 rounded-2xl bg-primary p-8 text-primary-foreground md:flex md:items-center md:justify-between md:gap-8 md:p-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">The Daily Brief</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Verified news, directly from the newsroom
          </h2>

          <p className="mt-3 max-w-2xl text-primary-foreground/75">
            Receive ClearFact investigations, accountability journalism and major opportunities
            without the noise.
          </p>
        </div>

        <Link
          to="/newsletter"
          className="mt-6 inline-flex shrink-0 rounded-lg bg-gold px-6 py-3 font-bold text-gold-foreground transition hover:brightness-105 md:mt-0"
        >
          Join the newsletter
        </Link>
      </section>
    </main>
  );
}
