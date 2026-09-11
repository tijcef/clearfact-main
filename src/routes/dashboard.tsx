import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { Toaster, toast } from "sonner";
import {
  AtSign,
  Bookmark,
  Building2,
  Home,
  History,
  MapPin,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  ThumbsUp,
  LogOut,
  Loader2,
  UserCircle2,
  UserRound,
  WalletCards,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — ClearFact News" },
      {
        name: "description",
        content: "Your saved articles, comments, reactions and reading history.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type ArticleStub = {
  id: string;
  slug: string;
  title: string;
  category: string;
  published_at: string | null;
};
type SavedRow = { id: string; created_at: string; articles: ArticleStub | null };
type HistoryRow = { read_at: string; articles: ArticleStub | null };
type ReactionRow = { id: string; type: string; created_at: string; articles: ArticleStub | null };
type CommentRow = { id: string; body: string; created_at: string; articles: ArticleStub | null };
type PublicProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "display_name" | "full_name" | "pen_name" | "bio" | "website"
>;
type ContactDetails = Database["public"]["Tables"]["profile_contacts"]["Row"];
type PayoutSummary = Pick<
  Database["public"]["Tables"]["payout_accounts"]["Row"],
  | "provider"
  | "display_name"
  | "bank_name"
  | "account_number_masked"
  | "currency"
  | "verified"
  | "is_default"
>;

type Tab = "saved" | "history" | "comments" | "reactions" | "profile";

function ArticleLink({ a }: { a: ArticleStub | null }) {
  if (!a) return <span className="text-muted-foreground">Article removed</span>;
  return (
    <Link to="/post/$slug" params={{ slug: a.slug }} className="font-semibold hover:text-primary">
      {a.title}
    </Link>
  );
}

function Dashboard() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("saved");
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [profile, setProfile] = useState<PublicProfile>({
    display_name: "",
    full_name: "",
    pen_name: "",
    bio: "",
    website: "",
  });
  const [contact, setContact] = useState<ContactDetails>({
    user_id: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_region: "",
    country: "Nigeria",
    postal_code: "",
    created_at: "",
    updated_at: "",
  });
  const [payoutAccount, setPayoutAccount] = useState<PayoutSummary | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    const cols = "id,slug,title,category,published_at";
    (async () => {
      const [s, h, r, c, p, contactDetails, payout] = await Promise.all([
        supabase
          .from("saved_articles")
          .select(`id,created_at,articles(${cols})`)
          .order("created_at", { ascending: false }),
        supabase
          .from("reading_history")
          .select(`read_at,articles(${cols})`)
          .order("read_at", { ascending: false })
          .limit(50),
        supabase
          .from("reactions")
          .select(`id,type,created_at,articles(${cols})`)
          .order("created_at", { ascending: false }),
        supabase
          .from("comments")
          .select(`id,body,created_at,articles(${cols})`)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("display_name,full_name,pen_name,bio,website")
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase.from("profile_contacts").select("*").eq("user_id", session.user.id).maybeSingle(),
        supabase
          .from("payout_accounts")
          .select(
            "provider,display_name,bank_name,account_number_masked,currency,verified,is_default",
          )
          .eq("contributor_id", session.user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setSaved((s.data ?? []) as unknown as SavedRow[]);
      setHistory((h.data ?? []) as unknown as HistoryRow[]);
      setReactions((r.data ?? []) as unknown as ReactionRow[]);
      setComments((c.data ?? []) as unknown as CommentRow[]);
      setProfile({
        display_name: p.data?.display_name ?? "",
        full_name: p.data?.full_name ?? "",
        pen_name: p.data?.pen_name ?? "",
        bio: p.data?.bio ?? "",
        website: p.data?.website ?? "",
      });
      setContact(
        contactDetails.data
          ? (contactDetails.data as ContactDetails)
          : {
              user_id: session.user.id,
              phone: null,
              address_line1: null,
              address_line2: null,
              city: null,
              state_region: null,
              country: "Nigeria",
              postal_code: null,
              created_at: "",
              updated_at: "",
            },
      );
      setPayoutAccount((payout.data as PayoutSummary | null) ?? null);
    })();
  }, [session]);

  const removeSaved = async (id: string) => {
    await supabase.from("saved_articles").delete().eq("id", id);
    setSaved((s) => s.filter((x) => x.id !== id));
  };
  const removeReaction = async (id: string) => {
    await supabase.from("reactions").delete().eq("id", id);
    setReactions((s) => s.filter((x) => x.id !== id));
  };
  const removeComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    setComments((s) => s.filter((x) => x.id !== id));
  };
  const clearHistory = async () => {
    if (!session) return;
    await supabase.from("reading_history").delete().eq("user_id", session.user.id);
    setHistory([]);
    toast.success("Reading history cleared");
  };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (contact.phone && !/^\+?[0-9\s().-]{7,20}$/.test(contact.phone)) {
      toast.error("Enter a valid phone number, preferably with country code.");
      return;
    }
    setSavingProfile(true);
    const [{ error: profileError }, { error: contactError }] = await Promise.all([
      supabase.from("profiles").upsert(
        {
          user_id: session.user.id,
          display_name: profile.display_name,
          full_name: profile.full_name,
          pen_name: profile.pen_name,
          bio: profile.bio,
          website: profile.website || null,
        },
        { onConflict: "user_id" },
      ),
      supabase.from("profile_contacts").upsert(
        {
          user_id: session.user.id,
          phone: contact.phone || null,
          address_line1: contact.address_line1 || null,
          address_line2: contact.address_line2 || null,
          city: contact.city || null,
          state_region: contact.state_region || null,
          country: contact.country || "Nigeria",
          postal_code: contact.postal_code || null,
        },
        { onConflict: "user_id" },
      ),
    ]);
    setSavingProfile(false);
    if (profileError || contactError)
      toast.error(profileError?.message ?? contactError?.message ?? "Unable to save profile");
    else toast.success("Profile saved");
  };

  if (loading || !session) {
    return (
      <div className="container-news py-20 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your dashboard…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; Icon: typeof Bookmark; count: number }[] = [
    { id: "saved", label: "Saved", Icon: Bookmark, count: saved.length },
    { id: "history", label: "History", Icon: History, count: history.length },
    { id: "comments", label: "Comments", Icon: MessageSquare, count: comments.length },
    { id: "reactions", label: "Reactions", Icon: ThumbsUp, count: reactions.length },
    { id: "profile", label: "Profile", Icon: UserCircle2, count: 0 },
  ];

  return (
    <div className="bg-background">
      <Toaster richColors position="top-center" />
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="container-news h-16 flex items-center justify-between">
          <div>
            <div className="font-serif text-2xl">My ClearFact</div>
            <div className="text-xs opacity-80">{session.user.email}</div>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-sm hover:text-gold"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="container-news py-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1">
            {tabs.map(({ id, label, Icon, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-left ${
                  tab === id ? "bg-accent text-primary font-semibold" : "hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
                {id !== "profile" && (
                  <span className="ml-auto text-xs text-muted-foreground">{count}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {tab === "saved" && (
            <Section title="Saved articles" empty="You haven't saved any articles yet.">
              {saved.map((s) => (
                <Row
                  key={s.id}
                  a={s.articles}
                  meta={`Saved ${new Date(s.created_at).toLocaleDateString()}`}
                  onRemove={() => removeSaved(s.id)}
                />
              ))}
            </Section>
          )}

          {tab === "history" && (
            <Section
              title="Reading history"
              empty="No reading history yet — start exploring."
              action={
                history.length ? (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-destructive hover:underline"
                  >
                    Clear all
                  </button>
                ) : null
              }
            >
              {history.map((h, i) => (
                <Row key={i} a={h.articles} meta={`Read ${new Date(h.read_at).toLocaleString()}`} />
              ))}
            </Section>
          )}

          {tab === "comments" && (
            <Section title="Your comments" empty="You haven't commented on any articles yet.">
              {comments.map((c) => (
                <li key={c.id} className="border border-border rounded-sm p-4">
                  <div className="text-xs text-muted-foreground">
                    <ArticleLink a={c.articles} /> · {new Date(c.created_at).toLocaleString()}
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
                  <button
                    onClick={() => removeComment(c.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </li>
              ))}
            </Section>
          )}

          {tab === "reactions" && (
            <Section title="Your reactions" empty="You haven't reacted to any articles yet.">
              {reactions.map((r) => (
                <Row
                  key={r.id}
                  a={r.articles}
                  meta={`${r.type} · ${new Date(r.created_at).toLocaleDateString()}`}
                  onRemove={() => removeReaction(r.id)}
                />
              ))}
            </Section>
          )}

          {tab === "profile" && (
            <ProfileSettings
              session={session}
              profile={profile}
              setProfile={setProfile}
              contact={contact}
              setContact={setContact}
              payoutAccount={payoutAccount}
              saving={savingProfile}
              onSave={saveProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileSettings({
  session,
  profile,
  setProfile,
  contact,
  setContact,
  payoutAccount,
  saving,
  onSave,
}: {
  session: NonNullable<ReturnType<typeof useAuth>["session"]>;
  profile: PublicProfile;
  setProfile: Dispatch<SetStateAction<PublicProfile>>;
  contact: ContactDetails;
  setContact: Dispatch<SetStateAction<ContactDetails>>;
  payoutAccount: PayoutSummary | null;
  saving: boolean;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const updateProfile = (key: keyof PublicProfile, value: string) =>
    setProfile((current) => ({ ...current, [key]: value }));
  const updateContact = (key: keyof ContactDetails, value: string) =>
    setContact((current) => ({ ...current, [key]: value }));
  const providerLabel = payoutAccount?.provider.replace(/_/g, " ");

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <UserCircle2 className="h-4 w-4" /> Account settings
            </div>
            <h2 className="mt-2 font-serif text-3xl">Your profile</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Keep your identity and contact details current. Private details are visible only to
              you and authorised ClearFact account managers.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-verified/10 px-3 py-1.5 text-xs font-semibold text-verified">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure profile
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            {(profile.full_name || profile.display_name || session.user.email || "C")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-xl">Account details</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your login email is managed securely by Supabase and cannot be edited in this form.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ReadOnlyDetail
            icon={<AtSign className="h-4 w-4" />}
            label="Email address"
            value={session.user.email ?? "Not available"}
          />
          <ReadOnlyDetail
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Email status"
            value={session.user.email_confirmed_at ? "Verified" : "Confirmation pending"}
            valueClass={session.user.email_confirmed_at ? "text-verified" : "text-gold-foreground"}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <ProfileSectionHeading
          icon={<UserRound className="h-5 w-5" />}
          title="Public identity"
          description="These fields can appear on your author or contributor profile."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ProfileField
            label="Full name"
            value={profile.full_name ?? ""}
            onChange={(value) => updateProfile("full_name", value)}
            placeholder="Your full name"
            maxLength={120}
          />
          <ProfileField
            label="Public display name"
            value={profile.display_name ?? ""}
            onChange={(value) => updateProfile("display_name", value)}
            placeholder="Name readers will see"
            maxLength={80}
          />
          <ProfileField
            label="Pen name"
            value={profile.pen_name ?? ""}
            onChange={(value) => updateProfile("pen_name", value)}
            placeholder="Optional author name for books"
            maxLength={120}
          />
          <ProfileField
            label="Website or portfolio"
            value={profile.website ?? ""}
            onChange={(value) => updateProfile("website", value)}
            placeholder="https://yourwebsite.com"
            type="url"
            maxLength={255}
          />
        </div>
        <label className="mt-4 block text-sm">
          <span className="mb-2 block font-semibold">Short bio</span>
          <textarea
            value={profile.bio ?? ""}
            onChange={(event) => updateProfile("bio", event.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Tell readers briefly about your work, interests or writing focus."
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <span className="mt-1 block text-right text-xs text-muted-foreground">
            {(profile.bio ?? "").length}/500
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <ProfileSectionHeading
          icon={<Home className="h-5 w-5" />}
          title="Private contact and address"
          description="Used for account support, author verification and important notifications. Not public."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ProfileField
            label="Phone number"
            value={contact.phone ?? ""}
            onChange={(value) => updateContact("phone", value)}
            placeholder="+234 800 000 0000"
            type="tel"
            inputMode="tel"
          />
          <ProfileField
            label="Country"
            value={contact.country ?? "Nigeria"}
            onChange={(value) => updateContact("country", value)}
            placeholder="Nigeria"
          />
          <ProfileField
            label="Address line 1"
            value={contact.address_line1 ?? ""}
            onChange={(value) => updateContact("address_line1", value)}
            placeholder="House number and street"
          />
          <ProfileField
            label="Address line 2"
            value={contact.address_line2 ?? ""}
            onChange={(value) => updateContact("address_line2", value)}
            placeholder="Apartment, landmark or area (optional)"
          />
          <ProfileField
            label="City or town"
            value={contact.city ?? ""}
            onChange={(value) => updateContact("city", value)}
            placeholder="Yola"
          />
          <ProfileField
            label="State or region"
            value={contact.state_region ?? ""}
            onChange={(value) => updateContact("state_region", value)}
            placeholder="Adamawa State"
          />
          <ProfileField
            label="Postal code"
            value={contact.postal_code ?? ""}
            onChange={(value) => updateContact("postal_code", value)}
            placeholder="Optional"
            inputMode="numeric"
          />
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent/60 p-3 text-xs leading-5 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Use a real location for account support and payout verification. It will not be shown on
          your public author page.
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <ProfileSectionHeading
          icon={<WalletCards className="h-5 w-5" />}
          title="Payout account"
          description="Payment details are kept separate from your public profile and are never displayed to visitors."
        />
        <div className="mt-5 rounded-xl border border-border bg-background p-4">
          {payoutAccount ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-verified/10 text-verified">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold capitalize">
                  {providerLabel} · {payoutAccount.display_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {payoutAccount.bank_name ? `${payoutAccount.bank_name} · ` : ""}
                  {payoutAccount.account_number_masked ?? "Account protected"} ·{" "}
                  {payoutAccount.currency}
                </div>
              </div>
              {payoutAccount.verified && <ShieldCheck className="h-5 w-5 text-verified" />}
            </div>
          ) : (
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <ReceiptText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="font-semibold text-foreground">No payout account added</div>
                <p className="mt-1">
                  Authors can add a verified payment destination before requesting earnings.
                </p>
              </div>
            </div>
          )}
        </div>
        <Link
          to="/contributor/payouts"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-primary transition hover:bg-accent"
        >
          Manage payout details →
        </Link>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <p className="text-xs text-muted-foreground">
          Last saved details are protected by your account permissions.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile changes"}
        </button>
      </div>
    </form>
  );
}

function ProfileSectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </label>
  );
}

function ReadOnlyDetail({
  icon,
  label,
  value,
  valueClass = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      <div className={`mt-1 truncate text-sm font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
  action,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">{title}</h2>
        {action}
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">{children}</ul>
      )}
    </div>
  );
}

function Row({
  a,
  meta,
  onRemove,
}: {
  a: ArticleStub | null;
  meta: string;
  onRemove?: () => void;
}) {
  return (
    <li className="border border-border rounded-sm p-4 flex items-start justify-between gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
          {a?.category ?? ""}
        </div>
        <div className="mt-1">
          <ArticleLink a={a} />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
