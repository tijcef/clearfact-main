import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ClearFact Newsroom" },
      { name: "description", content: "Newsroom sign-in for ClearFact editors." },
      { property: "og:title", content: "ClearFact Newsroom Sign-in" },
      { property: "og:description", content: "Editors and admins only." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-news py-16 max-w-md">
      <Toaster richColors position="top-center" />
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" /> Newsroom access
      </div>
      <h1 className="font-serif text-3xl mt-2">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Editors and admins manage articles from the newsroom dashboard.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clearfact.ng" className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)" className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" />
        <button disabled={busy} className="h-11 w-full rounded-sm bg-primary text-primary-foreground font-semibold disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <div className="mt-4 text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>New here? <button className="text-primary font-semibold" onClick={() => setMode("signup")}>Create an account</button></>
        ) : (
          <>Already have one? <button className="text-primary font-semibold" onClick={() => setMode("signin")}>Sign in</button></>
        )}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        First account becomes the workspace admin once an admin grants you the role. <Link to="/" className="underline">Back home</Link>
      </p>
    </div>
  );
}
