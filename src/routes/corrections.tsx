import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";

type Corr = { id: string; note: string; created_at: string; editor_name: string | null; article_id: string };
type ArticleRef = { id: string; slug: string; title: string };

export const Route = createFileRoute("/corrections")({
  head: () => ({
    meta: [
      { title: "Corrections Log — ClearFact News" },
      { name: "description", content: "Public log of every correction issued by ClearFact News. We never silently edit." },
      { property: "og:title", content: "Corrections Log — ClearFact News" },
      { property: "og:description", content: "We never silently edit." },
    ],
  }),
  component: CorrectionsPage,
});

function CorrectionsPage() {
  const [items, setItems] = useState<(Corr & { article?: ArticleRef })[]>([]);

  useEffect(() => {
    (async () => {
      const sb = supabase as unknown as {
        from: (t: string) => { select: (s: string) => { order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Corr[] | null }> } } };
      };
      const { data: cors } = await sb.from("corrections").select("*").order("created_at", { ascending: false }).limit(100);
      const arr = cors ?? [];
      const ids = Array.from(new Set(arr.map((c) => c.article_id)));
      const { data: arts } = ids.length
        ? await supabase.from("articles").select("id,slug,title").in("id", ids)
        : { data: [] as ArticleRef[] };
      const map = new Map((arts ?? []).map((a) => [a.id, a as ArticleRef]));
      setItems(arr.map((c) => ({ ...c, article: map.get(c.article_id) })));
    })();
  }, []);

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-12">
          <div className="flex items-center gap-2 text-gold">
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">Accountability</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mt-2">Corrections Log</h1>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl">
            Every change to a published story is recorded here in public. Spot something wrong? Email
            <a href="mailto:clearfactmedia@gmail.com" className="underline decoration-gold ml-1">clearfactmedia@gmail.com</a>.
          </p>
        </div>
      </section>

      <section className="container-news py-10 max-w-3xl">
        {items.length === 0 ? (
          <p className="text-muted-foreground">No corrections logged yet.</p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-sm">
            {items.map((c) => (
              <li key={c.id} className="p-5">
                <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()} · {c.editor_name ?? "Editor"}</div>
                {c.article && (
                  <Link to="/article/$slug" params={{ slug: c.article.slug }} className="block font-serif text-lg mt-1 hover:underline">
                    {c.article.title}
                  </Link>
                )}
                <p className="mt-2">{c.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
