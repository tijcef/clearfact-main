import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, ShieldCheck, Star, Loader2 } from "lucide-react";

type Row = {
  contributor_id: string;
  display_name: string;
  avatar_url: string | null;
  tier: string;
  trust_score: number;
  accepted_count: number;
  lifetime_earned_kobo: number;
};

type Award = {
  id: string;
  award: string;
  contributor_id: string;
  month: string;
  metric_value: number | null;
  note: string | null;
};

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Contributor Leaderboard — ClearFact News" },
      { name: "description", content: "Top journalists, most trusted reporters and highest-impact stories on ClearFact News." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: lb }, { data: aw }] = await Promise.all([
        supabase.from("contributor_leaderboard").select("*").order("lifetime_earned_kobo", { ascending: false }).limit(50),
        supabase.from("monthly_awards").select("*").order("month", { ascending: false }).limit(12),
      ]);
      setRows((lb ?? []) as Row[]);
      setAwards((aw ?? []) as Award[]);
    })();
  }, []);

  const tierColor: Record<string, string> = {
    beginner: "bg-muted text-foreground",
    trusted: "bg-accent text-accent-foreground",
    verified: "bg-verified/15 text-verified",
    elite: "bg-gold text-gold-foreground",
  };

  return (
    <div className="container-news py-10 space-y-10">
      <header className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Honors</div>
        <h1 className="font-serif text-4xl mt-2 inline-flex items-center gap-3"><Trophy className="h-7 w-7 text-gold" /> Contributor leaderboard</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">We recognize reporters who consistently deliver verified, high-impact stories. Rankings combine trust score, published volume, and reader reach.</p>
      </header>

      {awards.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl">Monthly awards</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {awards.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-sm border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-wider text-gold font-semibold">{a.award.replace("_", " ")}</div>
                <Link to="/author/$id" params={{ id: a.contributor_id }} className="font-serif text-xl mt-1 block hover:underline">View author</Link>
                <div className="text-xs text-muted-foreground mt-1">{new Date(a.month).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
                {a.note && <div className="text-sm mt-2 text-muted-foreground">{a.note}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-serif text-2xl flex items-center gap-2"><Star className="h-5 w-5 text-gold" /> Top journalists</h2>
        {rows === null ? (
          <div className="py-8 text-muted-foreground inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground py-6">No contributors yet.</p>
        ) : (
          <div className="rounded-sm border border-border bg-card mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-accent/40">
                <tr className="text-left">
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3 text-right">Trust</th>
                  <th className="px-4 py-3 text-right">Stories</th>
                  <th className="px-4 py-3 text-right">Lifetime ₦</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.contributor_id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-serif text-lg">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link to="/author/$id" params={{ id: r.contributor_id }} className="font-semibold hover:underline">{r.display_name}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-sm uppercase tracking-wider font-semibold ${tierColor[r.tier] ?? "bg-muted"}`}>
                        <ShieldCheck className="h-3 w-3" />{r.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{r.trust_score}</td>
                    <td className="px-4 py-3 text-right font-mono">{r.accepted_count}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">₦{(r.lifetime_earned_kobo / 100).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
