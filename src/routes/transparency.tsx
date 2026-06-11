import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertTriangle, FileSearch, RefreshCw, BadgeCheck, Sparkles } from "lucide-react";

type Stats = {
  total: number;
  verified: number;
  factChecked: number;
  developing: number;
  opinion: number;
  corrections: number;
  avgTrust: number;
};

export const Route = createFileRoute("/transparency")({
  head: () => ({
  title: "Transparency Dashboard — ClearFact News",

  meta: [
      { name: "description", content: "Live, public verification metrics, corrections, source disclosure and editorial accountability for ClearFact News." },
      { property: "og:title", content: "ClearFact Transparency Dashboard" },
      { property: "og:description", content: "Truth over speed. Verification over virality. Trust over traffic." },
    ],
  }),
  component: TransparencyDashboard,
});

function TransparencyDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<{ id: string; note: string; created_at: string; editor_name: string | null; article_id: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: arts } = await supabase.from("articles").select("verification,trust_score,status").eq("status", "published");
      const a = (arts ?? []) as { verification: string; trust_score: number | null }[];
      type Corr = { id: string; note: string; created_at: string; editor_name: string | null; article_id: string };
      const sb = supabase as unknown as {
        from: (t: string) => {
          select: (s: string, o?: { count: "exact"; head: boolean }) => Promise<{ count: number | null }> & {
            order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Corr[] | null }> };
          };
        };
      };
      const corrRes = await sb.from("corrections").select("*", { count: "exact", head: true });
      const recRes = await sb.from("corrections").select("*").order("created_at", { ascending: false }).limit(10);

      setStats({
        total: a.length,
        verified: a.filter((x) => x.verification === "Verified").length,
        factChecked: a.filter((x) => x.verification === "Fact-Checked").length,
        developing: a.filter((x) => x.verification === "Developing").length,
        opinion: a.filter((x) => x.verification === "Opinion").length,
        corrections: corrRes.count ?? 0,
        avgTrust: a.length ? Math.round(a.reduce((s, x) => s + (x.trust_score ?? 70), 0) / a.length) : 0,
      });
      setRecent(recRes.data ?? []);
    })();
  }, []);

  const cards = stats ? [
    { i: ShieldCheck, l: "Verified stories", v: stats.verified },
    { i: BadgeCheck, l: "Fact-checked", v: stats.factChecked },
    { i: Sparkles, l: "Avg trust score", v: `${stats.avgTrust}/100` },
    { i: AlertTriangle, l: "Developing", v: stats.developing },
    { i: FileSearch, l: "Opinion / labelled", v: stats.opinion },
    { i: RefreshCw, l: "Public corrections", v: stats.corrections },
  ] : [];

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-14 md:py-20">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Public accountability — live</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-2">Transparency Dashboard</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl">
            Live verification record, correction history and trust metrics. Truth over speed. Verification over virality. Trust over traffic.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {cards.map((c) => (
    <div
      key={c.l}
      className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-5"
    >
      <c.i className="h-5 w-5 text-gold" />

      <div className="font-serif text-3xl mt-3">
        {c.v}
      </div>

      <div className="text-xs text-primary-foreground/70">
        {c.l}
      </div>
    </div>
  ))}

  {!stats && (
    <div className="text-primary-foreground/60 text-sm">
      Loading metrics...
    </div>
  )}
</div>
        </div>
      </section>

      <section className="container-news py-12">
        <h2 className="font-serif text-2xl border-b-2 border-primary pb-2">Recent public corrections</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-muted-foreground text-sm">No corrections logged yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border rounded-sm">
            {recent.map((c) => (
              <li key={c.id} className="p-4">
                <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()} · {c.editor_name ?? "Editor"}</div>
                <div className="mt-1">{c.note}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
