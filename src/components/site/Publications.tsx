import { useEffect, useState } from "react";
import { SimplePage } from "./SimplePage";
import { Button } from "@/components/ui/button";
import { getServiceData, safeExternalUrl, type Publication } from "@/lib/services";
export function Publications({ kind }: { kind: "books" | "eprint" }) {
  const [items, setItems] = useState<Publication[]>([]);
  const [status, setStatus] = useState("Loading publications…");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus("Loading publications…");
    getServiceData<Publication[]>(`catalogue?kind=${kind}`)
      .then((data) => {
        if (active) {
          setItems(data);
          setStatus(
            data.length
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
          ? "Explore books published by ClearFact Media Ltd."
          : "Read the digital newspaper. Browse available editions and follow each edition’s reading or purchase link."
      }
    >
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
              {safeExternalUrl(item.url) ? (
                <a
                  href={safeExternalUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-semibold"
                >
                  {item.price && item.price.toLowerCase() !== "free"
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
