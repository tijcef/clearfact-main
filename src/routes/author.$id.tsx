import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, User } from "lucide-react";
import { VerificationBadge } from "@/components/site/VerificationBadge";

type Article = Database["public"]["Tables"]["articles"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/author/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Author profile — ClearFact News` },
      { name: "description", content: `Articles by ClearFact author ${params.id}.` },
    ],
  }),
  component: AuthorPage,
  notFoundComponent: () => <div className="container-news py-16">Author not found.</div>,
});

function AuthorPage() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", id).maybeSingle();
      setProfile(p ?? null);
      const { data: a } = await supabase.from("articles").select("*")
        .eq("author_id", id).eq("status", "published")
        .order("published_at", { ascending: false }).limit(50);
      setArticles(a ?? []);
    })();
  }, [id]);

  if (profile === undefined) return <div className="container-news py-16 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading author…</div>;
  if (profile === null && articles.length === 0) throw notFound();

  const name = profile?.display_name || articles[0]?.author_name || "ClearFact Newsroom";

  return (
    <div className="container-news py-10">
      <header className="flex items-start gap-5 pb-6 border-b border-border">
        <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground grid place-items-center overflow-hidden shrink-0">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-10 w-10" />}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-3xl">{name}</h1>
          {profile?.bio && <p className="text-muted-foreground mt-2 max-w-2xl">{profile.bio}</p>}
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mt-2">{articles.length} verified report{articles.length === 1 ? "" : "s"}</p>
        </div>
      </header>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {articles.map((a) => (
          <article key={a.id} className="border-b border-border pb-5">
            {a.cover_image && (
              <Link to="/post/$slug" params={{ slug: a.slug }}>
                <img src={a.cover_image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover rounded-sm mb-3" />
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{a.category}</span>
              <VerificationBadge status={a.verification} />
            </div>
            <Link to="/post/$slug" params={{ slug: a.slug }}>
              <h2 className="font-serif text-xl mt-1 hover:underline decoration-gold underline-offset-4">{a.title}</h2>
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {a.published_at && new Date(a.published_at).toLocaleDateString()} · {a.read_minutes} min read
            </div>
          </article>
        ))}
        {articles.length === 0 && (
          <div className="text-muted-foreground">No published articles yet.</div>
        )}
      </div>
    </div>
  );
}
