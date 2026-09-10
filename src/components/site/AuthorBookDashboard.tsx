import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Book = {
  id: string;
  title: string;
  pen_name: string;
  description: string;
  price_kobo: number;
  status: string;
  cover_path: string | null;
  review_note: string | null;
  created_at: string;
};

type Sale = {
  id: string;
  title: string;
  gross_kobo: number;
  commission_kobo: number;
  author_net_kobo: number;
  status: string;
  created_at: string;
};

type AuthorData = { books: Book[]; sales: Sale[] };

const money = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

async function getErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;
  return data?.message || fallback;
}

async function loadAuthorData(accessToken: string): Promise<AuthorData> {
  const response = await fetch("/api/services/books", {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await getErrorMessage(response, "Unable to load your books."));
  const data = (await response.json()) as Partial<AuthorData>;
  return {
    books: Array.isArray(data.books) ? data.books : [],
    sales: Array.isArray(data.sales) ? data.sales : [],
  };
}

export function AuthorBookDashboard() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState({ display_name: "", pen_name: "", bio: "" });
  const [books, setBooks] = useState<Book[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<{ book?: File; sample?: File; cover?: File }>({});
  const formRef = useRef<HTMLFormElement>(null);
  const userId = session?.user.id;
  const accessToken = session?.access_token;

  const refresh = useCallback(async () => {
    if (!userId || !accessToken) return;

    const [{ data: profileData }, authorData] = await Promise.all([
      (supabase as any)
        .from("profiles")
        .select("display_name,pen_name,bio")
        .eq("user_id", userId)
        .maybeSingle(),
      loadAuthorData(accessToken),
    ]);

    if (profileData) {
      setProfile((value) => ({
        ...value,
        display_name: profileData.display_name ?? "",
        pen_name: profileData.pen_name ?? "",
        bio: profileData.bio ?? "",
      }));
    }
    setBooks(authorData.books);
    setSales(authorData.sales);
  }, [accessToken, userId]);

  useEffect(() => {
    if (!userId || !accessToken) return;
    void refresh().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Unable to load your author centre.");
    });
  }, [accessToken, refresh, userId]);

  const totals = useMemo(
    () =>
      sales.reduce(
        (total, sale) => ({
          gross: total.gross + sale.gross_kobo,
          commission: total.commission + sale.commission_kobo,
          net: total.net + sale.author_net_kobo,
        }),
        { gross: 0, commission: 0, net: 0 },
      ),
    [sales],
  );

  if (loading) return <p role="status">Loading author centre…</p>;

  if (!session) {
    return (
      <section className="rounded border border-border bg-accent p-6">
        <h2 className="!mt-0">Create your author profile</h2>
        <p>Sign in or create a ClearFact account to submit and sell digital books.</p>
        <Link
          className="inline-flex mt-4 rounded-sm bg-primary px-5 py-3 font-semibold text-primary-foreground"
          to="/auth"
          search={{ redirect: "/author" }}
        >
          Sign in / create account
        </Link>
      </section>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !accessToken) return;

    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!consent || !files.book || !files.sample || !files.cover) {
      setMessage("Add the full PDF, sample, cover and accept both publishing policies.");
      return;
    }

    const title = String(values.title ?? "").trim();
    const pen = String(values.pen_name ?? "").trim();
    const description = String(values.description ?? "").trim();
    const price = Number(values.price);

    if (
      title.length < 2 ||
      pen.length < 2 ||
      description.length < 40 ||
      !Number.isFinite(price) ||
      price < 1 ||
      price > 1_000_000
    ) {
      setMessage("Check the title, pen name, description and price between ₦1 and ₦1,000,000.");
      return;
    }

    const { book, sample, cover } = files;
    if (
      book.type !== "application/pdf" ||
      sample.type !== "application/pdf" ||
      !["image/jpeg", "image/png"].includes(cover.type)
    ) {
      setMessage("Full book and sample must be PDF files; cover must be JPEG or PNG.");
      return;
    }
    if (
      book.size > 20 * 1024 * 1024 ||
      sample.size > 2 * 1024 * 1024 ||
      cover.size > 3 * 1024 * 1024
    ) {
      setMessage("Maximum sizes are 20 MB full book, 2 MB sample and 3 MB cover.");
      return;
    }
    if (sample.size >= book.size) {
      setMessage("The sample must be smaller than the full book.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("title", title);
      form.set("author", pen);
      form.set("description", description);
      form.set("price", price.toFixed(2));
      form.set("rights", "1");
      form.set("commission_terms", "1");
      form.set("submission_key", crypto.randomUUID());
      form.set("book", book);
      form.set("sample", sample);
      form.set("cover", cover);

      const response = await fetch("/api/services/books", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "x-clearfact-author-name": profile.display_name || pen,
        },
        body: form,
      });
      if (!response.ok) throw new Error(await getErrorMessage(response, "Submission failed."));

      setMessage(
        "Book submitted successfully. It will appear in the bookstore only after ClearFact approval.",
      );
      formRef.current?.reset();
      setFiles({});
      setConsent(false);
      await refresh();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Submission failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    setBusy(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        display_name: profile.display_name,
        pen_name: profile.pen_name,
        bio: profile.bio,
      })
      .eq("user_id", userId!);
    setMessage(error ? error.message : "Profile saved.");
    setBusy(false);
  };

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded border border-border bg-accent p-6">
        <h2 className="!mt-0">Your author profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Display name</Label>
            <Input
              value={profile.display_name}
              onChange={(event) => setProfile({ ...profile, display_name: event.target.value })}
              placeholder="Your real name"
            />
          </div>
          <div>
            <Label>Pen name</Label>
            <Input
              value={profile.pen_name}
              onChange={(event) => setProfile({ ...profile, pen_name: event.target.value })}
              placeholder="Name shown on books"
            />
          </div>
        </div>
        <Label className="block mt-4">Author bio</Label>
        <Textarea
          value={profile.bio}
          onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
          rows={3}
          placeholder="Tell readers about your work"
        />
        <Button className="mt-4" disabled={busy} onClick={() => void saveProfile()}>
          Save profile
        </Button>
      </div>

      <form ref={formRef} onSubmit={submit} className="rounded border border-border p-6 space-y-4">
        <h2 className="!mt-0">Submit a digital book</h2>
        <p className="text-muted-foreground">
          Your full PDF remains private. Only approved books appear in the public ClearFact Books marketplace.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Book title *</Label>
            <Input name="title" required maxLength={180} />
          </div>
          <div>
            <Label>Author / pen name *</Label>
            <Input name="pen_name" required maxLength={120} />
          </div>
        </div>
        <div>
          <Label>Description *</Label>
          <Textarea name="description" required minLength={40} maxLength={6000} rows={6} />
        </div>
        <div>
          <Label>Price in NGN *</Label>
          <Input name="price" type="number" min="1" max="1000000" step="0.01" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Full book PDF *</Label>
            <Input
              type="file"
              accept="application/pdf"
              required
              onChange={(event) => setFiles((value) => ({ ...value, book: event.target.files?.[0] }))}
            />
          </div>
          <div>
            <Label>Sample PDF *</Label>
            <Input
              type="file"
              accept="application/pdf"
              required
              onChange={(event) => setFiles((value) => ({ ...value, sample: event.target.files?.[0] }))}
            />
          </div>
          <div>
            <Label>Cover JPEG/PNG *</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png"
              required
              onChange={(event) => setFiles((value) => ({ ...value, cover: event.target.files?.[0] }))}
            />
          </div>
        </div>
        <label className="flex gap-3 items-start">
          <Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} />
          <span>
            I own or have permission to sell these files, and I accept ClearFact’s{" "}
            <a href="/terms">publishing, privacy and commission policies</a>.
          </span>
        </label>
        <Button disabled={busy}>{busy ? "Uploading securely…" : "Submit for review"}</Button>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </form>

      <div className="rounded border border-border p-6">
        <h2 className="!mt-0">My books</h2>
        {books.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Review note</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.status}</td>
                    <td>{money(book.price_kobo)}</td>
                    <td>{book.review_note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded border border-border p-6">
        <h2 className="!mt-0">Sales and earnings</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <small>Gross sales</small>
            <h3>{money(totals.gross)}</h3>
          </div>
          <div>
            <small>ClearFact commission</small>
            <h3>{money(totals.commission)}</h3>
          </div>
          <div>
            <small>Your earnings</small>
            <h3>{money(totals.net)}</h3>
          </div>
        </div>
        {sales.length === 0 ? (
          <p className="mt-4">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Status</th>
                  <th>Earned</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.title}</td>
                    <td>{sale.status}</td>
                    <td>{money(sale.author_net_kobo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          Payouts are reviewed and recorded by ClearFact staff. Buyers’ personal details are never shown here.
        </p>
      </div>
    </section>
  );
}
