import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, FileCheck, Search, ShieldCheck } from "lucide-react";

import AdSense from "@/components/AdSense";
import { VerificationBadge } from "@/components/site/VerificationBadge";
import {
  getCategories,
  getFeaturedImageUrl,
  getPostsByCategory,
  normalizeWpSlug,
  stripHtml,
} from "@/lib/wordpress";

const FACT_CHECK_SOURCE_SLUGS = ["accountability"];

export const Route = createFileRoute("/fact-check")({
  loader: async () => {
    try {
      const allCategories = await getCategories();
      const categoriesBySlug = new Map(allCategories.map((category) => [category.slug, category]));
      const categories = FACT_CHECK_SOURCE_SLUGS.map((slug) => categoriesBySlug.get(slug)).filter(
        (category) => category && Number(category.count ?? 0) > 0,
      );

      const groups = await Promise.all(
        categories.map((category) => getPostsByCategory(category.id, 24)),
      );

      const uniquePosts = new Map<number, any>();

      groups.flat().forEach((post) => {
        uniquePosts.set(post.id, post);
      });

      const checks = Array.from(uniquePosts.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 24);

      return { checks };
    } catch (error) {
      console.error("Fact Check Center failed to load:", error);
      throw new Error("The Fact Check Center is temporarily unavailable.", {
        cause: error,
      });
    }
  },

  head: () => ({
    meta: [
      { title: "Fact Check Center | ClearFact News" },
      {
        name: "description",
        content:
          "ClearFact's verification desk reviews public claims, checks sources and publishes transparent, evidence-based fact checks.",
      },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Fact Check Center | ClearFact News" },
      {
        property: "og:description",
        content: "Verifying claims, citing sources and showing our work.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clearfact.ng/fact-check" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://clearfact.ng/fact-check",
      },
    ],
  }),

  component: FactCheck,
});

const verdicts = [
  {
    label: "True",
    description: "Supported by the available evidence.",
    color: "bg-verified text-verified-foreground",
    icon: ShieldCheck,
  },
  {
    label: "Mostly True",
    description: "Accurate overall, with important context missing.",
    color: "bg-emerald-600 text-white",
    icon: FileCheck,
  },
  {
    label: "Misleading",
    description: "Uses real information in a deceptive context.",
    color: "bg-gold text-gold-foreground",
    icon: AlertTriangle,
  },
  {
    label: "False",
    description: "Contradicted by reliable evidence.",
    color: "bg-breaking text-breaking-foreground",
    icon: AlertTriangle,
  },
];

function FactCheck() {
  const { checks } = Route.useLoaderData();

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-sm bg-gold px-3 py-1 text-xs font-bold uppercase text-gold-foreground">
              <ShieldCheck className="h-4 w-4" />
              Verification Desk
            </span>

            <h1 className="mt-4 font-serif text-4xl md:text-6xl">Fact Check Center</h1>

            <p className="mt-4 text-lg text-primary-foreground/80">
              We examine public claims, identify the evidence and explain how each conclusion was
              reached.
            </p>

            <form action="/search" method="get" className="relative mt-6">
              <label htmlFor="fact-check-search" className="sr-only">
                Search ClearFact fact checks
              </label>
              <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <input
                id="fact-check-search"
                name="q"
                type="search"
                placeholder="Search fact checks…"
                className="h-12 w-full rounded-sm border bg-background pl-10 pr-3 text-foreground"
              />
            </form>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {verdicts.map((verdict) => (
              <div
                key={verdict.label}
                className="rounded-sm border border-primary-foreground/10 bg-primary-foreground/5 p-4"
              >
                <div
                  className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold ${verdict.color}`}
                >
                  <verdict.icon className="h-3.5 w-3.5" />
                  {verdict.label}
                </div>
                <p className="mt-3 text-sm text-primary-foreground/75">{verdict.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-news py-12">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-primary pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Evidence-led reporting
            </p>
            <h2 className="mt-1 font-serif text-3xl">Latest Fact Checks</h2>
          </div>

          <Link
            to="/category/$slug"
            params={{ slug: "accountability" }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            View accountability reporting →
          </Link>
        </div>

        {checks.length > 0 ? (
          <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {checks.map((post: any) => {
              const title = stripHtml(post.title?.rendered ?? "");
              const image = getFeaturedImageUrl(post, "", "medium_large");

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  {image && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: normalizeWpSlug(post.slug) }}
                      className="block overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={title}
                        className="h-48 w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  )}

                  <div className="p-5">
                    <VerificationBadge status={post.acf?.verification_status || "Fact-Checked"} />

                    <Link to="/post/$slug" params={{ slug: normalizeWpSlug(post.slug) }}>
                      <h3 className="mt-3 font-serif text-xl leading-snug hover:text-primary">
                        {title}
                      </h3>
                    </Link>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {stripHtml(post.excerpt?.rendered ?? "")}
                    </p>

                    <time dateTime={post.date} className="mt-4 block text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-xl border border-border bg-muted/30 p-8 text-center">
            <h3 className="font-serif text-2xl">No fact checks published yet</h3>
            <p className="mt-2 text-muted-foreground">
              New evidence-based reviews will appear here when published.
            </p>
          </div>
        )}

        {checks.length > 0 && <AdSense />}
      </section>
    </div>
  );
}
