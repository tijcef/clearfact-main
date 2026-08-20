import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import {
  Lock,
  AlertTriangle,
  ShieldAlert,
  FileWarning,
} from "lucide-react";

export const Route = createFileRoute("/whistleblower")({
  head: () => ({
    meta: [
      { title: "Confidential Tip Line — ClearFact News" },
      {
        name: "description",
        content:
          "Submit confidential information, news tips and public-interest reports to the ClearFact News investigations desk.",
      },
      {
        property: "og:title",
        content: "Confidential Tip Line | ClearFact News",
      },
      {
        property: "og:description",
        content:
          "Share information about potential wrongdoing or public-interest issues with the ClearFact investigations team.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: Whistle,
});

function Whistle() {
  const [kind, setKind] = useState("whistleblower");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [severity, setSeverity] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (subject.trim().length < 5) {
      return toast.error("Please provide a clear subject.");
    }

    if (details.trim().length < 30) {
      return toast.error(
        "Please provide a more detailed description."
      );
    }

    setBusy(true);

    const { error } = await supabase
      .from("community_reports")
      .insert({
        kind,
        subject: subject.trim(),
        details: details.trim(),
        contact: contact.trim() || null,
        severity,
      });

    setBusy(false);

    if (error) {
      console.error("Whistleblower submission error:", error);
      return toast.error(
        "We could not receive your submission. Please try again."
      );
    }

    setDone(true);
  };

  if (done) {
    return (
      <main className="container-news py-20 max-w-2xl text-center">
        <ShieldAlert className="h-12 w-12 mx-auto text-verified" />

        <h1 className="font-serif text-3xl mt-4">
          Submission received
        </h1>

        <p className="text-muted-foreground mt-3 leading-7">
          Thank you for contacting ClearFact News. Your submission has been
          received by our reporting system and may be reviewed by the
          appropriate editorial team.
        </p>

        <p className="text-sm text-muted-foreground mt-4">
          Submission does not guarantee publication or further contact.
        </p>

        <a
          href="/"
          className="inline-flex mt-6 rounded-md bg-primary px-5 py-3 text-primary-foreground font-semibold"
        >
          Return to ClearFact
        </a>
      </main>
    );
  }

  return (
    <main className="container-news py-12 md:py-16">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
          Confidential Tip Line
        </div>

        <h1 className="font-serif text-4xl md:text-5xl mt-2">
          Tell us what matters.
        </h1>

        <p className="text-muted-foreground mt-4 text-lg leading-7">
          If you have information about corruption, abuse of power,
          public-safety threats, environmental harm, election-related
          wrongdoing or other issues of public interest, you can share the
          information with ClearFact News.
        </p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-10 max-w-5xl">
        <section>
          <form
            onSubmit={submit}
            className="rounded-sm border border-border bg-card p-6 md:p-8 space-y-5"
          >
            <div>
              <h2 className="font-serif text-2xl">
                Submit information
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Provide as much useful context and supporting information as
                you can.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Submission type
                </label>

                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="h-11 w-full px-3 rounded-sm border border-border bg-background"
                >
                  <option value="whistleblower">
                    Whistleblower disclosure
                  </option>

                  <option value="tip">
                    News tip
                  </option>

                  <option value="emergency">
                    Public-safety report
                  </option>

                  <option value="correction">
                    Correction request
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Urgency
                </label>

                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="h-11 w-full px-3 rounded-sm border border-border bg-background"
                >
                  <option value="normal">
                    Normal
                  </option>

                  <option value="high">
                    High — public safety concern
                  </option>

                  <option value="critical">
                    Critical — immediate danger
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Subject
              </label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe the issue"
                required
                className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Details
              </label>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={11}
                placeholder="Explain what happened, when it happened, where it happened, who is involved and why you believe it is important."
                required
                className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary resize-y"
              />

              <p className="text-xs text-muted-foreground mt-2">
                Include relevant documents, evidence or links where
                appropriate.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Contact information
              </label>

              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Optional email or other contact method"
                className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
              />

              <p className="text-xs text-muted-foreground mt-2">
                Leave blank if you do not want to provide contact information.
              </p>
            </div>

            <div className="rounded-sm border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <FileWarning className="h-5 w-5 text-gold mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">
                    Important security notice
                  </p>

                  <p className="text-xs text-muted-foreground mt-1 leading-5">
                    This form should not currently be treated as a fully
                    anonymous or secure whistleblower platform. Do not submit
                    highly sensitive information, passwords, confidential
                    credentials or information that could place you or another
                    person at immediate risk.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="h-11 px-6 rounded-sm bg-gold text-gold-foreground font-semibold disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Submit Information"}
            </button>

            <p className="text-xs text-muted-foreground leading-5">
              Submission does not guarantee publication, investigation or
              further communication. ClearFact may verify information before
              taking editorial action.
            </p>
          </form>
        </section>

        <aside className="space-y-5">
          <div className="rounded-sm border border-border bg-card p-6">
            <Lock className="h-5 w-5 text-verified" />

            <h2 className="font-semibold mt-3">
              Protect your identity
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              If your information is sensitive, carefully consider what
              identifying details you include. Do not provide unnecessary
              personal information.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <AlertTriangle className="h-5 w-5 text-gold" />

            <h2 className="font-semibold mt-3">
              If someone is in immediate danger
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              This newsroom submission channel is not an emergency response
              service. Contact the appropriate emergency or public-safety
              authority where immediate assistance is required.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">
              Editorial Desk
            </h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              You can also contact the ClearFact editorial team directly.
            </p>

            <a
              href="mailto:editor@clearfact.ng?subject=Confidential%20Editorial%20Enquiry"
              className="inline-block mt-4 font-semibold text-primary hover:underline"
            >
              editor@clearfact.ng →
            </a>
          </div>
        </aside>
      </div>

      <section className="mt-14 border-t border-border pt-10 max-w-4xl">
        <div className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Our Process
        </div>

        <h2 className="font-serif text-3xl mt-2">
          What happens after a submission?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="font-serif text-3xl">
              01
            </div>

            <h3 className="font-semibold mt-2">
              Editorial Review
            </h3>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              The information may be reviewed for relevance, credibility and
              potential public interest.
            </p>
          </div>

          <div>
            <div className="font-serif text-3xl">
              02
            </div>

            <h3 className="font-semibold mt-2">
              Verification
            </h3>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Relevant claims may be checked against documents, records,
              interviews and independent sources.
            </p>
          </div>

          <div>
            <div className="font-serif text-3xl">
              03
            </div>

            <h3 className="font-semibold mt-2">
              Reporting
            </h3>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Where appropriate, the newsroom may conduct additional reporting
              before publishing a story.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}