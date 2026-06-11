import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  FileSearch,
  Users,
  Megaphone,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/trust-center")({
  head: () => ({
    title: "Trust Center | ClearFact News",

    meta: [
      {
        name: "description",
        content:
          "ClearFact News Trust Center. Learn about our editorial standards, corrections policy, source transparency, and commitment to independent journalism.",
      },

      {
        property: "og:title",
        content: "Trust Center | ClearFact News",
      },

      {
        property: "og:description",
        content:
          "Showing our work in public through transparency, accountability, and fact-based journalism.",
      },

      {
        property: "og:type",
        content: "website",
      },

      {
        property: "og:url",
        content: "https://clearfact.ng/trust-center",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "https://clearfact.ng/trust-center",
      },
    ],
  }),

  component: TrustCenter,
});

const stats = [
  {
    label: "Verification Standard",
    value: "100%",
    icon: ShieldCheck,
  },
  {
    label: "Correction Transparency",
    value: "Public",
    icon: RefreshCw,
  },
  {
    label: "Source Review",
    value: "Required",
    icon: FileSearch,
  },
  {
    label: "Editorial Independence",
    value: "Active",
    icon: BadgeCheck,
  },
];

function TrustCenter() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Public Accountability
            </div>

            <h1 className="font-serif text-4xl md:text-6xl mt-2">
              Trust Center
            </h1>

            <p className="mt-4 text-lg text-primary-foreground/80">
              ClearFact News is committed to accurate,
              transparent, independent and responsible
              journalism. Public trust is earned through
              verification, accountability and openness.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-5"
              >
                <s.icon className="h-5 w-5 text-gold" />

                <div className="font-serif text-3xl mt-3">
                  {s.value}
                </div>

                <div className="text-xs text-primary-foreground/70">
  verification category
</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-news py-14 grid lg:grid-cols-3 gap-8">
        {[
          {
            i: ShieldCheck,
            t: "Verification Workflow",
            d: "Every story undergoes source verification, editorial review and fact-checking before publication.",
          },

          {
            i: RefreshCw,
            t: "Corrections Policy",
            d: "Errors are corrected promptly and transparently. Significant updates may include editor notes.",
          },

          {
            i: Users,
            t: "Editorial Independence",
            d: "Editorial decisions are made independently and are not influenced by advertisers, sponsors or political interests.",
          },

          {
            i: Megaphone,
            t: "Anti-Clickbait Policy",
            d: "Headlines are designed to accurately reflect the facts of a story without misleading readers.",
          },

          {
            i: FileSearch,
            t: "Source Transparency",
            d: "We prioritize primary documents, official statements and credible expert sources whenever possible.",
          },

          {
            i: BadgeCheck,
            t: "Reader Accountability",
            d: "Readers can report factual errors, provide feedback and request corrections through our contact channels.",
          },

          {
            i: Users,
            t: "Ownership & Funding",
            d: "ClearFact News operates independently. Sponsored content and commercial partnerships are clearly disclosed.",
          },
        ].map((b) => (
          <div
            key={b.t}
            className="rounded-sm border border-border p-6"
          >
            <b.i className="h-6 w-6 text-gold" />

            <h3 className="font-serif text-xl mt-3">
              {b.t}
            </h3>

            <p className="text-muted-foreground mt-2 text-sm">
              {b.d}
            </p>
          </div>
        ))}
      </section>

      <section className="container-news pb-16">
        <div className="rounded-lg border border-border p-8 text-center">
          <h2 className="font-serif text-3xl mb-4">
            Help Us Improve
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            If you spot an error, have concerns about a
            story, or want to request a correction, we
            encourage you to contact our editorial team.
          </p>

          <div className="mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90"
            >
              Report a Correction
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}