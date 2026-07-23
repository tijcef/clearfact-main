import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, ThumbsUp, Lightbulb, ThumbsDown, MessageSquare, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const REACTIONS = [
  { type: "like" as const, label: "Helpful", Icon: ThumbsUp },
  { type: "insightful" as const, label: "Insightful", Icon: Lightbulb },
  { type: "disagree" as const, label: "Disagree", Icon: ThumbsDown },
];

interface CommentRow {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  display_name?: string | null;
}

export function ArticleEngagement({ articleId }: { articleId: string }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [saved, setSaved] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  // Track reading history
  useEffect(() => {
    if (!userId) return;
    supabase.from("reading_history").upsert(
      { user_id: userId, article_id: articleId, read_at: new Date().toISOString() },
      { onConflict: "user_id,article_id" }
    ).then(() => {});
  }, [userId, articleId]);

  // Load engagement state
  useEffect(() => {
    (async () => {
      const [r, c] = await Promise.all([
        supabase.from("reactions").select("type,user_id").eq("article_id", articleId),
        supabase.from("comments").select("id,user_id,body,created_at")
          .eq("article_id", articleId).order("created_at", { ascending: false }),
      ]);
      const tally: Record<string, number> = {};
      const m = new Set<string>();
      (r.data ?? []).forEach((row: { type: string; user_id: string }) => {
        tally[row.type] = (tally[row.type] ?? 0) + 1;
        if (row.user_id === userId) m.add(row.type);
      });
      setCounts(tally);
      setMine(m);

      const rows = (c.data ?? []) as CommentRow[];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles")
          .select("user_id,display_name").in("user_id", ids);
        const map = new Map((profs ?? []).map((p) => [p.user_id, p.display_name]));
        rows.forEach((r) => { r.display_name = map.get(r.user_id) ?? null; });
      }
      setComments(rows);

      if (userId) {
        const { data } = await supabase.from("saved_articles")
          .select("id").eq("user_id", userId).eq("article_id", articleId).maybeSingle();
        setSaved(!!data);
      }
    })();
  }, [articleId, userId]);

  const toggleSave = async () => {
    if (!userId) return;
    if (saved) {
      await supabase.from("saved_articles").delete()
        .eq("user_id", userId).eq("article_id", articleId);
      setSaved(false);
    } else {
      const { error } = await supabase.from("saved_articles")
        .insert({ user_id: userId, article_id: articleId });
      if (!error) setSaved(true);
    }
  };

  const toggleReaction = async (type: "like" | "insightful" | "disagree") => {
    if (!userId) return;
    const has = mine.has(type);
    if (has) {
      await supabase.from("reactions").delete()
        .eq("user_id", userId).eq("article_id", articleId).eq("type", type);
      const next = new Set(mine); next.delete(type); setMine(next);
      setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] ?? 1) - 1) }));
    } else {
      const { error } = await supabase.from("reactions")
        .insert({ user_id: userId, article_id: articleId, type });
      if (!error) {
        const next = new Set(mine); next.add(type); setMine(next);
        setCounts((c) => ({ ...c, [type]: (c[type] ?? 0) + 1 }));
      }
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !body.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.from("comments")
      .insert({ user_id: userId, article_id: articleId, body: body.trim() })
      .select("id,user_id,body,created_at").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    const { data: prof } = await supabase.from("profiles")
      .select("display_name").eq("user_id", userId).maybeSingle();
    const row: CommentRow = { ...(data as CommentRow), display_name: prof?.display_name ?? null };
    setComments((cs) => [row, ...cs]);
    setBody("");
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setComments((cs) => cs.filter((c) => c.id !== id));
  };

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={toggleSave} disabled={!userId}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-sm border border-border text-sm font-semibold hover:bg-accent disabled:opacity-50">
          {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          {saved ? "Saved" : "Save"}
        </button>
        {REACTIONS.map(({ type, label, Icon }) => (
          <button key={type} onClick={() => toggleReaction(type)} disabled={!userId}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-sm border text-sm font-semibold disabled:opacity-50 ${
              mine.has(type) ? "border-primary bg-accent text-primary" : "border-border hover:bg-accent"
            }`}>
            <Icon className="h-4 w-4" /> {label} <span className="text-muted-foreground">{counts[type] ?? 0}</span>
          </button>
        ))}
        {!userId && (
          <Link to="/auth" className="ml-auto text-sm font-semibold text-primary hover:underline">
            Sign in to save, react and comment →
          </Link>
        )}
      </div>

      <h2 className="font-serif text-2xl mt-10 inline-flex items-center gap-2">
        <MessageSquare className="h-5 w-5" /> Comments <span className="text-muted-foreground text-base">({comments.length})</span>
      </h2>

      {userId ? (
        <form onSubmit={postComment} className="mt-4 space-y-2">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={3}
            placeholder="Share a verifiable point, source or polite disagreement…"
            className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary text-sm" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{body.length}/2000 · Be civil. Comments may be moderated.</span>
            <button disabled={busy || !body.trim()}
              className="h-9 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to join the discussion.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="border border-border rounded-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {c.display_name ?? "Reader"}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              {c.user_id === userId && (
                <button onClick={() => deleteComment(c.id)} aria-label="Delete comment"
                  className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-muted-foreground">No comments yet. Be the first.</li>}
      </ul>
    </section>
  );
}
