import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Toaster, toast } from "sonner";
import { Bookmark, History, MessageSquare, ThumbsUp, LogOut, Loader2, UserCircle2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — ClearFact News" },
      { name: "description", content: "Your saved articles, comments, reactions and reading history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type ArticleStub = { id: string; slug: string; title: string; category: string; published_at: string | null };
type SavedRow = { id: string; created_at: string; articles: ArticleStub | null };
type HistoryRow = { read_at: string; articles: ArticleStub | null };
type ReactionRow = { id: string; type: string; created_at: string; articles: ArticleStub | null };
type CommentRow = { id: string; body: string; created_at: string; articles: ArticleStub | null };

type Tab = "saved" | "history" | "comments" | "reactions" | "profile";

function ArticleLink({ a }: { a: ArticleStub | null }) {
  if (!a) return <span className="text-muted-foreground">Article removed</span>;
  return (
    <Link to="/article/$slug" params={{ slug: a.slug }} className="font-semibold hover:text-primary">
      {a.title}
    </Link>
  );
}

function Dashboard() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("saved");
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [profile, setProfile] = useState<{ display_name: string; bio: string }>({ display_name: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    const cols = "id,slug,title,category,published_at";
    (async () => {
      const [s, h, r, c, p] = await Promise.all([
        supabase.from("saved_articles").select(`id,created_at,articles(${cols})`).order("created_at", { ascending: false }),
        supabase.from("reading_history").select(`read_at,articles(${cols})`).order("read_at", { ascending: false }).limit(50),
        supabase.from("reactions").select(`id,type,created_at,articles(${cols})`).order("created_at", { ascending: false }),
        supabase.from("comments").select(`id,body,created_at,articles(${cols})`).eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("display_name,bio").eq("user_id", session.user.id).maybeSingle(),
      ]);
      setSaved((s.data ?? []) as unknown as SavedRow[]);
      setHistory((h.data ?? []) as unknown as HistoryRow[]);
      setReactions((r.data ?? []) as unknown as ReactionRow[]);
      setComments((c.data ?? []) as unknown as CommentRow[]);
      setProfile({ display_name: p.data?.display_name ?? "", bio: p.data?.bio ?? "" });
    })();
  }, [session]);

  const removeSaved = async (id: string) => {
    await supabase.from("saved_articles").delete().eq("id", id);
    setSaved((s) => s.filter((x) => x.id !== id));
  };
  const removeReaction = async (id: string) => {
    await supabase.from("reactions").delete().eq("id", id);
    setReactions((s) => s.filter((x) => x.id !== id));
  };
  const removeComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    setComments((s) => s.filter((x) => x.id !== id));
  };
  const clearHistory = async () => {
    if (!session) return;
    await supabase.from("reading_history").delete().eq("user_id", session.user.id);
    setHistory([]);
    toast.success("Reading history cleared");
  };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id: session.user.id,
      display_name: profile.display_name,
      bio: profile.bio,
    }, { onConflict: "user_id" });
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  if (loading || !session) {
    return (
      <div className="container-news py-20 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your dashboard…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; Icon: typeof Bookmark; count: number }[] = [
    { id: "saved", label: "Saved", Icon: Bookmark, count: saved.length },
    { id: "history", label: "History", Icon: History, count: history.length },
    { id: "comments", label: "Comments", Icon: MessageSquare, count: comments.length },
    { id: "reactions", label: "Reactions", Icon: ThumbsUp, count: reactions.length },
    { id: "profile", label: "Profile", Icon: UserCircle2, count: 0 },
  ];

  return (
    <div className="bg-background">
      <Toaster richColors position="top-center" />
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="container-news h-16 flex items-center justify-between">
          <div>
            <div className="font-serif text-2xl">My ClearFact</div>
            <div className="text-xs opacity-80">{session.user.email}</div>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-sm hover:text-gold">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="container-news py-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1">
            {tabs.map(({ id, label, Icon, count }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-left ${
                  tab === id ? "bg-accent text-primary font-semibold" : "hover:bg-accent"
                }`}>
                <Icon className="h-4 w-4" /> {label}
                {id !== "profile" && <span className="ml-auto text-xs text-muted-foreground">{count}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {tab === "saved" && (
            <Section title="Saved articles" empty="You haven't saved any articles yet.">
              {saved.map((s) => (
                <Row key={s.id} a={s.articles} meta={`Saved ${new Date(s.created_at).toLocaleDateString()}`}
                  onRemove={() => removeSaved(s.id)} />
              ))}
            </Section>
          )}

          {tab === "history" && (
            <Section title="Reading history"
              empty="No reading history yet — start exploring."
              action={history.length ? <button onClick={clearHistory} className="text-sm text-destructive hover:underline">Clear all</button> : null}>
              {history.map((h, i) => (
                <Row key={i} a={h.articles} meta={`Read ${new Date(h.read_at).toLocaleString()}`} />
              ))}
            </Section>
          )}

          {tab === "comments" && (
            <Section title="Your comments" empty="You haven't commented on any articles yet.">
              {comments.map((c) => (
                <li key={c.id} className="border border-border rounded-sm p-4">
                  <div className="text-xs text-muted-foreground"><ArticleLink a={c.articles} /> · {new Date(c.created_at).toLocaleString()}</div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
                  <button onClick={() => removeComment(c.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </li>
              ))}
            </Section>
          )}

          {tab === "reactions" && (
            <Section title="Your reactions" empty="You haven't reacted to any articles yet.">
              {reactions.map((r) => (
                <Row key={r.id} a={r.articles}
                  meta={`${r.type} · ${new Date(r.created_at).toLocaleDateString()}`}
                  onRemove={() => removeReaction(r.id)} />
              ))}
            </Section>
          )}

          {tab === "profile" && (
            <form onSubmit={saveProfile} className="max-w-lg space-y-4">
              <h2 className="font-serif text-2xl">Profile</h2>
              <label className="block text-sm">
                <span className="font-semibold">Display name</span>
                <input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  maxLength={80}
                  className="mt-1 h-10 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Bio</span>
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  maxLength={300} rows={3}
                  className="mt-1 w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
              </label>
              <button disabled={savingProfile}
                className="h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold disabled:opacity-60">
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

function Section({ title, empty, children, action }: {
  title: string; empty: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">{title}</h2>
        {action}
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">{children}</ul>
      )}
    </div>
  );
}

function Row({ a, meta, onRemove }: { a: ArticleStub | null; meta: string; onRemove?: () => void }) {
  return (
    <li className="border border-border rounded-sm p-4 flex items-start justify-between gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">{a?.category ?? ""}</div>
        <div className="mt-1"><ArticleLink a={a} /></div>
        <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
      </div>
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
