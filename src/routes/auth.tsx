import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";

type AuthMode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create account — ClearFact News" },
      {
        name: "description",
        content:
          "Create a secure ClearFact account to save articles, publish books, comment and manage your profile.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset instructions sent. Check your email.");
        setMode("signin");
        return;
      }

      if (mode === "signup") {
        if (!fullName.trim()) throw new Error("Enter your full name.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              display_name: fullName.trim(),
              full_name: fullName.trim(),
              phone: phone.trim() || null,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm it.");
        setMode("signin");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-primary/[0.06] via-background to-background px-4 py-10 md:py-16">
      <Toaster richColors position="top-center" />
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              <ShieldCheck className="h-4 w-4 text-gold" /> ClearFact account
            </div>
            <h1 className="mt-8 max-w-sm font-serif text-4xl leading-tight">
              Your trusted space for stories, books and opportunities.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/75">
              Keep your reading history, submit work, publish books and manage your author details
              from one secure account.
            </p>
          </div>
          <div className="text-xs text-primary-foreground/60">
            Verified · Transparent · Nigerian.
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <LockKeyhole className="h-4 w-4" /> Secure access
          </div>
          <h2 className="mt-3 font-serif text-3xl text-foreground">
            {isForgot ? "Reset your password" : isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {isForgot
              ? "Enter your account email and we will send you a secure reset link."
              : isSignup
                ? "Start with your basic details. You can complete your address and author profile after signing in."
                : "Sign in to save articles, manage your profile and access ClearFact Books."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {isSignup && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" icon={<UserRound className="h-4 w-4" />}>
                  <input
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Emmanuel Sunday Tijwun"
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone number" icon={<Phone className="h-4 w-4" />} hint="Optional">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+234 800 000 0000"
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            <Field label="Email address" icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>

            {!isForgot && (
              <Field
                label="Password"
                icon={<KeyRound className="h-4 w-4" />}
                hint="Minimum 8 characters"
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            )}

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : isForgot
                  ? "Send reset link"
                  : isSignup
                    ? "Create secure account"
                    : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            {mode === "signin" && (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode("forgot")}
              >
                Forgot password?
              </button>
            )}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode(isSignup ? "signin" : "signup")}
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "New to ClearFact? Create an account"}
            </button>
          </div>

          {isForgot && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="mt-4 text-sm font-semibold text-muted-foreground underline underline-offset-4"
            >
              Back to sign in
            </button>
          )}

          <p className="mt-8 text-xs leading-5 text-muted-foreground">
            By continuing, you agree to use ClearFact responsibly and provide accurate account
            information. Your private contact and payout details are not displayed publicly.
          </p>
          <p className="mt-5 text-xs text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Back to ClearFact News
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 flex items-center gap-2 font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {label}
        {hint && <span className="font-normal text-muted-foreground">({hint})</span>}
      </span>
      {children}
    </label>
  );
}
