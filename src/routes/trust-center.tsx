import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, FileSearch, Users, Megaphone, BadgeCheck, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/trust-center")({
  head: () => ({
    meta: [
      { title: "Trust Center — ClearFact News" },
      { name: "description", content: "Public transparency dashboard: verification stats, corrections, sources and editorial accountability." },
      { property: "og:title", content: "ClearFact Trust Center" },
      { property: "og:description", content: "Showing our work, in public." },
    ],
  }),
  component: TrustCenter,
});

const stats = [
  { label: "Stories verified (90 days)", value: "1,284", icon: ShieldCheck },
  { label: "Corrections issued", value: "12", icon: RefreshCw },
  { label: "Named sources cited", value: "3,142", icon: FileSearch },
  { label: "Reader trust score", value: "92%", icon: BadgeCheck },
];

function TrustCenter() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Public accountability</div>
            <h1 className="font-serif text-4xl md:text-6xl mt-2">Trust Center</h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              We publish our verification record, correction history and editorial standards because public trust is earned, not declared.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-5">
                <s.icon className="h-5 w-5 text-gold" />
                <div className="font-serif text-3xl mt-3">{s.value}</div>
                <div className="text-xs text-primary-foreground/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-news py-14 grid lg:grid-cols-3 gap-8">
        {[
          { i: ShieldCheck, t: "Verification Workflow", d: "Every story passes source validation, AI misinformation scanning and human editorial sign-off before publication." },
          { i: RefreshCw, t: "Transparent Corrections", d: "We never silently edit. Every change is timestamped with a public ‘What Changed’ note." },
          { i: Users, t: "Editorial Independence", d: "We disclose ownership, funding and any conflict of interest. Sponsored content is clearly labelled." },
          { i: Megaphone, t: "Anti-Clickbait Policy", d: "AI-assisted headline review blocks misleading framing, false urgency and emotional manipulation." },
          { i: FileSearch, t: "Source Transparency", d: "Where safe, we cite primary documents and named experts. Anonymous sourcing requires editor approval." },
          { i: BadgeCheck, t: "Reader Reporting", d: "Spotted an error? Use the ‘Report a correction’ button on any article and we’ll respond publicly." },
        ].map((b) => (
          <div key={b.t} className="rounded-sm border border-border p-6">
            <b.i className="h-6 w-6 text-gold" />
            <h3 className="font-serif text-xl mt-3">{b.t}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{b.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
