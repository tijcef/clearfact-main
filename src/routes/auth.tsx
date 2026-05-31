import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create account — ClearFact News" },
      { name: "description", content: "Join ClearFact News to save articles, comment, react and track your reading history." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-news py-16 max-w-md">
      <Toaster richColors position="top-center" />
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold inline-flex items-center gap-1.5">
        <UserCircle2 className="h-3.5 w-3.5" /> Reader account
      </div>
      <h1 className="font-serif text-3xl mt-2">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Save articles, comment, react and keep your reading history.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
            placeholder="Display name (optional)"
            className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
        )}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)"
          className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
        <button disabled={busy} className="h-11 w-full rounded-sm bg-primary text-primary-foreground font-semibold disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <div className="mt-4 text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>New to ClearFact? <button className="text-primary font-semibold" onClick={() => setMode("signup")}>Create an account</button></>
        ) : (
          <>Already have one? <button className="text-primary font-semibold" onClick={() => setMode("signin")}>Sign in</button></>
        )}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        <Link to="/" className="underline">Back home</Link>
      </p>
    </div>
  );
}
