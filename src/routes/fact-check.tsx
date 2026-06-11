import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Search, AlertTriangle, FileCheck } from "lucide-react";
import { ARTICLES } from "@/lib/news-data";
import { ArticleCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/fact-check")({
  head: () => ({
    title: "Fact Check Center | ClearFact News",

    meta: [
      {
        name: "description",
        content:
          "ClearFact's verification desk reviews viral claims, checks sources and publishes transparent evidence-based fact checks.",
      },

      {
        property: "og:title",
        content: "Fact Check Center | ClearFact News",
      },

      {
        property: "og:description",
        content:
          "Verifying claims. Citing sources. Showing our work.",
      },

      {
        property: "og:type",
        content: "website",
      },

      {
        property: "og:url",
        content: "https://clearfact.ng/fact-check",
      },
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

const ratings = [
  {
    label: "True",
    color: "bg-verified text-verified-foreground",
    icon: ShieldCheck,
    count: "Verified",
  },
  {
    label: "Mostly True",
    color: "bg-emerald-500/90 text-white",
    icon: FileCheck,
    count: "Reviewed",
  },
  {
    label: "Misleading",
    color: "bg-gold text-gold-foreground",
    icon: AlertTriangle,
    count: "Flagged",
  },
  {
    label: "False",
    color: "bg-breaking text-breaking-foreground",
    icon: AlertTriangle,
    count: "Debunked",
  },
];
function FactCheck() {
  const checks = ARTICLES.slice(0, 6);

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-gold text-gold-foreground px-3 py-1 rounded-sm text-xs font-bold uppercase">
              <ShieldCheck className="h-4 w-4" />
              Verification Desk
            </span>

            <h1 className="font-serif text-4xl md:text-6xl mt-4">
              Fact Check Center
            </h1>

            <p className="mt-4 text-lg text-primary-foreground/80">
              Every claim we publish is reviewed, verified and supported with evidence.
            </p>

            <div className="mt-6 relative">
              <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search fact checks..."
                className="w-full h-12 pl-10 rounded-sm border bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ratings.map((r) => (
              <div
                key={r.label}
                className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-4"
              >
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-bold ${r.color}`}
                >
                  <r.icon className="h-3.5 w-3.5" />
                  {r.label}
                </div>

                <div className="font-serif text-2xl mt-3">
                  {r.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-news py-12">
        <h2 className="font-serif text-2xl border-b-2 border-primary pb-2">
          Latest Fact Checks
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {checks.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
            />
          ))}
        </div>
      </section>
    </div>
  );
}