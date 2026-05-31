import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle2, Calendar, Users, MessageSquare, Bookmark, Eye, TrendingUp, Plus, Newspaper } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Stats = {
  total: number; published: number; drafts: number; scheduled: number;
  comments: number; saves: number; users: number; reads: number;
};

type Trend = { category: string; count: number };

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof FileText; label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-sm border border-border p-4 bg-card">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <Icon className={`h-4 w-4 ${accent ?? "text-primary"}`} />
      </div>
      <div className="font-serif text-3xl mt-2">{value}</div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trending, setTrending] = useState<Trend[]>([]);
  const [recent, setRecent] = useState<{ id: string; title: string; status: string; updated_at: string; slug: string }[]>([]);

  useEffect(() => {
    (async () => {
      const counts = async (table: "articles" | "comments" | "saved_articles" | "profiles" | "reading_history", filter?: { col: string; val: string }) => {
        let q = supabase.from(table).select("*", { count: "exact", head: true });
        if (filter) q = q.eq(filter.col, filter.val);
        const { count } = await q;
        return count ?? 0;
      };
      const [total, published, drafts, scheduled, comments, saves, users, reads] = await Promise.all([
        counts("articles"),
        counts("articles", { col: "status", val: "published" }),
        counts("articles", { col: "status", val: "draft" }),
        counts("articles", { col: "status", val: "scheduled" }),
        counts("comments"),
        counts("saved_articles"),
        counts("profiles"),
        counts("reading_history"),
      ]);
      setStats({ total, published, drafts, scheduled, comments, saves, users, reads });

      const { data: cats } = await supabase.from("articles").select("category").eq("status", "published");
      const map = new Map<string, number>();
      (cats ?? []).forEach((r) => map.set(r.category, (map.get(r.category) ?? 0) + 1));
      setTrending([...map.entries()].map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count).slice(0, 6));

      const { data: r } = await supabase.from("articles")
        .select("id,title,status,updated_at,slug")
        .order("updated_at", { ascending: false }).limit(8);
      setRecent(r ?? []);
    })();
  }, []);

  return (
    <div className="container-news py-8 space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl">Newsroom Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of publishing activity and audience signals.</p>
        </div>
        <Link to="/admin/new" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Newspaper} label="Total articles" value={stats?.total ?? "—"} />
        <StatCard icon={CheckCircle2} label="Published" value={stats?.published ?? "—"} accent="text-verified" />
        <StatCard icon={FileText} label="Drafts" value={stats?.drafts ?? "—"} />
        <StatCard icon={Calendar} label="Scheduled" value={stats?.scheduled ?? "—"} accent="text-gold" />
        <StatCard icon={Users} label="Registered users" value={stats?.users ?? "—"} />
        <StatCard icon={MessageSquare} label="Comments" value={stats?.comments ?? "—"} />
        <StatCard icon={Bookmark} label="Saves" value={stats?.saves ?? "—"} />
        <StatCard icon={Eye} label="Total reads" value={stats?.reads ?? "—"} />
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 rounded-sm border border-border">
          <header className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-serif text-lg">Recent activity</h2>
            <Link to="/admin" className="text-xs font-semibold text-primary hover:underline">All articles →</Link>
          </header>
          <ul className="divide-y divide-border">
            {recent.map((r) => (
              <li key={r.id} className="p-4 flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                  r.status === "published" ? "bg-verified text-verified-foreground" :
                  r.status === "scheduled" ? "bg-gold text-gold-foreground" :
                  "bg-muted text-foreground border border-border"
                }`}>{r.status}</span>
                <Link to="/admin/edit/$id" params={{ id: r.id }} className="font-serif font-semibold flex-1 hover:underline">{r.title}</Link>
                <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="p-6 text-sm text-muted-foreground">No articles yet.</li>}
          </ul>
        </section>

        <section className="rounded-sm border border-border">
          <header className="flex items-center gap-2 p-4 border-b border-border">
            <TrendingUp className="h-4 w-4 text-gold" />
            <h2 className="font-serif text-lg">Trending categories</h2>
          </header>
          <ul className="p-4 space-y-3">
            {trending.map((t) => {
              const max = Math.max(...trending.map((x) => x.count));
              return (
                <li key={t.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{t.category}</span>
                    <span className="text-muted-foreground">{t.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-sm mt-1 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(t.count / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
            {trending.length === 0 && <li className="text-sm text-muted-foreground">No published content.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
