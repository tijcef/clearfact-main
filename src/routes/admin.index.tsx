import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Plus, Pencil, Trash2, Loader2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Article = Database["public"]["Tables"]["articles"]["Row"];

export const Route = createFileRoute("/admin/")({
  component: AdminList,
});

const statusBadge: Record<Article["status"], { label: string; cls: string; icon: typeof FileText }> = {
  draft: { label: "Draft", cls: "bg-muted text-foreground border border-border", icon: FileText },
  scheduled: { label: "Scheduled", cls: "bg-gold text-gold-foreground", icon: Calendar },
  published: { label: "Published", cls: "bg-verified text-verified-foreground", icon: CheckCircle2 },
};

function AdminList() {
  const [items, setItems] = useState<Article[] | null>(null);
  const [filter, setFilter] = useState<"all" | Article["status"]>("all");

  const load = async () => {
    let q = supabase.from("articles").select("*").order("updated_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) { toast.error(error.message); return; }
    setItems(data);
  };

  useEffect(() => { load(); }, [filter]);

  const remove = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Article deleted");
    load();
  };

  return (
    <div className="container-news py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Articles</h1>
          <p className="text-sm text-muted-foreground">Drafts, scheduled posts and the public archive.</p>
        </div>
        <Link to="/admin/new" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      <div className="mt-6 flex gap-1 text-sm">
        {(["all", "draft", "scheduled", "published"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 h-9 rounded-sm border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-accent"}`}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-sm border border-border overflow-hidden">
        {items === null ? (
          <div className="p-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No articles yet. <Link to="/admin/new" className="text-primary font-semibold">Write your first one →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
                <th className="p-3 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const S = statusBadge[a.status];
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="font-serif font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground">/{a.slug}</div>
                    </td>
                    <td className="p-3">{a.category}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wide ${S.cls}`}>
                        <S.icon className="h-3 w-3" /> {S.label}
                      </span>
                      {a.status === "scheduled" && a.scheduled_at && (
                        <div className="text-[11px] text-muted-foreground mt-1">for {new Date(a.scheduled_at).toLocaleString()}</div>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(a.updated_at).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <Link to="/admin/edit/$id" params={{ id: a.id }} className="inline-flex items-center gap-1 text-primary font-semibold hover:underline">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button onClick={() => remove(a.id)} className="ml-3 inline-flex items-center gap-1 text-destructive hover:underline">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
