import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { decideWithdrawal } from "@/lib/payouts.functions";
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Send } from "lucide-react";

type W = Database["public"]["Tables"]["withdrawal_requests"]["Row"];
type Acc = Database["public"]["Tables"]["payout_accounts"]["Row"];

export const Route = createFileRoute("/admin/payouts")({
  component: AdminPayouts,
});

function AdminPayouts() {
  const decideFn = useServerFn(decideWithdrawal);
  const [items, setItems] = useState<W[]>([]);
  const [accs, setAccs] = useState<Record<string, Acc>>({});
  const [filter, setFilter] = useState<string>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [refs, setRefs] = useState<Record<string, string>>({});

  const load = async () => {
    let q = supabase.from("withdrawal_requests").select("*").order("requested_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as W["status"]);
    const { data } = await q;
    const list = (data ?? []) as W[];
    setItems(list);
    const ids = Array.from(new Set(list.map((w) => w.payout_account_id)));
    if (ids.length) {
      const { data: a } = await supabase.from("payout_accounts").select("*").in("id", ids);
      const map: Record<string, Acc> = {};
      (a ?? []).forEach((x) => { map[(x as Acc).id] = x as Acc; });
      setAccs(map);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const decide = async (w: W, decision: "approve" | "reject" | "mark_paid" | "mark_failed") => {
    setBusy(w.id);
    try {
      await decideFn({ data: { withdrawalId: w.id, decision, note: notes[w.id], gatewayReference: refs[w.id] } });
      toast.success(`Withdrawal ${decision.replace("_", " ")}`);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(null); }
  };

  const fmt = (k: number) => `₦${(k / 100).toLocaleString()}`;

  return (
    <div className="container-news py-8 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl">Payout queue</h1>
          <p className="text-muted-foreground text-sm">Approve, reject and mark contributor withdrawals as paid.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 px-3 rounded-sm border border-border bg-background text-sm">
          {["pending", "approved", "processing", "paid", "rejected", "failed", "all"].map((s) => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {items.length === 0 && <p className="text-muted-foreground py-6">No requests in this view.</p>}

      <div className="space-y-4">
        {items.map((w) => {
          const a = accs[w.payout_account_id];
          const flags = (w.fraud_flags as string[] | null) ?? [];
          return (
            <div key={w.id} className="rounded-sm border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-mono text-2xl font-semibold">{fmt(w.amount_kobo)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {a ? `${a.provider} · ${a.display_name}${a.account_number_masked ? ` · ${a.account_number_masked}` : ""}` : "Unknown account"}
                  </div>
                  <div className="text-xs text-muted-foreground">Fee {fmt(w.fee_kobo)} · Tax {fmt(w.tax_kobo)} · Net {fmt(w.amount_kobo - w.fee_kobo - w.tax_kobo)}</div>
                  <div className="text-xs text-muted-foreground">Requested {new Date(w.requested_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold bg-accent">{w.status}</span>
                  {w.fraud_score > 0 && (
                    <div className={`mt-2 inline-flex items-center gap-1 text-xs ${w.fraud_score >= 40 ? "text-breaking" : "text-muted-foreground"}`}>
                      <AlertTriangle className="h-3 w-3" /> Fraud score {w.fraud_score}
                    </div>
                  )}
                </div>
              </div>

              {flags.length > 0 && (
                <div className="mt-3 flex gap-1.5 flex-wrap">
                  {flags.map((f) => <span key={f} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-breaking/10 text-breaking">{f.replace(/_/g, " ")}</span>)}
                </div>
              )}

              {(w.status === "pending" || w.status === "approved") && (
                <div className="mt-4 grid md:grid-cols-2 gap-2">
                  <input
                    placeholder="Reviewer note"
                    value={notes[w.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [w.id]: e.target.value })}
                    className="h-9 px-3 rounded-sm border border-border bg-background text-sm"
                  />
                  {w.status === "approved" && (
                    <input
                      placeholder="Gateway reference"
                      value={refs[w.id] ?? ""}
                      onChange={(e) => setRefs({ ...refs, [w.id]: e.target.value })}
                      className="h-9 px-3 rounded-sm border border-border bg-background text-sm"
                    />
                  )}
                </div>
              )}

              <div className="mt-3 flex gap-2 flex-wrap">
                {w.status === "pending" && (
                  <>
                    <button disabled={busy === w.id} onClick={() => decide(w, "approve")} className="h-9 px-3 rounded-sm bg-verified text-background text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60">
                      {busy === w.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Approve
                    </button>
                    <button disabled={busy === w.id} onClick={() => decide(w, "reject")} className="h-9 px-3 rounded-sm bg-breaking text-breaking-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </>
                )}
                {w.status === "approved" && (
                  <>
                    <button disabled={busy === w.id} onClick={() => decide(w, "mark_paid")} className="h-9 px-3 rounded-sm bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60">
                      <Send className="h-3.5 w-3.5" /> Mark paid
                    </button>
                    <button disabled={busy === w.id} onClick={() => decide(w, "mark_failed")} className="h-9 px-3 rounded-sm bg-breaking/15 text-breaking text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60">
                      <XCircle className="h-3.5 w-3.5" /> Mark failed
                    </button>
                  </>
                )}
              </div>
              {w.reviewer_note && <div className="mt-3 text-xs text-muted-foreground">Note: {w.reviewer_note}</div>}
              {w.gateway_reference && <div className="mt-1 text-xs text-muted-foreground font-mono">Ref: {w.gateway_reference}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
