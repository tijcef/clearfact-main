import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";

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
  const [busy, setBusy] = useState(false);
  const [received, setReceived] = useState(false);
  const [error, setError] = useState("");
  async function openTipEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") || "News tip").trim();
    const story = String(form.get("story") || "").trim();
    const evidence = String(form.get("evidence") || "").trim();
    const contact = String(form.get("contact") || "Not provided").trim();
    const senderName = String(form.get("sender_name") || "").trim();
    const publishName = form.get("name_credit") === "publish";
    if (publishName && !senderName) {
      const nameInput = event.currentTarget.elements.namedItem("sender_name") as HTMLInputElement;
      nameInput.setCustomValidity(
        "Enter the name you would like published, or choose to keep your name private.",
      );
      nameInput.reportValidity();
      return;
    }
    setBusy(true);
    setError("");
    setReceived(false);
    try {
      const response = await fetch("/api/wp/clearfact-story-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          story,
          evidence,
          contact,
          sender_name: senderName,
          name_credit: publishName ? "publish" : "private",
          website: String(form.get("website") || ""),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          response.status === 404
            ? "Online submissions are not available yet. Please use the editorial email below."
            : result?.message ||
                "Could not send your story. Please try again or email the editorial desk.",
        );
      }
      setReceived(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not send your story.");
    } finally {
      setBusy(false);
    }
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
          Send ClearFact News a community story, news tip, document or investigation lead. Tell us
          about local concerns, essential services and community achievements.
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
            aria-busy={busy}
            onSubmit={openTipEmail}
            className="rounded-sm border border-border p-6 md:p-8 bg-card space-y-5"
          >
            <div>
              <h2 className="font-serif text-2xl">Submit a Story</h2>

              <p className="text-sm text-muted-foreground mt-1">
                Give our newsroom enough information to understand and assess your submission.
              </p>
            </div>

            <div hidden aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {received && (
              <p role="status" className="rounded-lg border border-border bg-accent p-4">
                Your story has been received for editorial review. It has not been published.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <fieldset
              disabled={busy || received}
              className="rounded-sm border border-border p-4 space-y-3"
            >
              <legend className="px-1 text-sm font-semibold">How should we credit you?</legend>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="name_credit"
                  value="private"
                  defaultChecked
                  onChange={(event) => {
                    const nameInput = event.currentTarget.form?.elements.namedItem(
                      "sender_name",
                    ) as HTMLInputElement | null;
                    nameInput?.setCustomValidity("");
                  }}
                  className="mt-1 accent-primary"
                />
                <span>Keep my name private. Do not publish it.</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="name_credit"
                  value="publish"
                  className="mt-1 accent-primary"
                />
                <span>You may publish this story with my name.</span>
              </label>
              <label htmlFor="tip-name" className="text-sm font-medium block">
                Your name or preferred published credit
              </label>
              <input
                id="tip-name"
                name="sender_name"
                maxLength={120}
                autoComplete="name"
                onChange={(event) => event.currentTarget.setCustomValidity("")}
                className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
                placeholder="Required if you want your name published"
              />
              <p className="text-xs text-muted-foreground leading-5">
                If you choose to keep your name private, you may leave the name field blank. Your
                email address and any details you send remain visible to the editorial team. This
                preference controls public credit; it does not make your submission anonymous.
                Editors will review your story and credit preference before publication.
              </p>
            </fieldset>

            <div>
              <label htmlFor="tip-subject" className="text-sm font-medium block mb-2">
                Story subject
              </label>

              <input
                id="tip-subject"
                name="subject"
                minLength={3}
                maxLength={240}
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
                minLength={30}
                maxLength={30000}
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
                maxLength={10000}
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
                maxLength={300}
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
              disabled={busy || received}
              className="h-11 px-6 rounded-sm bg-gold text-gold-foreground font-semibold"
            >
              {busy ? "Sending…" : received ? "Story received" : "Submit for editorial review"}
            </button>

            <p className="text-xs text-muted-foreground leading-5">
              Your story is sent to the private editorial inbox. Include links to supporting files.
              Editors review submissions before publication; submission does not guarantee
              publication.
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
