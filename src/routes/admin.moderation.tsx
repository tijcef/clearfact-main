import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/moderation")({
  component: ModerationQueue,
});

type Comment = { id: string; body: string; created_at: string; user_id: string; article_id: string };

function ModerationQueue() {
  const [items, setItems] = useState<Comment[] | null>(null);

  const load = async () => {
    const { data } = await supabase.from("comments").select("*").order("created_at", { ascending: false }).limit(100);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Comment removed"); load(); }
  };

  return (
    <div className="container-news py-8">
      <h1 className="font-serif text-3xl flex items-center gap-2"><MessageSquare className="h-7 w-7 text-primary" /> Moderation queue</h1>
      <p className="text-sm text-muted-foreground mt-1">Review the latest community comments. Admins can remove violating content.</p>

      <div className="mt-6 space-y-3">
        {items === null ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground">No comments yet.</div>
        ) : items.map((c) => (
          <div key={c.id} className="rounded-sm border border-border p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{c.user_id.slice(0, 8)}… on article {c.article_id.slice(0, 8)}…</span>
              <span>{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
            <div className="mt-3 flex justify-end">
              <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
