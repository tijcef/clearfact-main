import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { LayoutDashboard, PenSquare, Wallet, Bell, ShieldCheck, Loader2, FileText, LogOut, Banknote, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ContribProfile = Database["public"]["Tables"]["contributor_profiles"]["Row"];

export const Route = createFileRoute("/contributor")({
  head: () => ({
    meta: [
      { title: "Contributor Hub — ClearFact News" },
      { name: "description", content: "Submit stories, manage drafts, track earnings and trust score." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContributorLayout,
});

function ContributorLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ContribProfile | null | "missing">("missing");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("contributor_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      setProfile((data as ContribProfile) ?? "missing");
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", session.user.id).eq("read", false);
      setUnread(count ?? 0);
    })();
  }, [session]);

  if (loading || !session) {
    return <div className="container-news py-20 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  if (profile === "missing") {
    return (
      <div className="container-news py-12 max-w-xl">
        <Toaster richColors position="top-center" />
        <div className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Citizen Journalism</div>
        <h1 className="font-serif text-3xl mt-2">Become a ClearFact contributor</h1>
        <p className="text-muted-foreground mt-2">Apply once. Submit stories, get verified by editors, earn payouts, build a trust score.</p>
        <Link to="/contributor/onboarding" className="inline-flex mt-6 h-11 items-center px-5 rounded-sm bg-primary text-primary-foreground font-semibold">Start application</Link>
      </div>
    );
  }

  const tierColor: Record<string, string> = {
    beginner: "bg-muted text-foreground",
    trusted: "bg-accent text-accent-foreground",
    verified: "bg-verified/15 text-verified",
    elite: "bg-gold text-gold-foreground",
  };

  return (
    <div>
      <Toaster richColors position="top-center" />
      <div className="border-b border-border bg-foreground text-background">
        <div className="container-news h-14 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <span className="font-serif text-lg">Contributor Hub</span>
            <nav className="flex items-center gap-1 text-sm flex-wrap">
              <NavLink to="/contributor" exact icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
              <NavLink to="/contributor/submit" icon={<PenSquare className="h-4 w-4" />}>Submit</NavLink>
              <NavLink to="/contributor/submissions" icon={<FileText className="h-4 w-4" />}>My stories</NavLink>
              <NavLink to="/contributor/wallet" icon={<Wallet className="h-4 w-4" />}>Wallet</NavLink>
              <NavLink to="/contributor/payouts" icon={<Banknote className="h-4 w-4" />}>Payouts</NavLink>
              <NavLink to="/contributor/referrals" icon={<Gift className="h-4 w-4" />}>Referrals</NavLink>
              <NavLink to="/contributor/notifications" icon={<Bell className="h-4 w-4" />}>
                Alerts {unread > 0 && <span className="ml-1 px-1.5 rounded-sm bg-breaking text-breaking-foreground text-[10px]">{unread}</span>}
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${tierColor[(profile as ContribProfile).tier]}`}>
              <ShieldCheck className="h-3 w-3" /> {(profile as ContribProfile).tier}
            </span>
            <span className="opacity-80">Trust {(profile as ContribProfile).trust_score}</span>
            <button onClick={signOut} className="inline-flex items-center gap-1 hover:text-gold"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function NavLink({ to, exact, children, icon }: { to: string; exact?: boolean; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      className="px-3 py-1.5 rounded-sm hover:bg-background/10 inline-flex items-center gap-1.5"
      activeProps={{ className: "px-3 py-1.5 rounded-sm bg-background/15 inline-flex items-center gap-1.5 font-semibold" }}
    >
      {icon}{children}
    </Link>
  );
}
