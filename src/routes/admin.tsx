import { createFileRoute, Link, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import {
  LogOut,
  PenSquare,
  LayoutDashboard,
  Loader2,
  Users,
  MessageSquare,
  BarChart3,
  Banknote,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Newsroom Dashboard — ClearFact" },
      { name: "description", content: "Internal newsroom dashboard for ClearFact editors." },
      { property: "og:title", content: "ClearFact Newsroom Dashboard" },
      { property: "og:description", content: "Editors and admins only." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session, loading, isEditor, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="container-news py-20 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="container-news py-20 max-w-lg">
        <Toaster richColors position="top-center" />
        <h1 className="font-serif text-3xl">Newsroom access required</h1>
        <p className="text-muted-foreground mt-2">
          Your account is signed in but doesn't yet have editor permissions.
        </p>
        <p className="mt-4">
          Contact the Lead / Founder or Chief Editor to request an assigned staff role.
        </p>
        <button
          onClick={signOut}
          className="mt-6 text-sm font-semibold text-primary hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <Toaster richColors position="top-center" />
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="container-news h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-serif text-lg">Newsroom</span>
            <nav className="flex items-center gap-1 text-sm flex-wrap">
              <Link
                to="/admin/dashboard"
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <BarChart3 className="h-4 w-4" /> Overview
              </Link>
              <Link
                to="/admin"
                activeOptions={{ exact: true }}
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <LayoutDashboard className="h-4 w-4" /> Articles
              </Link>
              <Link
                to="/admin/new"
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <PenSquare className="h-4 w-4" /> New
              </Link>
              <Link
                to="/admin/users"
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <Users className="h-4 w-4" /> Users
              </Link>
              <Link
                to="/admin/submissions"
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <PenSquare className="h-4 w-4" /> Submissions
              </Link>
              <Link
                to="/admin/moderation"
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <MessageSquare className="h-4 w-4" /> Moderation
              </Link>
              <Link
                to="/admin/payouts"
                className="px-3 py-1.5 rounded-sm hover:bg-primary-foreground/10 inline-flex items-center gap-1.5"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-sm bg-primary-foreground/15 inline-flex items-center gap-1.5 font-semibold",
                }}
              >
                <Banknote className="h-4 w-4" /> Payouts
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="opacity-80">{session.user.email}</span>
            <button onClick={signOut} className="inline-flex items-center gap-1 hover:text-gold">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
