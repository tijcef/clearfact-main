import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SimplePage } from "@/components/site/SimplePage";
import { getServiceData, safeExternalUrl, type Publication } from "@/lib/services";

export const Route = createFileRoute("/books/buy")({
  head: () => ({
    meta: [
      { title: "Book details | ClearFact Books" },
      { name: "description", content: "Book details and secure purchase information from ClearFact Books." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BookDetails,
});

function BookDetails() {
  const [book, setBook] = useState<Publication | null>(null);
  const [status, setStatus] = useState("Loading book details…");

  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    if (!product || !/^\d+$/.test(product)) {
      setStatus("This book link is not valid.");
      return;
    }

    let active = true;
    getServiceData<Publication[]>("catalogue?kind=books")
      .then((items) => {
        if (!active) return;
        const match = (Array.isArray(items) ? items : []).find(
          (item) => String(item.id) === product,
        );
        setBook(match ?? null);
        setStatus(match ? "" : "This book is no longer available.");
      })
      .catch(() => {
        if (active) setStatus("We could not load this book. Please try again later.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <SimplePage
      eyebrow="ClearFact Books"
      title={book?.title || "Book details"}
      intro="Book pages and reader actions stay on clearfact.ng for a simple, secure reading experience."
    >
      {status && (
        <div role="status" className="rounded border border-border p-6">
          {status}
        </div>
      )}

      {book && (
        <article className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
          {safeExternalUrl(book.cover) && (
            <img
              src={safeExternalUrl(book.cover)}
              alt={`${book.title} cover`}
              className="w-full rounded border border-border bg-muted p-4"
            />
          )}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {book.author || "ClearFact Media Ltd"}
              {book.edition ? ` · ${book.edition}` : ""}
            </p>
            <p>{book.description}</p>
            {book.price && <p className="font-semibold">{book.price}</p>}
            {book.sample && safeExternalUrl(book.sample) && (
              <p>
                <a href={safeExternalUrl(book.sample)} target="_blank" rel="noopener noreferrer">
                  Read a sample PDF
                </a>
              </p>
            )}
            {book.purchase_ready ? (
              <p className="rounded border border-border bg-accent p-4">
                Secure checkout is available from this page.
              </p>
            ) : (
              <p className="rounded border border-border bg-accent p-4">
                Secure checkout is being connected. For release or purchase enquiries, contact{" "}
                <a href="mailto:info@clearfact.ng">info@clearfact.ng</a>.
              </p>
            )}
            <Link to="/books" className="inline-block font-semibold">
              Back to ClearFact Books
            </Link>
          </div>
        </article>
      )}
    </SimplePage>
  );
}
