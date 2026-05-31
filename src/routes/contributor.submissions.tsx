import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "./contributor.index";
import type { Database } from "@/integrations/supabase/types";
import { ChevronDown, ChevronUp } from "lucide-react";

type Sub = Database["public"]["Tables"]["contributor_submissions"]["Row"];

export const Route = createFileRoute("/contributor/submissions")({
  component: List,
});

function List() {
  const { session } = useAuth();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("contributor_submissions").select("*").eq("contributor_id", session.user.id).order("created_at", { ascending: false });
      setSubs((data ?? []) as Sub[]);
    })();
  }, [session]);

  return (
    <div className="container-news py-8 space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-3xl">My submissions</h1>
        <Link to="/contributor/submit" className="h-10 px-4 inline-flex items-center rounded-sm bg-primary text-primary-foreground font-semibold">+ New</Link>
      </div>

      <div className="rounded-sm border border-border divide-y divide-border bg-card">
        {subs.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nothing yet.</div>}
        {subs.map((s) => {
          const ai = s.ai_analysis as { trust_score?: number; verdict?: string; summary?: string; red_flags?: string[] } | null;
          return (
            <div key={s.id}>
              <button onClick={() => setOpen(open === s.id ? null : s.id)} className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-accent/40">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.category} · {new Date(s.created_at).toLocaleDateString()}{s.plagiarism_score != null && ` · plagiarism risk ${s.plagiarism_score}%`}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  {open === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
              {open === s.id && (
                <div className="px-4 pb-4 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold mb-1">Excerpt</div>
                    <p className="text-muted-foreground">{s.excerpt || "—"}</p>
                    {s.editor_feedback && (
                      <div className="mt-3 p-3 rounded-sm border border-gold/40 bg-gold/10">
                        <div className="text-xs uppercase tracking-wider font-semibold text-gold">Editor feedback</div>
                        <p className="mt-1">{s.editor_feedback}</p>
                      </div>
                    )}
                  </div>
                  {ai && (
                    <div className="rounded-sm border border-border p-3 bg-background">
                      <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">AI screening</div>
                      <div className="mt-1">Trust score <strong>{ai.trust_score}/100</strong> · Verdict <strong>{ai.verdict}</strong></div>
                      <p className="text-muted-foreground mt-1">{ai.summary}</p>
                      {ai.red_flags && ai.red_flags.length > 0 && (
                        <ul className="mt-2 list-disc pl-5 text-xs text-breaking">
                          {ai.red_flags.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
