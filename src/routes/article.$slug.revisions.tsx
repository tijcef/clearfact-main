import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History, ArrowLeft } from "lucide-react";

type Revision = { id: string; created_at: string; title: string; excerpt: string; body: string; editor_name: string | null };
type Article = { id: string; slug: string; title: string };

export const Route = createFileRoute("/article/$slug/revisions")({
  head: ({ params }) => ({
    meta: [
      { title: `What changed — ${params.slug} — ClearFact News` },
      { name: "description", content: "Public revision history. ClearFact News never edits silently." },
    ],
  }),
  component: RevisionsPage,
  notFoundComponent: () => <div className="container-news py-16">Article not found.</div>,
});

function diff(a: string, b: string) {
  if (a === b) return 0;
  const la = a.split(/\s+/).length, lb = b.split(/\s+/).length;
  return Math.abs(la - lb);
}

function RevisionsPage() {
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [revs, setRevs] = useState<Revision[]>([]);

  useEffect(() => {
    (async () => {
      const { data: a } = await supabase.from("articles").select("id,slug,title")
        .eq("slug", slug).eq("status", "published").maybeSingle();
      setArticle(a ?? null);
      if (a) {
        const { data } = await supabase.from("article_revisions").select("*")
          .eq("article_id", a.id).order("created_at", { ascending: false });
        setRevs((data ?? []) as Revision[]);
      }
    })();
  }, [slug]);

  if (article === undefined) return <div className="container-news py-16 text-muted-foreground">Loading…</div>;
  if (!article) throw notFound();

  return (
    <div className="container-news py-10 max-w-3xl">
      <Link to="/post/$slug" params={{ slug }} className="text-xs inline-flex items-center gap-1 text-primary hover:underline">
        <ArrowLeft className="h-3 w-3" /> Back to article
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <History className="h-5 w-5 text-gold" />
        <h1 className="font-serif text-3xl">What changed</h1>
      </div>
      <p className="mt-2 text-muted-foreground">Every public edit to <span className="font-semibold text-foreground">{article.title}</span> is logged here. ClearFact News never edits silently.</p>

      <ol className="mt-8 relative border-l-2 border-border pl-6 space-y-6">
        {revs.length === 0 && <li className="text-sm text-muted-foreground">No public revisions yet.</li>}
        {revs.map((r, i) => {
          const prev = revs[i + 1];
          const titleChanged = prev && prev.title !== r.title;
          const excerptChanged = prev && prev.excerpt !== r.excerpt;
          const wordDelta = prev ? diff(prev.body, r.body) : 0;
          return (
            <li key={r.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()} · {r.editor_name ?? "Editor"}</div>
              <div className="font-serif text-lg mt-1">{r.title}</div>
              {prev && (
                <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                  {titleChanged && <li>· Headline updated (was: <span className="italic">{prev.title}</span>)</li>}
                  {excerptChanged && <li>· Summary updated</li>}
                  {wordDelta > 0 && <li>· Body changed by ~{wordDelta} words</li>}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
