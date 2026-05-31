import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Search as SearchIcon, Loader2, TrendingUp, Tag } from "lucide-react";
import { CATEGORIES } from "@/lib/news-data";
import { VerificationBadge } from "@/components/site/VerificationBadge";

type Article = Database["public"]["Tables"]["articles"]["Row"];

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) ?? "",
    category: (s.category as string) ?? "",
    tag: (s.tag as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Search — ClearFact News" },
      { name: "description", content: "Search verified reports, fact-checks, investigations and analysis on ClearFact News." },
    ],
  }),
  component: SearchPage,
});

const TRENDING = ["election", "naira", "fact-check", "tinubu", "lagos", "agriculture", "security"];

function SearchPage() {
  const { q, category, tag } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<Article[] | null>(null);

  useEffect(() => { setInput(q); }, [q]);

  useEffect(() => {
    (async () => {
      setResults(null);
      let query = supabase.from("articles").select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(40);
      if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,body.ilike.%${q}%`);
      if (category) query = query.eq("category", category);
      if (tag) query = query.contains("tags", [tag]);
      const { data } = await query;
      setResults(data ?? []);
    })();
  }, [q, category, tag]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: input, category, tag } });
  };

  return (
    <div className="container-news py-10">
      <h1 className="font-serif text-3xl">Search ClearFact</h1>
      <form onSubmit={submit} className="mt-4 flex gap-2 max-w-2xl">
        <label className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Search verified reports, fact-checks, topics…"
            className="w-full h-11 pl-9 pr-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
        </label>
        <button className="h-11 px-5 rounded-sm bg-primary text-primary-foreground font-semibold">Search</button>
      </form>

      <div className="mt-6 grid lg:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/search" search={{ q, category: "", tag }} className={`block px-2 py-1 rounded-sm ${!category ? "bg-accent font-semibold" : "hover:bg-accent"}`}>All</Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to="/search" search={{ q, category: c.label, tag }}
                    className={`block px-2 py-1 rounded-sm ${category === c.label ? "bg-accent font-semibold" : "hover:bg-accent"}`}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Trending
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING.map((t) => (
                <Link key={t} to="/search" search={{ q: t, category: "", tag: "" }}
                  className="text-xs px-2 py-1 rounded-sm border border-border hover:bg-accent">#{t}</Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {(category || tag) && (
            <div className="mb-4 flex gap-2 flex-wrap text-xs">
              {category && (
                <Link to="/search" search={{ q, category: "", tag }} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-primary text-primary-foreground">
                  Category: {category} ✕
                </Link>
              )}
              {tag && (
                <Link to="/search" search={{ q, category, tag: "" }} className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-gold text-gold-foreground">
                  <Tag className="h-3 w-3" /> {tag} ✕
                </Link>
              )}
            </div>
          )}

          {results === null ? (
            <div className="py-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</div>
          ) : results.length === 0 ? (
            <div className="py-10 text-muted-foreground">No results. Try a different keyword.</div>
          ) : (
            <ul className="space-y-6">
              {results.map((a) => (
                <li key={a.id} className="grid sm:grid-cols-[200px_1fr] gap-4 pb-6 border-b border-border last:border-0">
                  {a.cover_image && (
                    <Link to="/article/$slug" params={{ slug: a.slug }}>
                      <img src={a.cover_image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover rounded-sm" />
                    </Link>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{a.category}</span>
                      <VerificationBadge status={a.verification} />
                    </div>
                    <Link to="/article/$slug" params={{ slug: a.slug }}>
                      <h3 className="font-serif text-xl mt-1 hover:underline decoration-gold underline-offset-4">{a.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(a.tags ?? []).slice(0, 6).map((t) => (
                        <Link key={t} to="/search" search={{ q: "", category: "", tag: t }}
                          className="text-[11px] px-1.5 py-0.5 rounded-sm bg-muted hover:bg-accent">#{t}</Link>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
