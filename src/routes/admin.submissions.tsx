import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { decideSubmission } from "@/lib/contributor.functions";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

type Sub = Database["public"]["Tables"]["contributor_submissions"]["Row"];

export const Route = createFileRoute("/admin/submissions")({
  component: Queue,
});

function Queue() {
  const decide = useServerFn(decideSubmission);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [payout, setPayout] = useState(2500);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("contributor_submissions").select("*").in("status", ["editor_review", "ai_review", "pending"]).order("submitted_at", { ascending: true });
    setSubs((data ?? []) as Sub[]);
  };
  useEffect(() => { load(); }, []);

  const act = async (id: string, decision: "approve" | "reject") => {
    setBusy(id + decision);
    try {
      const r = await decide({ data: { submissionId: id, decision, feedback: feedback || undefined, payoutKobo: decision === "approve" ? payout * 100 : undefined } });
      toast.success(decision === "approve" ? `Published: /article/${(r as { slug?: string }).slug}` : "Rejected with feedback");
      setOpen(null); setFeedback(""); load();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };

  return (
    <div className="container-news py-8 space-y-4">
      <h1 className="font-serif text-3xl">Submission queue <span className="text-muted-foreground text-base">({subs.length})</span></h1>
      <div className="rounded-sm border border-border bg-card divide-y divide-border">
        {subs.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nothing in the queue.</div>}
        {subs.map((s) => {
          const ai = s.ai_analysis as { trust_score?: number; verdict?: string; summary?: string; red_flags?: string[]; hate_speech_risk?: string; fake_news_risk?: string } | null;
          return (
            <div key={s.id}>
              <button onClick={() => setOpen(open === s.id ? null : s.id)} className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-accent/40">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.category} · submitted {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "—"}</div>
                </div>
                {ai && <div className="text-xs px-2 py-1 rounded-sm bg-accent">AI {ai.verdict} · trust {ai.trust_score}</div>}
              </button>
              {open === s.id && (
                <div className="px-4 pb-6 grid lg:grid-cols-[1fr_320px] gap-6">
                  <article className="space-y-3">
                    {s.cover_image && <img src={s.cover_image} alt="" className="w-full rounded-sm border border-border" />}
                    <p className="font-serif text-lg leading-relaxed">{s.excerpt}</p>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap font-serif">{s.body}</div>
                    {Array.isArray(s.sources) && (s.sources as { title: string; url: string }[]).length > 0 && (
                      <div className="rounded-sm border border-border p-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sources</div>
                        <ul className="text-sm mt-2 space-y-1">
                          {(s.sources as { title: string; url: string }[]).map((src, i) => (
                            <li key={i}><a href={src.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">{src.title || src.url} <ExternalLink className="h-3 w-3" /></a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                  <aside className="space-y-3">
                    {ai && (
                      <div className="rounded-sm border border-border bg-background p-3 text-sm">
                        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">AI screening</div>
                        <div className="mt-1">Trust <strong>{ai.trust_score}</strong> · Plagiarism risk <strong>{s.plagiarism_score}%</strong></div>
                        <div className="text-xs mt-1">Hate {ai.hate_speech_risk} · Fake-news {ai.fake_news_risk}</div>
                        <p className="text-muted-foreground mt-2 text-xs">{ai.summary}</p>
                        {ai.red_flags && ai.red_flags.length > 0 && (
                          <ul className="mt-2 list-disc pl-4 text-xs text-breaking">
                            {ai.red_flags.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} placeholder="Editor feedback (sent to contributor)" className="w-full p-2 rounded-sm border border-border bg-background text-sm" />
                    <label className="block text-xs">
                      Payout (₦)
                      <input type="number" min={0} step={500} value={payout} onChange={(e) => setPayout(Number(e.target.value))} className="h-9 w-full px-2 mt-1 rounded-sm border border-border bg-background" />
                    </label>
                    <div className="flex gap-2">
                      <button disabled={!!busy} onClick={() => act(s.id, "approve")} className="flex-1 h-10 rounded-sm bg-verified text-background font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {busy === s.id + "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve & publish
                      </button>
                      <button disabled={!!busy} onClick={() => act(s.id, "reject")} className="flex-1 h-10 rounded-sm bg-breaking text-breaking-foreground font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
                        {busy === s.id + "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
                      </button>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
