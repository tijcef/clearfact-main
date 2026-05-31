import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { Plus, Trash2, ShieldCheck, Loader2, Banknote } from "lucide-react";
import { requestWithdrawal, PROVIDER_LIST } from "@/lib/payouts.functions";

type Account = Database["public"]["Tables"]["payout_accounts"]["Row"];
type Withdrawal = Database["public"]["Tables"]["withdrawal_requests"]["Row"];
type Profile = Database["public"]["Tables"]["contributor_profiles"]["Row"];

export const Route = createFileRoute("/contributor/payouts")({
  component: PayoutsView,
});

const PROVIDER_LABELS: Record<string, string> = {
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  opay: "OPay",
  palmpay: "PalmPay",
  bank_transfer: "Bank transfer",
  stripe: "Stripe",
  wise: "Wise",
  paypal: "PayPal",
};

function PayoutsView() {
  const { session } = useAuth();
  const requestFn = useServerFn(requestWithdrawal);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<typeof PROVIDER_LIST[number]>("paystack");
  const [form, setForm] = useState({ display_name: "", account_number: "", bank_name: "", currency: "NGN", details: "" });
  const [withdrawForm, setWithdrawForm] = useState({ accountId: "", amountNaira: "" });

  const load = async () => {
    if (!session) return;
    const [{ data: a }, { data: w }, { data: p }] = await Promise.all([
      supabase.from("payout_accounts").select("*").eq("contributor_id", session.user.id).order("created_at", { ascending: false }),
      supabase.from("withdrawal_requests").select("*").eq("contributor_id", session.user.id).order("requested_at", { ascending: false }),
      supabase.from("contributor_profiles").select("*").eq("user_id", session.user.id).maybeSingle(),
    ]);
    setAccounts((a ?? []) as Account[]);
    setWithdrawals((w ?? []) as Withdrawal[]);
    setProfile(p as Profile);
    if (a && a[0]) setWithdrawForm((f) => ({ ...f, accountId: f.accountId || a[0].id }));
  };

  useEffect(() => { load(); }, [session]);

  const addAccount = async () => {
    if (!session) return;
    if (!form.display_name.trim()) { toast.error("Add a label"); return; }
    setBusy(true);
    const masked = form.account_number ? form.account_number.slice(-4).padStart(form.account_number.length, "•") : null;
    const { error } = await supabase.from("payout_accounts").insert({
      contributor_id: session.user.id,
      provider,
      display_name: form.display_name,
      account_number_masked: masked,
      bank_name: form.bank_name || null,
      currency: form.currency,
      details: form.details ? { notes: form.details } : {},
      is_default: accounts.length === 0,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account added");
    setForm({ display_name: "", account_number: "", bank_name: "", currency: "NGN", details: "" });
    load();
  };

  const removeAccount = async (id: string) => {
    if (!confirm("Remove this payout account?")) return;
    await supabase.from("payout_accounts").delete().eq("id", id);
    load();
  };

  const submitWithdrawal = async () => {
    const naira = parseFloat(withdrawForm.amountNaira);
    if (!withdrawForm.accountId) return toast.error("Select a payout account");
    if (!Number.isFinite(naira) || naira < 2000) return toast.error("Minimum withdrawal is ₦2,000");
    setBusy(true);
    try {
      await requestFn({ data: { payoutAccountId: withdrawForm.accountId, amountKobo: Math.round(naira * 100) } });
      toast.success("Withdrawal submitted for review");
      setWithdrawForm((f) => ({ ...f, amountNaira: "" }));
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const fmt = (k: number) => `₦${(k / 100).toLocaleString()}`;
  const balance = profile?.wallet_balance_kobo ?? 0;

  const STATUS_COLOR: Record<string, string> = {
    pending: "bg-muted text-foreground",
    approved: "bg-accent text-accent-foreground",
    processing: "bg-accent text-accent-foreground",
    paid: "bg-verified/15 text-verified",
    rejected: "bg-breaking/15 text-breaking",
    failed: "bg-breaking/15 text-breaking",
  };

  return (
    <div className="container-news py-8 space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl">Payouts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage payout destinations and request withdrawals.</p>
        </div>
        <Link to="/contributor/wallet" className="text-sm font-semibold text-primary hover:underline">Back to wallet →</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-sm border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2"><Banknote className="h-5 w-5" /><h2 className="font-serif text-xl">Request withdrawal</h2></div>
          <div className="text-sm text-muted-foreground">Available balance: <span className="font-mono font-semibold text-foreground">{fmt(balance)}</span></div>
          <div className="grid gap-3">
            <select value={withdrawForm.accountId} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountId: e.target.value })} className="h-10 px-3 rounded-sm border border-border bg-background">
              <option value="">Select payout account…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{PROVIDER_LABELS[a.provider]} — {a.display_name}</option>
              ))}
            </select>
            <input
              type="number" min={2000} step={100}
              placeholder="Amount in ₦ (min 2,000)"
              value={withdrawForm.amountNaira}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, amountNaira: e.target.value })}
              className="h-10 px-3 rounded-sm border border-border bg-background"
            />
            <button onClick={submitWithdrawal} disabled={busy || accounts.length === 0} className="h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit request
            </button>
            <p className="text-xs text-muted-foreground">A 1.5% gateway fee and 5% withholding tax may apply on payout. All withdrawals are reviewed for fraud.</p>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2"><Plus className="h-5 w-5" /><h2 className="font-serif text-xl">Add payout account</h2></div>
          <div className="grid gap-3">
            <select value={provider} onChange={(e) => setProvider(e.target.value as typeof PROVIDER_LIST[number])} className="h-10 px-3 rounded-sm border border-border bg-background">
              {PROVIDER_LIST.map((p) => <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>)}
            </select>
            <input placeholder="Label (e.g. GTBank — main)" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="h-10 px-3 rounded-sm border border-border bg-background" />
            <input placeholder="Account number / email" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className="h-10 px-3 rounded-sm border border-border bg-background" />
            <input placeholder="Bank / institution (optional)" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="h-10 px-3 rounded-sm border border-border bg-background" />
            <input placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="h-10 px-3 rounded-sm border border-border bg-background" />
            <textarea placeholder="Internal notes (optional)" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="px-3 py-2 rounded-sm border border-border bg-background min-h-[60px]" />
            <button onClick={addAccount} disabled={busy} className="h-10 px-4 rounded-sm bg-foreground text-background font-semibold disabled:opacity-60">Add account</button>
          </div>
        </section>
      </div>

      <section className="rounded-sm border border-border bg-card">
        <div className="px-4 py-3 border-b border-border font-semibold">Saved accounts</div>
        <div className="divide-y divide-border">
          {accounts.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No payout accounts yet.</div>}
          {accounts.map((a) => (
            <div key={a.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{PROVIDER_LABELS[a.provider]} · {a.display_name}</div>
                <div className="text-xs text-muted-foreground">{a.bank_name ? `${a.bank_name} · ` : ""}{a.account_number_masked ?? ""} · {a.currency}</div>
              </div>
              {a.verified && <span className="inline-flex items-center gap-1 text-xs text-verified"><ShieldCheck className="h-3 w-3" /> Verified</span>}
              <button onClick={() => removeAccount(a.id)} className="text-muted-foreground hover:text-breaking"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-sm border border-border bg-card">
        <div className="px-4 py-3 border-b border-border font-semibold">Withdrawal history</div>
        <div className="divide-y divide-border">
          {withdrawals.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No withdrawals yet.</div>}
          {withdrawals.map((w) => (
            <div key={w.id} className="p-4 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="font-mono font-semibold">{fmt(w.amount_kobo)}</div>
                <div className="text-xs text-muted-foreground">
                  Requested {new Date(w.requested_at).toLocaleString()} · fee {fmt(w.fee_kobo)} · tax {fmt(w.tax_kobo)}
                </div>
                {w.reviewer_note && <div className="text-xs text-muted-foreground mt-1">Note: {w.reviewer_note}</div>}
              </div>
              {w.fraud_score >= 40 && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-breaking/15 text-breaking">Fraud {w.fraud_score}</span>}
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold ${STATUS_COLOR[w.status]}`}>{w.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
