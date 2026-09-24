import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  FileSearch,
  Users,
  Megaphone,
  BadgeCheck,
  RefreshCw,
  Scale,
  Eye,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/trust-center")({
  head: () => ({
    meta: [
      {
        title: "Trust Center | ClearFact News",
      },
      {
        name: "description",
        content:
          "ClearFact News Trust Center. Learn about our editorial standards, verification process, corrections, source transparency, independence and accountability.",
      },
      {
        property: "og:title",
        content: "Trust Center | ClearFact News",
      },
      {
        property: "og:description",
        content:
          "Learn how ClearFact News verifies information, handles corrections, protects editorial independence and maintains public accountability.",
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

const standards = [
  {
    label: "Verification",
    value: "Required",
    icon: ShieldCheck,
  },
  {
    label: "Corrections",
    value: "Public",
    icon: RefreshCw,
  },
  {
    label: "Source Review",
    value: "Standard",
    icon: FileSearch,
  },
  {
    label: "Editorial Independence",
    value: "Protected",
    icon: BadgeCheck,
  },
];

const principles = [
  {
    i: ShieldCheck,
    t: "Verification Workflow",
    d:
      "We seek to verify important claims through primary documents, official records, direct reporting, credible sources and appropriate editorial review before publication.",
  },
  {
    i: RefreshCw,
    t: "Corrections Policy",
    d:
      "When a material factual error is identified, we correct it transparently. Significant corrections may include an editorial note explaining what was changed.",
  },
  {
    i: Users,
    t: "Editorial Independence",
    d:
      "Editorial decisions are independent of advertisers, sponsors, political organisations and other commercial interests.",
  },
  {
    i: Megaphone,
    t: "Responsible Headlines",
    d:
      "Headlines should accurately reflect the underlying story. We do not intentionally use misleading headlines simply to generate clicks.",
  },
  {
    i: FileSearch,
    t: "Source Transparency",
    d:
      "We prioritise primary documents, official statements, direct interviews and credible expert sources whenever appropriate.",
  },
  {
    i: BadgeCheck,
    t: "Reader Accountability",
    d:
      "Readers can report factual errors, raise concerns and request corrections through our editorial contact channels.",
  },
  {
    i: Scale,
    t: "Fairness & Right of Reply",
    d:
      "When reporting significant allegations or disputed claims, we seek to distinguish allegations from established facts and provide relevant parties a reasonable opportunity to respond where appropriate.",
  },
  {
    i: Eye,
    t: "Transparency",
    d:
      "We make our editorial standards, correction practices and key accountability information publicly available so readers can understand how we work.",
  },
  {
    i: BookOpen,
    t: "Public-Interest Journalism",
    d:
      "We aim to produce journalism that informs communities, explains important developments and strengthens accountability.",
  },
];

function TrustCenter() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-news py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Public Accountability
            </div>

            <h1 className="font-serif text-4xl md:text-6xl mt-2">
              Trust Center
            </h1>

            <p className="mt-4 text-lg text-primary-foreground/80 leading-8">
              ClearFact News is committed to accurate, transparent,
              independent and responsible journalism. Public trust is earned
              through verification, accountability and openness.
            </p>
          </div>

          {/* STANDARDS */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {standards.map((standard) => (
              <div
                key={standard.label}
                className="rounded-sm bg-primary-foreground/5 border border-primary-foreground/10 p-5"
              >
                <standard.icon className="h-5 w-5 text-gold" />

                <div className="font-serif text-2xl mt-3">
                  {standard.value}
                </div>

                <div className="text-xs text-primary-foreground/70 mt-1">
                  {standard.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="container-news py-12 max-w-4xl">
        <div className="rounded-sm border border-border bg-card p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Our Commitment
          </div>

          <h2 className="font-serif text-3xl mt-2">
            Showing our work in public
          </h2>

          <p className="text-muted-foreground mt-4 leading-7">
            ClearFact News believes trust should not depend solely on what a
            newsroom says about itself. It should also be demonstrated through
            transparent processes, responsible reporting, accessible editorial
            standards and accountability when mistakes occur.
          </p>

          <p className="text-muted-foreground mt-4 leading-7">
            This Trust Center explains the principles and processes that guide
            our journalism and provides readers with direct access to relevant
            policies and accountability channels.
          </p>
        </div>
      </section>

      {/* STANDARDS */}
      <section className="container-news pb-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Our Standards
          </div>

          <h2 className="font-serif text-3xl mt-2">
            How we work
          </h2>

          <p className="text-muted-foreground mt-3">
            These principles guide our editorial decisions across breaking
            news, investigations, features, opinion, analysis and digital
            content.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((principle) => (
            <div
              key={principle.t}
              className="rounded-sm border border-border p-6 bg-card"
            >
              <principle.i className="h-6 w-6 text-gold" />

              <h3 className="font-serif text-xl mt-3">
                {principle.t}
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {principle.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* KEY POLICIES */}
      <section className="container-news pb-14">
        <div className="rounded-sm border border-border bg-card p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Read Our Policies
          </div>

          <h2 className="font-serif text-3xl mt-2">
            Our standards are public
          </h2>

          <p className="text-muted-foreground mt-3 max-w-3xl leading-6">
            Readers can review the policies that govern ClearFact's editorial
            and accountability practices.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/editorial-policy"
              className="rounded-sm border border-border p-5 hover:border-primary transition-colors"
            >
              <div className="font-semibold">
                Editorial Policy
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                Our standards for reporting, sourcing and verification.
              </div>
            </Link>

            <Link
              to="/transparency"
              className="rounded-sm border border-border p-5 hover:border-primary transition-colors"
            >
              <div className="font-semibold">
                Transparency Dashboard
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                Public verification metrics and correction records.
              </div>
            </Link>

            <Link
              to="/contact"
              className="rounded-sm border border-border p-5 hover:border-primary transition-colors"
            >
              <div className="font-semibold">
                Contact the Editorial Desk
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                Report an error or raise an editorial concern.
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SOURCE & TIP CTA */}
      <section className="container-news pb-14">
        <div className="grid md:grid-cols-2 gap-6">
          {/* SUBMIT STORY */}
          <div className="rounded-sm border border-border p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Have Information?
            </div>

            <h2 className="font-serif text-2xl mt-2">
              Help us report what matters.
            </h2>

            <p className="text-sm text-muted-foreground mt-3 leading-6">
              If you have information, documents or a legitimate public-interest
              story lead, you can contact our newsroom.
            </p>

            <Link
              to="/submit-story"
              className="inline-flex mt-5 items-center rounded-md bg-primary px-5 py-3 text-primary-foreground font-medium hover:opacity-90"
            >
              Submit a Story
            </Link>
          </div>

          {/* REPORT AN ERROR */}
          <div className="rounded-sm border border-border p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Report an Error
            </div>

            <h2 className="font-serif text-2xl mt-2">
              Help us improve.
            </h2>

            <p className="text-sm text-muted-foreground mt-3 leading-6">
              If you believe a ClearFact report contains a factual error,
              please contact our editorial team with the relevant details.
            </p>

            <a
              href="mailto:editor@clearfact.ng?subject=ClearFact%20Correction%20Request"
              className="inline-flex mt-5 items-center rounded-md bg-primary px-5 py-3 text-primary-foreground font-medium hover:opacity-90"
            >
              Contact Editorial
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="container-news pb-14">
        <div className="rounded-sm border border-border bg-card p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Contact ClearFact News
          </div>

          <h2 className="font-serif text-3xl mt-2">
            Get in touch with our newsroom
          </h2>

          <p className="text-muted-foreground mt-3 max-w-3xl leading-6">
            For editorial enquiries, corrections, story tips, partnerships or
            other legitimate enquiries, you can contact us directly.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {/* EMAIL */}
            <a
              href="mailto:editor@clearfact.ng"
              className="rounded-sm border border-border p-5 hover:border-primary transition-colors group"
            >
              <div className="text-sm text-muted-foreground">
                Email
              </div>

              <div className="font-semibold text-lg mt-1 group-hover:text-primary transition-colors break-all">
                editor@clearfact.ng
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                Send us an email
              </div>
            </a>

            {/* PHONE */}
            <a
              href="tel:+2347079405543"
              className="rounded-sm border border-border p-5 hover:border-primary transition-colors group"
            >
              <div className="text-sm text-muted-foreground">
                Phone
              </div>

              <div className="font-semibold text-lg mt-1 group-hover:text-primary transition-colors">
                +234 707 940 5543
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                Call our newsroom
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FINAL STATEMENT */}
      <section className="container-news pb-16">
        <div className="border-t border-border pt-10 text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl">
            Trust is earned, not claimed.
          </h2>

          <p className="text-muted-foreground mt-3 leading-6">
            ClearFact News will continue to improve its reporting, verification
            and accountability processes as our newsroom grows.
          </p>

          <p className="font-serif text-xl mt-6">
            Verified Journalism From Nigeria
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            ClearFact News
          </p>
        </div>
      </section>
    </main>
  );
}