import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { ShieldCheck, FileText, Wallet, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

type Sub = Database["public"]["Tables"]["contributor_submissions"]["Row"];
type Prof = Database["public"]["Tables"]["contributor_profiles"]["Row"];

export const Route = createFileRoute("/contributor/")({
  component: Dashboard,
});

function Dashboard() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Prof | null>(null);
  const [subs, setSubs] = useState<Sub[]>([]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("contributor_profiles").select("*").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("contributor_submissions").select("*").eq("contributor_id", session.user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setProfile(p as Prof);
      setSubs((s ?? []) as Sub[]);
    })();
  }, [session]);

  if (!profile) return null;

  const stats = {
    accepted: profile.accepted_count,
    rejected: profile.rejected_count,
    pending: subs.filter((s) => s.status === "pending" || s.status === "ai_review" || s.status === "editor_review").length,
    balance: profile.wallet_balance_kobo,
  };

  return (
    <div className="container-news py-8 space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl">Welcome back</h1>
          <p className="text-muted-foreground text-sm">{profile.specialty.replace(/_/g, " ")} · {profile.location ?? "Nigeria"}</p>
        </div>
        <Link to="/contributor/submit" className="h-10 px-4 inline-flex items-center rounded-sm bg-primary text-primary-foreground font-semibold">+ New submission</Link>
      </div>

      {!profile.onboarding_complete && (
        <div className="border border-gold/40 bg-gold/10 rounded-sm p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-gold mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Complete your verification</div>
            <p className="text-sm text-muted-foreground">Verify phone, ID and selfie to unlock paid submissions and the Verified tier.</p>
          </div>
          <Link to="/contributor/onboarding" className="h-9 px-3 inline-flex items-center rounded-sm bg-gold text-gold-foreground font-semibold">Verify</Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Trust score" value={profile.trust_score} icon={<ShieldCheck className="h-4 w-4" />} hint={profile.tier} />
        <Stat label="Published" value={stats.accepted} icon={<CheckCircle2 className="h-4 w-4 text-verified" />} />
        <Stat label="In review" value={stats.pending} icon={<Clock className="h-4 w-4 text-gold" />} />
        <Stat label="Wallet (₦)" value={(stats.balance / 100).toLocaleString()} icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl">Recent submissions</h2>
          <Link to="/contributor/submissions" className="text-sm text-primary font-semibold hover:underline">View all</Link>
        </div>
        <div className="rounded-sm border border-border divide-y divide-border bg-card">
          {subs.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No submissions yet — pitch your first story.</div>}
          {subs.map((s) => (
            <div key={s.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold truncate">{s.title || "Untitled draft"}</div>
                <div className="text-xs text-muted-foreground">{s.category} · {new Date(s.created_at).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-border p-5 bg-accent/40">
        <div className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4" /> Tier progression</div>
        <p className="text-sm text-muted-foreground mt-1">Beginner → Trusted (3 published) → Verified (10 + trust 75) → Elite Reporter (25 + trust 85).</p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, hint }: { label: string; value: React.ReactNode; icon: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">{icon} {label}</div>
      <div className="font-serif text-2xl mt-1">{value}</div>
      {hint && <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    draft: { label: "Draft", cls: "bg-muted text-foreground", icon: <FileText className="h-3 w-3" /> },
    pending: { label: "Submitted", cls: "bg-accent text-accent-foreground", icon: <Clock className="h-3 w-3" /> },
    ai_review: { label: "AI scan", cls: "bg-gold/20 text-foreground", icon: <Clock className="h-3 w-3" /> },
    editor_review: { label: "Editor review", cls: "bg-gold/20 text-foreground", icon: <Clock className="h-3 w-3" /> },
    approved: { label: "Approved", cls: "bg-verified/15 text-verified", icon: <CheckCircle2 className="h-3 w-3" /> },
    published: { label: "Published", cls: "bg-verified/15 text-verified", icon: <CheckCircle2 className="h-3 w-3" /> },
    rejected: { label: "Rejected", cls: "bg-breaking/15 text-breaking", icon: <AlertCircle className="h-3 w-3" /> },
  };
  const v = map[status] ?? map.draft;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wider ${v.cls}`}>{v.icon}{v.label}</span>;
}
