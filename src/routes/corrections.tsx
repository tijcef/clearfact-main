import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";

type Corr = {
  id: string;
  note: string;
  created_at: string;
  editor_name: string | null;
  article_id: string;
};

type ArticleRef = {
  id: string;
  slug: string;
  title: string;
};

export const Route = createFileRoute("/corrections")({
  head: () => ({
    meta: [
      { title: "Corrections Log — ClearFact News" },
      {
        name: "description",
        content:
          "Public log of significant corrections issued by ClearFact News. We are committed to accuracy, transparency and accountability.",
      },
      {
        property: "og:title",
        content: "Corrections Log — ClearFact News",
      },
      {
        property: "og:description",
        content:
          "ClearFact News publicly records significant corrections to published stories as part of our commitment to accuracy and accountability.",
      },
    ],
  }),

  component: CorrectionsPage,
});

function CorrectionsPage() {
  const [items, setItems] = useState<(Corr & { article?: ArticleRef })[]>([]);

  useEffect(() => {
    (async () => {
      const sb = supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            order: (
              c: string,
              o: { ascending: boolean },
            ) => {
              limit: (
                n: number,
              ) => Promise<{ data: Corr[] | null }>;
            };
          };
        };
      };

      const { data: cors } = await sb
        .from("corrections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const arr = cors ?? [];

      const ids = Array.from(
        new Set(arr.map((c) => c.article_id)),
      );

      const { data: arts } = ids.length
        ? await supabase
            .from("articles")
            .select("id,slug,title")
            .in("id", ids)
        : { data: [] as ArticleRef[] };

      const map = new Map(
        (arts ?? []).map((a) => [a.id, a as ArticleRef]),
      );

      setItems(
        arr.map((c) => ({
          ...c,
          article: map.get(c.article_id),
        })),
      );
    })();
  }, []);

  return (
    <div>
      {/* PAGE HEADER */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-12">
          <div className="flex items-center gap-2 text-gold">
            <RefreshCw className="h-4 w-4" />

            <span className="text-xs font-semibold uppercase tracking-[0.25em]">
              Accountability
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl mt-2">
            Corrections Log
          </h1>

          <p className="mt-3 text-primary-foreground/80 max-w-2xl">
            Significant corrections to published stories are recorded here as
            part of our commitment to accuracy, transparency and accountability.
            If you believe a ClearFact News story contains an error, please
            contact our Editorial Desk at{" "}
            <a
              href="mailto:editor@clearfact.ng?subject=Correction%20Request"
              className="underline decoration-gold underline-offset-2 hover:text-white"
            >
              editor@clearfact.ng
            </a>
            .
          </p>
        </div>
      </section>

      {/* CORRECTIONS LIST */}
      <section className="container-news py-10 max-w-3xl">
        {items.length === 0 ? (
          <div className="border border-border rounded-sm p-6">
            <h2 className="font-serif text-xl">
              No corrections logged yet.
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              This page will display significant corrections issued by
              ClearFact News when they are recorded.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <h2 className="font-serif text-2xl">
                Recent Corrections
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Corrections are listed in reverse chronological order.
              </p>
            </div>

            <ul className="divide-y divide-border border border-border rounded-sm">
              {items.map((c) => (
                <li key={c.id} className="p-5">
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()} ·{" "}
                    {c.editor_name ?? "Editorial Desk"}
                  </div>

                  {c.article && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: c.article.slug }}
                      className="block font-serif text-lg mt-1 hover:underline"
                    >
                      {c.article.title}
                    </Link>
                  )}

                  <p className="mt-2 leading-6">{c.note}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* TRANSPARENCY NOTE */}
      <section className="container-news pb-12 max-w-3xl">
        <div className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl">
            Our Commitment to Accuracy
          </h2>

          <p className="text-sm text-muted-foreground mt-3 leading-6">
            ClearFact News is committed to correcting significant factual
            errors promptly and transparently. Corrections are recorded here
            so that readers can see when material changes have been made to
            previously published reporting.
          </p>

          <p className="text-sm text-muted-foreground mt-3 leading-6">
            To report a potential error, contact our Editorial Desk at{" "}
            <a
              href="mailto:editor@clearfact.ng?subject=Correction%20Request"
              className="text-primary font-semibold hover:underline"
            >
              editor@clearfact.ng
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}