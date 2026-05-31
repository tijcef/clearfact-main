import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { Wallet, ArrowDownToLine, TrendingUp, Gift } from "lucide-react";

type Entry = Database["public"]["Tables"]["wallet_ledger"]["Row"];
type Prof = Database["public"]["Tables"]["contributor_profiles"]["Row"];

export const Route = createFileRoute("/contributor/wallet")({
  component: WalletView,
});

function WalletView() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [profile, setProfile] = useState<Prof | null>(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const [{ data: e }, { data: p }] = await Promise.all([
        supabase.from("wallet_ledger").select("*").eq("contributor_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("contributor_profiles").select("*").eq("user_id", session.user.id).maybeSingle(),
      ]);
      setEntries((e ?? []) as Entry[]);
      setProfile(p as Prof);
    })();
  }, [session]);

  const fmt = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;
  const totalEarned = entries.filter((e) => e.kind === "earning" || e.kind === "bonus").reduce((s, e) => s + e.amount_kobo, 0);

  const ICON: Record<string, React.ReactNode> = {
    earning: <TrendingUp className="h-4 w-4 text-verified" />,
    bonus: <Gift className="h-4 w-4 text-gold" />,
    payout: <ArrowDownToLine className="h-4 w-4" />,
    adjustment: <Wallet className="h-4 w-4" />,
  };

  return (
    <div className="container-news py-8 space-y-6">
      <h1 className="font-serif text-3xl">Wallet</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-sm border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Available balance</div>
          <div className="font-serif text-3xl mt-1">{fmt(profile?.wallet_balance_kobo ?? 0)}</div>
          <Link to="/contributor/payouts" className="mt-3 inline-flex h-9 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-semibold items-center">Request payout</Link>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime earned</div>
          <div className="font-serif text-3xl mt-1">{fmt(totalEarned)}</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Stories published</div>
          <div className="font-serif text-3xl mt-1">{profile?.accepted_count ?? 0}</div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card">
        <div className="px-4 py-3 border-b border-border font-semibold">Ledger</div>
        <div className="divide-y divide-border">
          {entries.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No transactions yet.</div>}
          {entries.map((e) => (
            <div key={e.id} className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-sm bg-accent/40">{ICON[e.kind]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold capitalize">{e.kind} · {e.note ?? ""}</div>
                <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
              </div>
              <div className={`font-mono font-semibold ${e.kind === "payout" ? "text-breaking" : "text-verified"}`}>
                {e.kind === "payout" ? "−" : "+"}{fmt(e.amount_kobo)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
