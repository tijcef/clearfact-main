import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Search, AlertTriangle, FileCheck } from "lucide-react";
import { ARTICLES } from "@/lib/news-data";
import { ArticleCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/fact-check")({
  head: () => ({
    meta: [
      { title: "Fact Check Center — ClearFact News" },
      { name: "description", content: "ClearFact's verification desk rates viral claims, checks sources and publishes a transparent evidence trail." },
      { property: "og:title", content: "Fact Check Center — ClearFact News" },
      { property: "og:description", content: "Verifying claims. Citing sources. Showing our work." },
    ],
  }),
  component: FactCheck,
});

const ratings = [
  { label: "True", color: "bg-verified text-verified-foreground", icon: ShieldCheck, count: 412 },
  { label: "Mostly True", color: "bg-emerald-500/90 text-white", icon: FileCheck, count: 188 },
  { label: "Misleading", color: "bg-gold text-gold-foreground", icon: AlertTriangle, count: 96 },
  { label: "False", color: "bg-breaking text-breaking-foreground", icon: AlertTriangle, count: 71 },
];

function FactCheck() {
  const checks = ARTICLES.filter((a) => a.verification === "Fact-Checked").concat(ARTICLES).slice(0, 6);
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-gold text-gold-foreground text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> Verification Desk
            </span>
            <h1 className="font-serif text-4xl md:text-6xl mt-4 leading-[1.05]">Fact Check Center</h1>
            <p className="mt-4 text-primary-foreground/80 text-lg max-w-xl">
              Every claim we publish is reviewed by a human editor, AI-assisted misinformation scanner and a transparent source log. We show our work.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full h-12 pl-9 pr-3 rounded-sm bg-background text-foreground border border-transparent focus:border-gold outline-none" placeholder="Paste a claim or URL to check…" />
              </div>
              <button className="h-12 px-5 rounded-sm bg-gold text-gold-foreground font-semibold">Check</button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ratings.map((r) => (
              <div key={r.label} className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-4">
                <div className={`inline-flex items-center gap-1 ${r.color} text-xs font-bold uppercase px-2 py-0.5 rounded-sm`}>
                  <r.icon className="h-3.5 w-3.5" /> {r.label}
                </div>
                <div className="font-serif text-3xl mt-3">{r.count}</div>
                <div className="text-xs text-primary-foreground/70">claims rated this year</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-news py-12">
        <h2 className="font-serif text-2xl border-b-2 border-primary pb-2">Latest fact-checks</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {checks.map((a) => <ArticleCard key={a.slug + Math.random()} article={a} />)}
        </div>
      </section>

      <section className="container-news pb-16">
        <div className="rounded-sm border border-border p-6 md:p-8 bg-accent">
          <h3 className="font-serif text-2xl">How our verification works</h3>
          <ol className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
            {[
              ["1. Claim intake", "Submitted by readers, surfaced by AI, or escalated by reporters."],
              ["2. Source review", "Primary documents, named experts and official records are required."],
              ["3. AI-assisted scan", "Cross-checked against known misinformation patterns."],
              ["4. Editor approval", "A senior editor signs off with a public confidence rating."],
            ].map(([t, d]) => (
              <li key={t} className="bg-background p-4 rounded-sm border border-border">
                <div className="font-serif text-lg">{t}</div>
                <p className="text-muted-foreground mt-1">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
