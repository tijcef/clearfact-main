import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  RefreshCw,
  BadgeCheck,
  Sparkles,
  Info,
} from "lucide-react";

type Stats = {
  total: number;
  verified: number;
  factChecked: number;
  developing: number;
  opinion: number;
  corrections: number;
  avgTrust: number | null;
};

type Correction = {
  id: string;
  note: string;
  created_at: string;
  editor_name: string | null;
  article_id: string;
};

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency Dashboard — ClearFact News" },
      {
        name: "description",
        content:
          "Public verification metrics, corrections, editorial accountability and trust information for ClearFact News.",
      },
      {
        property: "og:title",
        content: "ClearFact Transparency Dashboard",
      },
      {
        property: "og:description",
        content: "Truth over speed. Verification over virality. Trust over traffic.",
      },
      { property: "og:url", content: "https://clearfact.ng/transparency" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/transparency" }],
  }),

  component: TransparencyDashboard,
});

function TransparencyDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Correction[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTransparencyData() {
      try {
        const { data: arts, error: articlesError } = await supabase
          .from("articles")
          .select("verification,trust_score,status")
          .eq("status", "published");

        if (articlesError) {
          throw articlesError;
        }

        const articles = (arts ?? []) as {
          verification: string | null;
          trust_score: number | null;
        }[];

        const { count: correctionCount, error: correctionError } = await supabase
          .from("corrections")
          .select("*", {
            count: "exact",
            head: true,
          });

        if (correctionError) {
          throw correctionError;
        }

        const { data: corrections, error: recentError } = await supabase
          .from("corrections")
          .select("id,note,created_at,editor_name,article_id")
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentError) {
          throw recentError;
        }

        const scores = articles
          .map((article) => article.trust_score)
          .filter((score): score is number => typeof score === "number" && Number.isFinite(score));

        const averageTrust = scores.length
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : null;

        if (!mounted) return;

        setStats({
          total: articles.length,
          verified: articles.filter((article) => article.verification === "Verified").length,
          factChecked: articles.filter((article) => article.verification === "Fact-Checked").length,
          developing: articles.filter((article) => article.verification === "Developing").length,
          opinion: articles.filter((article) => article.verification === "Opinion").length,
          corrections: correctionCount ?? 0,
          avgTrust: averageTrust,
        });

        setRecent(corrections ?? []);
      } catch (err) {
        console.error("Transparency dashboard error:", err);

        if (mounted) {
          setError(true);
        }
      }
    }

    loadTransparencyData();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = stats
    ? [
        {
          i: ShieldCheck,
          l: "Verified stories",
          v: stats.verified,
        },
        {
          i: BadgeCheck,
          l: "Fact-checked",
          v: stats.factChecked,
        },
        {
          i: Sparkles,
          l: "Average trust score",
          v: stats.avgTrust === null ? "—" : `${stats.avgTrust}/100`,
        },
        {
          i: AlertTriangle,
          l: "Developing stories",
          v: stats.developing,
        },
        {
          i: FileSearch,
          l: "Opinion / labelled",
          v: stats.opinion,
        },
        {
          i: RefreshCw,
          l: "Public corrections",
          v: stats.corrections,
        },
      ]
    : [];

  return (
    <main>
      {/* HERO */}{" "}
      <section className="bg-primary text-primary-foreground">
        {" "}
        <div className="container-news py-14 md:py-20">
          {" "}
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Public Accountability{" "}
          </div>
          <h1 className="font-serif text-4xl md:text-6xl mt-2">Transparency Dashboard</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl leading-8">
            A public view of ClearFact's verification record, corrections, editorial classifications
            and trust metrics.
          </p>
          <p className="mt-3 text-sm text-primary-foreground/60 max-w-2xl">
            Truth over speed. Verification over virality. Trust over traffic.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <div
                key={card.l}
                className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-5"
              >
                <card.i className="h-5 w-5 text-gold" />

                <div className="font-serif text-3xl mt-3">{card.v}</div>

                <div className="text-xs text-primary-foreground/70">{card.l}</div>
              </div>
            ))}

            {!stats && !error && (
              <div className="text-primary-foreground/60 text-sm">
                Loading transparency metrics...
              </div>
            )}

            {error && (
              <div className="text-primary-foreground/70 text-sm">
                Transparency metrics are temporarily unavailable.
              </div>
            )}
          </div>
        </div>
      </section>
      {/* WHAT THE METRICS MEAN */}
      <section className="container-news py-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-gold">
            <Info className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Understanding our metrics
            </span>
          </div>

          <h2 className="font-serif text-3xl mt-2">What these labels mean</h2>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-semibold">Verified</h3>

              <p className="text-sm text-muted-foreground mt-1 leading-6">
                Published information that has undergone ClearFact's editorial verification process
                and is considered sufficiently supported by available evidence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Fact-Checked</h3>

              <p className="text-sm text-muted-foreground mt-1 leading-6">
                A report or claim that has undergone additional fact-checking against relevant
                sources, records or evidence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Developing</h3>

              <p className="text-sm text-muted-foreground mt-1 leading-6">
                A developing story where information may continue to change as authorities,
                witnesses or other credible sources provide new information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Opinion / Labelled</h3>

              <p className="text-sm text-muted-foreground mt-1 leading-6">
                Commentary, analysis or other material that is clearly distinguished from straight
                news reporting.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CORRECTIONS */}
      <section className="container-news pb-12">
        <h2 className="font-serif text-2xl border-b-2 border-primary pb-2">
          Recent Public Corrections
        </h2>

        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          We believe corrections should be transparent. When a material error is identified,
          ClearFact may correct the relevant article and record the correction publicly.
        </p>

        {recent.length === 0 ? (
          <div className="mt-6 border border-border rounded-sm p-6">
            <p className="text-sm text-muted-foreground">
              No public corrections have been logged in the current transparency record.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border border border-border rounded-sm">
            {recent.map((correction) => (
              <li key={correction.id} className="p-5">
                <div className="text-xs text-muted-foreground">
                  {new Date(correction.created_at).toLocaleString()} ·{" "}
                  {correction.editor_name ?? "Editorial Desk"}
                </div>

                <div className="mt-2 text-sm leading-6">{correction.note}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* METHODOLOGY */}
      <section className="container-news pb-14">
        <div className="rounded-sm border border-border bg-card p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Methodology
          </div>

          <h2 className="font-serif text-3xl mt-2">How our transparency data is generated</h2>

          <p className="text-sm text-muted-foreground mt-4 leading-6">
            The dashboard displays information recorded in ClearFact's newsroom systems for
            published articles and logged corrections. Verification labels and trust scores are
            editorial classifications and should be understood as part of ClearFact's internal
            review process rather than as an absolute guarantee of truth.
          </p>

          <p className="text-sm text-muted-foreground mt-3 leading-6">
            Metrics may change as articles are updated, reclassified or corrected. The dashboard is
            intended to provide readers with greater visibility into our editorial processes.
          </p>
        </div>
      </section>
      {/* EDITORIAL CONTACT */}
      <section className="container-news pb-16">
        <div className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl">Questions about our journalism?</h2>

          <p className="text-sm text-muted-foreground mt-2 leading-6">
            If you believe an article contains an error or you have a question about our
            verification process, contact the ClearFact editorial desk.
          </p>

          <a
            href="mailto:editor@clearfact.ng?subject=Editorial%20Enquiry"
            className="inline-block mt-4 font-semibold text-primary hover:underline"
          >
            editor@clearfact.ng →
          </a>
        </div>
      </section>
    </main>
  );
}
