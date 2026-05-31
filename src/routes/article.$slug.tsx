import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { VerificationBadge } from "@/components/site/VerificationBadge";
import { ArticleEngagement } from "@/components/site/ArticleEngagement";
import { Loader2, Flame, ShieldCheck, AlertTriangle, ExternalLink, History } from "lucide-react";

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  sources?: { title: string; url: string; note?: string }[];
  trust_score?: number;
};
type Correction = { id: string; note: string; created_at: string; editor_name: string | null };

export const Route = createFileRoute("/article/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — ClearFact News` },
      { property: "og:title", content: params.slug },
    ],
  }),
  component: ArticlePage,
  notFoundComponent: () => <div className="container-news py-16">Article not found.</div>,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const [a, setA] = useState<Article | null | undefined>(undefined);
  const [related, setRelated] = useState<Article[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("articles").select("*").eq("slug", slug)
        .eq("status", "published").maybeSingle();
      setA((data as Article | null) ?? null);
      if (data) {
        const { data: u } = await supabase.auth.getUser();
        if (u.user) await supabase.from("reading_history").insert({ article_id: data.id, user_id: u.user.id });
        const { data: rel } = await supabase.from("articles").select("*")
          .eq("status", "published").eq("category", data.category).neq("id", data.id)
          .order("published_at", { ascending: false }).limit(3);
        setRelated((rel as Article[]) ?? []);
        const sb = supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: Correction[] | null }> } } } };
        const { data: cors } = await sb.from("corrections").select("*").eq("article_id", data.id).order("created_at", { ascending: false });
        setCorrections(cors ?? []);
      }
    })();
  }, [slug]);

  if (a === undefined) return <div className="container-news py-16 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  if (a === null) throw notFound();

  const isBreaking = a.verification === "Developing";

  return (
    <article className="container-news py-10 max-w-3xl">
      <div className="flex items-center gap-2">
        {isBreaking && (
          <span className="inline-flex items-center gap-1 bg-breaking text-breaking-foreground text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
            <Flame className="h-3 w-3" /> Breaking
          </span>
        )}
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{a.category}</span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl mt-2 leading-tight text-balance">{a.title}</h1>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <VerificationBadge status={a.verification} />
        <span>By {a.author_id ? (
          <Link to="/author/$id" params={{ id: a.author_id }} className="text-foreground font-semibold hover:underline">{a.author_name}</Link>
        ) : <span className="text-foreground font-semibold">{a.author_name}</span>}</span>
        <span>· {a.read_minutes} min read</span>
        {a.published_at && <span>· {new Date(a.published_at).toLocaleString()}</span>}
      </div>
      {a.cover_image && (
        <img src={a.cover_image} alt="" className="mt-6 w-full aspect-[16/9] object-cover rounded-sm" />
      )}
      {a.excerpt && <p className="mt-6 text-lg text-muted-foreground">{a.excerpt}</p>}
      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/90">{a.body}</div>

      {/* Trust & verification panel */}
      <aside className="mt-10 border border-border rounded-sm p-5 bg-accent/30">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-verified" />
            <div>
              <div className="font-serif text-lg leading-none">Verification & transparency</div>
              <div className="text-xs text-muted-foreground mt-1">Confidence: <span className="font-semibold text-foreground">{a.confidence}</span> · Trust score: <span className="font-semibold text-foreground">{a.trust_score ?? 70}/100</span></div>
            </div>
          </div>
          <Link to="/article/$slug/revisions" params={{ slug: a.slug }}
            className="text-xs inline-flex items-center gap-1 px-3 h-8 rounded-sm border border-border hover:bg-accent">
            <History className="h-3 w-3" /> What changed
          </Link>
        </div>

        {a.sources && a.sources.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sources cited</div>
            <ul className="space-y-1.5 text-sm">
              {a.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> {s.title || s.url}
                  </a>
                  {s.note && <span className="text-muted-foreground"> — {s.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {corrections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-breaking mb-2 inline-flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Public corrections
            </div>
            <ul className="space-y-2 text-sm">
              {corrections.map((c) => (
                <li key={c.id}>
                  <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()} · {c.editor_name ?? "Editor"}</div>
                  <div>{c.note}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Spotted an error? <a href="mailto:clearfactmedia@gmail.com" className="text-primary font-semibold hover:underline">Report a correction</a>.
        </p>
      </aside>

      {a.tags && a.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-1.5">
          {a.tags.map((t) => (
            <Link key={t} to="/search" search={{ q: "", category: "", tag: t }}
              className="text-xs px-2 py-1 rounded-sm border border-border hover:bg-accent">#{t}</Link>
          ))}
        </div>
      )}

      <ArticleEngagement articleId={a.id} />

      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="font-serif text-2xl mb-4">Related reports</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link key={r.id} to="/article/$slug" params={{ slug: r.slug }} className="group">
                {r.cover_image && <img src={r.cover_image} alt="" className="aspect-[16/10] w-full object-cover rounded-sm" />}
                <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-2">{r.category}</div>
                <h3 className="font-serif text-base leading-snug mt-1 group-hover:underline decoration-gold underline-offset-4 line-clamp-3">{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">← Back to homepage</Link>
      </div>
    </article>
  );
}
