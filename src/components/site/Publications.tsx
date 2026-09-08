import { useEffect, useState } from "react";
import { SimplePage } from "./SimplePage";
import { Button } from "@/components/ui/button";
import { getServiceData, safeExternalUrl, type Publication } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
export function Publications({ kind }: { kind: "books" | "eprint" }) {
  const [items, setItems] = useState<Publication[]>([]);
  const [status, setStatus] = useState("Loading publications…");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus("Loading publications…");
    Promise.all([
      getServiceData<Publication[]>(`catalogue?kind=${kind}`).catch(() => [] as Publication[]),
      kind === "books" ? (supabase as any).from("book_submissions").select("id,title,pen_name,description,price_kobo,cover_path,woo_product_id").eq("status", "approved").order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    ])
      .then(([data, { data: approved }]) => {
        if (active) {
          const submitted = (approved ?? []).map((book: any) => ({ id: `supabase-${book.id}`, title: book.title, description: book.description, author: book.pen_name, edition: "Digital book", price: `₦${(Number(book.price_kobo) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`, cover: book.cover_path ? supabase.storage.from("author-book-covers").getPublicUrl(book.cover_path).data.publicUrl : "", url: book.woo_product_id ? `https://cms.clearfact.ng/?post_type=product&p=${book.woo_product_id}` : "", store: !!book.woo_product_id }));
          const merged = [...submitted, ...(data ?? [])].filter((book, index, all) => all.findIndex(other => other.title.toLowerCase() === book.title.toLowerCase()) === index);
          setItems(merged);
          setStatus(
            merged.length
              ? ""
              : "No publications are available yet. Please check back for new releases.",
          );
        }
      })
      .catch(() => {
        if (active) setStatus("We could not load the catalogue. Please try again.");
      });
    return () => {
      active = false;
    };
  }, [kind, attempt]);
  return (
    <SimplePage
      eyebrow="ClearFact Media Ltd"
      title={kind === "books" ? "ClearFact Books" : "ClearFact E-Print"}
      intro={
        kind === "books"
          ? "Discover digital books, read a sample and buy online. Authors can submit their books for ClearFact review."
          : "Read the digital newspaper. Browse available editions and follow each edition’s reading or purchase link."
      }
    >
      {kind === "books" && (
        <div className="flex flex-wrap gap-4 mb-6 border-b border-border pb-6">
          <a href="/author" className="font-semibold">
            Submit your book / Author dashboard
          </a>
          <a href="/author" className="font-semibold">
            My purchases & downloads
          </a>
        </div>
      )}
      {kind === "eprint" && (
        <p className="border-l-4 border-gold pl-4">
          CLEARFACT NEWS · Verified · Transparent · Nigerian.
        </p>
      )}
      {status && (
        <div role="status" className="rounded border border-border p-6">
          <p>{status}</p>
          {status.startsWith("We could") && (
            <Button className="mt-4" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          )}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 not-prose">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded border border-border bg-card">
            {safeExternalUrl(item.cover) && (
              <img
                src={safeExternalUrl(item.cover)}
                alt={`${item.title} cover`}
                className="h-64 w-full object-contain bg-muted p-4"
                loading="lazy"
              />
            )}
            <div className="p-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                {item.author || "ClearFact Media Ltd"}
                {item.edition ? ` · ${item.edition}` : ""}
              </p>
              <h2 className="!mt-0">{item.title}</h2>
              <p>{item.description}</p>
              {item.price && <p className="font-semibold">{item.price}</p>}
              {item.sample && safeExternalUrl(item.sample) && (
                <p>
                  <a href={safeExternalUrl(item.sample)} target="_blank" rel="noopener noreferrer">
                    Read a sample PDF ↗
                  </a>
                </p>
              )}
              {safeExternalUrl(item.url) ? (
                <a
                  href={safeExternalUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-semibold"
                >
                  {item.store
                    ? "View book & buy online"
                    : item.price && item.price.toLowerCase() !== "free"
                      ? "View / purchase"
                      : "Read publication"}{" "}
                  ↗
                </a>
              ) : (
                <p className="text-muted-foreground">Release link coming soon.</p>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className="pt-6">
        Publication enquiries: <a href="mailto:info@clearfact.ng">info@clearfact.ng</a>.
      </p>
    </SimplePage>
  );
}
