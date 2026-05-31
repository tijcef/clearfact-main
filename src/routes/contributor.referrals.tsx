import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { Copy, Gift, Users } from "lucide-react";
import { claimReferral } from "@/lib/payouts.functions";

type Referral = Database["public"]["Tables"]["referrals"]["Row"];

export const Route = createFileRoute("/contributor/referrals")({
  component: ReferralsView,
});

function genCode(uid: string) {
  return ("CF" + uid.replace(/[^a-z0-9]/gi, "").slice(0, 6)).toUpperCase();
}

function ReferralsView() {
  const { session } = useAuth();
  const claimFn = useServerFn(claimReferral);
  const [code, setCode] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [claimCode, setClaimCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!session) return;
    const { data: prof } = await supabase.from("contributor_profiles").select("referral_code").eq("user_id", session.user.id).maybeSingle();
    let c = prof?.referral_code as string | undefined;
    if (!c) {
      c = genCode(session.user.id);
      await supabase.from("contributor_profiles").update({ referral_code: c }).eq("user_id", session.user.id);
    }
    setCode(c);
    const { data: refs } = await supabase.from("referrals").select("*").eq("referrer_id", session.user.id).order("created_at", { ascending: false });
    setReferrals((refs ?? []) as Referral[]);
  };

  useEffect(() => { load(); }, [session]);

  const link = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${code}` : `?ref=${code}`;
  const totalEarned = referrals.filter((r) => r.rewarded).reduce((s, r) => s + r.reward_kobo, 0);

  const claim = async () => {
    if (!claimCode.trim()) return;
    setBusy(true);
    try {
      const res = await claimFn({ data: { referralCode: claimCode.trim().toUpperCase(), kind: "contributor" } });
      toast.success(`Referral applied. Your inviter earned ₦${(res.reward_kobo / 100).toLocaleString()}.`);
      setClaimCode("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="container-news py-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Referrals</h1>
        <p className="text-muted-foreground text-sm mt-1">Earn ₦500 for every contributor and ₦100 for every reader you bring in.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-sm border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your code</div>
          <div className="font-mono text-2xl mt-1">{code || "—"}</div>
          <button onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            <Copy className="h-3.5 w-3.5" /> Copy invite link
          </button>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">People referred</div>
          <div className="font-serif text-3xl mt-1 inline-flex items-center gap-2"><Users className="h-6 w-6 text-muted-foreground" />{referrals.length}</div>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Bonus earned</div>
          <div className="font-serif text-3xl mt-1 inline-flex items-center gap-2"><Gift className="h-6 w-6 text-gold" />₦{(totalEarned / 100).toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-5 max-w-xl">
        <h2 className="font-serif text-xl">Have a referral code?</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter the code of the person who invited you.</p>
        <div className="flex gap-2 mt-3">
          <input value={claimCode} onChange={(e) => setClaimCode(e.target.value.toUpperCase())} placeholder="CFXXXXXX" className="h-10 px-3 rounded-sm border border-border bg-background flex-1 font-mono uppercase" />
          <button onClick={claim} disabled={busy} className="h-10 px-4 rounded-sm bg-primary text-primary-foreground font-semibold disabled:opacity-60">Apply</button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card">
        <div className="px-4 py-3 border-b border-border font-semibold">Your referrals</div>
        <div className="divide-y divide-border">
          {referrals.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No referrals yet — share your link.</div>}
          {referrals.map((r) => (
            <div key={r.id} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-semibold capitalize">{r.referred_kind} signup</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className={`font-mono font-semibold ${r.rewarded ? "text-verified" : "text-muted-foreground"}`}>+₦{(r.reward_kobo / 100).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
