import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { FormEvent } from "react";

export const Route = createFileRoute("/submit-story")({
  head: () => ({
    meta: [
      { title: "Submit a Story — ClearFact News" },
      {
        name: "description",
        content:
          "Submit a news tip, document, investigation lead or public-interest story to the ClearFact News editorial team.",
      },
      {
        property: "og:title",
        content: "Submit a Story to ClearFact News",
      },
      {
        property: "og:description",
        content:
          "Have information that matters? Send a news tip, document or investigation lead to ClearFact News.",
      },
      { property: "og:url", content: "https://clearfact.ng/submit-story" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/submit-story" }],
  }),

  component: SubmitStory,
});

function SubmitStory() {
  function openTipEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") || "News tip").trim();
    const story = String(form.get("story") || "").trim();
    const evidence = String(form.get("evidence") || "").trim();
    const contact = String(form.get("contact") || "Not provided").trim();
    const body = encodeURIComponent(
      `Story details:\n${story}\n\nSupporting evidence or links:\n${evidence || "None listed"}\n\nPreferred contact:\n${contact}`,
    );

    window.location.href = `mailto:editor@clearfact.ng?subject=${encodeURIComponent(`News tip — ${subject}`)}&body=${body}`;
  }

  return (
    <main className="container-news py-12 md:py-16">
      {" "}
      <div className="max-w-3xl">
        {" "}
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          ClearFact Tip Line{" "}
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2">Have information that matters?</h1>
        <p className="text-muted-foreground mt-4 text-lg leading-7">
          Send ClearFact News a news tip, document, investigation lead or information that may be in
          the public interest.
        </p>
      </div>
      <div className="mt-10 grid lg:grid-cols-3 gap-8">
        {/* INFORMATION */}
        <section className="lg:col-span-1 space-y-6">
          <div className="rounded-sm border border-border bg-card p-6">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-verified">
              <Lock className="h-4 w-4" />
              Confidentiality matters
            </div>

            <h2 className="font-serif text-2xl mt-4">What you can send</h2>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Original documents</li>
              <li>• Evidence of public-interest wrongdoing</li>
              <li>• Government or institutional records</li>
              <li>• Information about corruption or abuse</li>
              <li>• Investigative story leads</li>
              <li>• Photos or videos relevant to a story</li>
              <li>• Information about issues affecting communities</li>
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">Before you submit</h2>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Tell us what happened and why you believe it matters.</li>

              <li>• Provide dates, locations, names and other useful context.</li>

              <li>• Include supporting documents or links where available.</li>

              <li>• Do not knowingly submit false or fabricated information.</li>

              <li>• Avoid sending unnecessary personal or sensitive information.</li>
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">Editorial Desk</h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              If you prefer to contact the newsroom directly, reach our editorial desk.
            </p>

            <a
              href="mailto:editor@clearfact.ng?subject=News%20Tip"
              className="inline-block mt-4 font-semibold text-primary hover:underline"
            >
              editor@clearfact.ng →
            </a>
          </div>
        </section>

        {/* SUBMISSION FORM */}
        <section className="lg:col-span-2">
          <form
            onSubmit={openTipEmail}
            className="rounded-sm border border-border p-6 md:p-8 bg-card space-y-5"
          >
            <div>
              <h2 className="font-serif text-2xl">Submit a Story</h2>

              <p className="text-sm text-muted-foreground mt-1">
                Give our newsroom enough information to understand and assess your submission.
              </p>
            </div>

            <div>
              <label htmlFor="tip-subject" className="text-sm font-medium block mb-2">
                Story subject
              </label>

              <input
                id="tip-subject"
                name="subject"
                className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
                placeholder="What is the story about?"
                required
              />
            </div>

            <div>
              <label htmlFor="tip-story" className="text-sm font-medium block mb-2">
                Your information
              </label>

              <textarea
                id="tip-story"
                name="story"
                rows={10}
                className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary resize-y"
                placeholder="Describe what happened, who is involved, when it happened, where it happened and why you believe it is important..."
                required
              />
            </div>

            <div>
              <label htmlFor="tip-evidence" className="text-sm font-medium block mb-2">
                Supporting evidence or links
              </label>

              <textarea
                id="tip-evidence"
                name="evidence"
                rows={5}
                className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary resize-y"
                placeholder="Paste relevant document links, URLs or additional evidence..."
              />
            </div>

            <div>
              <label htmlFor="tip-contact" className="text-sm font-medium block mb-2">
                Preferred contact
              </label>

              <input
                id="tip-contact"
                name="contact"
                className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
                placeholder="Optional email or other contact method"
              />

              <p className="text-xs text-muted-foreground mt-2">
                You may leave this blank if you do not want to provide contact information.
              </p>
            </div>

            <div className="rounded-sm border border-border p-4 bg-background">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-gold mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">Important privacy notice</p>

                  <p className="text-xs text-muted-foreground mt-1 leading-5">
                    This form is currently a general submission channel and should not be treated as
                    an anonymous or technically secure whistleblower system. Do not submit highly
                    sensitive information until ClearFact's secure submission infrastructure is
                    available.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="h-11 px-6 rounded-sm bg-gold text-gold-foreground font-semibold"
            >
              Open email to submit
            </button>

            <p className="text-xs text-muted-foreground leading-5">
              This opens your email app with the tip filled in. You can review it and attach files
              before sending. Submissions are reviewed for editorial relevance and verification;
              submission does not guarantee publication.
            </p>
          </form>
        </section>
      </div>
      {/* EDITORIAL PROCESS */}
      <section className="mt-14 border-t border-border pt-10 max-w-4xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          What Happens Next
        </div>

        <h2 className="font-serif text-3xl mt-2">How ClearFact reviews tips</h2>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="text-2xl font-serif font-semibold">01</div>

            <h3 className="font-semibold mt-2">Editorial Review</h3>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Our team reviews the information to determine whether it has legitimate editorial or
              public-interest value.
            </p>
          </div>

          <div>
            <div className="text-2xl font-serif font-semibold">02</div>

            <h3 className="font-semibold mt-2">Verification</h3>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Relevant claims may be checked against documents, official records, interviews and
              independent sources.
            </p>
          </div>

          <div>
            <div className="text-2xl font-serif font-semibold">03</div>

            <h3 className="font-semibold mt-2">Reporting</h3>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              If the information supports a legitimate story, our newsroom may conduct further
              reporting before publication.
            </p>
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section className="mt-12 rounded-sm border border-border bg-card p-6 md:p-8">
        <h2 className="font-serif text-2xl">Have a story worth investigating?</h2>

        <p className="text-sm text-muted-foreground mt-2 leading-6">
          ClearFact News is committed to journalism that informs the public, strengthens
          accountability and gives communities a voice.
        </p>

        <a
          href="mailto:editor@clearfact.ng?subject=ClearFact%20News%20Tip"
          className="inline-block mt-5 font-semibold text-primary hover:underline"
        >
          Contact the Editorial Desk →
        </a>
      </section>
    </main>
  );
}
