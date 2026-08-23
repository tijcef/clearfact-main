import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import type { FormEvent } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact ClearFact News — Editorial, Partnerships & Reader Services",
      },
      {
        name: "description",
        content:
          "Contact ClearFact News for editorial tips, corrections, advertising, partnerships, media enquiries and reader feedback.",
      },
      {
        property: "og:title",
        content: "Contact ClearFact News",
      },
      {
        property: "og:description",
        content:
          "Reach the ClearFact News editorial, partnerships, careers and reader services teams.",
      },
      { property: "og:url", content: "https://clearfact.ng/contact" },
    ],
    links: [{ rel: "canonical", href: "https://clearfact.ng/contact" }],
  }),

  component: Contact,
});

function Contact() {
  function openEmailDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const enquiryType = String(form.get("enquiryType") || "General enquiry").trim();
    const message = String(form.get("message") || "").trim();
    const subject = encodeURIComponent(`${enquiryType} — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    window.location.href = `mailto:info@clearfact.ng?subject=${subject}&body=${body}`;
  }

  return (
    <main className="container-news py-12 md:py-16">
      <div className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Contact ClearFact
        </div>

        <h1 className="font-serif text-4xl md:text-5xl mt-2">We want to hear from you.</h1>

        <p className="text-muted-foreground mt-4 text-lg leading-7">
          Contact ClearFact News for editorial tips, corrections, advertising, partnerships, media
          enquiries, careers or general enquiries.
        </p>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">
        {/* CONTACT INFORMATION */}
        <section className="lg:col-span-1 space-y-6">
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">Get in touch</h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Our team welcomes credible information, corrections, partnership enquiries and
              feedback from our readers.
            </p>

            <ul className="mt-6 space-y-5 text-sm">
              {/* OFFICE */}
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5 shrink-0" />

                <div>
                  <div className="font-semibold">Office</div>

                  <div className="text-muted-foreground">32 Demsawo, Jimeta, Yola, Nigeria</div>
                </div>
              </li>

              {/* EMAIL */}
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold mt-0.5 shrink-0" />

                <div>
                  <div className="font-semibold">General Enquiries</div>

                  <a
                    href="mailto:info@clearfact.ng?subject=General%20Enquiry"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    info@clearfact.ng
                  </a>
                </div>
              </li>

              {/* PHONE */}
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold mt-0.5 shrink-0" />

                <div>
                  <div className="font-semibold">Phone</div>

                  <a
                    href="tel:+2347079405543"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +234 707 940 5543
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* EDITORIAL */}
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">Editorial Desk</h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Have a story tip, correction, document or information that may be in the public
              interest?
            </p>

            <a
              href="mailto:editor@clearfact.ng?subject=Editorial%20Enquiry"
              className="inline-block mt-4 font-semibold text-primary hover:underline"
            >
              editor@clearfact.ng →
            </a>
          </div>

          {/* ADVERTISING */}
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">Advertising & Partnerships</h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              For advertising, sponsorships, media partnerships and commercial enquiries.
            </p>

            <a
              href="mailto:advertise@clearfact.ng?subject=Advertising%20Enquiry"
              className="inline-block mt-4 font-semibold text-primary hover:underline"
            >
              advertise@clearfact.ng →
            </a>
          </div>

          {/* CAREERS */}
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-serif text-2xl">Careers</h2>

            <p className="text-sm text-muted-foreground mt-2 leading-6">
              Interested in joining the ClearFact newsroom or technology team?
            </p>

            <a
              href="mailto:careers@clearfact.ng?subject=Career%20Enquiry"
              className="inline-block mt-4 font-semibold text-primary hover:underline"
            >
              careers@clearfact.ng →
            </a>
          </div>
        </section>

        {/* CONTACT FORM */}
        <section className="lg:col-span-2">
          <form
            onSubmit={openEmailDraft}
            className="rounded-sm border border-border p-6 md:p-8 bg-card space-y-5"
          >
            <div>
              <h2 className="font-serif text-2xl">Send us a message</h2>

              <p className="text-sm text-muted-foreground mt-1">
                Select the category that best describes your enquiry.
              </p>
            </div>

            {/* NAME & EMAIL */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="text-sm font-medium block mb-2">
                  Full name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="text-sm font-medium block mb-2">
                  Email address
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="h-11 w-full px-3 rounded-sm border border-border bg-background outline-none focus:border-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* ENQUIRY TYPE */}
            <div>
              <label htmlFor="contact-type" className="text-sm font-medium block mb-2">
                Enquiry type
              </label>

              <select
                id="contact-type"
                name="enquiryType"
                className="h-11 w-full px-3 rounded-sm border border-border bg-background"
                defaultValue="Editorial tip"
              >
                <option>Editorial tip</option>
                <option>Correction request</option>
                <option>Advertise / Partner</option>
                <option>Media enquiry</option>
                <option>Press enquiry</option>
                <option>Reader feedback</option>
                <option>Careers</option>
                <option>General enquiry</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div>
              <label htmlFor="contact-message" className="text-sm font-medium block mb-2">
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows={8}
                className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary resize-y"
                placeholder="Write your message..."
                required
              />
            </div>

            <div className="text-xs text-muted-foreground leading-5">
              Please do not submit confidential or sensitive information through this general
              contact form unless specifically requested by a ClearFact journalist.
            </div>

            <button
              type="submit"
              className="h-11 px-6 rounded-sm bg-primary text-primary-foreground font-semibold"
            >
              Open email to send
            </button>

            <p className="text-xs text-muted-foreground">
              This opens your email app with the message filled in so you can review it before
              sending. ClearFact does not receive it until you send the email.
            </p>
          </form>
        </section>
      </div>

      {/* EDITORIAL TRANSPARENCY */}
      <section className="mt-14 max-w-4xl border-t border-border pt-10">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Editorial Transparency
        </div>

        <h2 className="font-serif text-3xl mt-2">Accuracy, corrections and accountability</h2>

        <p className="text-sm text-muted-foreground mt-4 leading-6">
          ClearFact News welcomes credible information and corrections that help improve the
          accuracy of our journalism. If you believe an article contains an error, please identify
          the specific claim and provide supporting information where possible.
        </p>

        <p className="text-sm text-muted-foreground mt-3 leading-6">
          Editorial matters should be directed to{" "}
          <a
            href="mailto:editor@clearfact.ng?subject=Editorial%20Matter"
            className="text-primary font-semibold hover:underline"
          >
            editor@clearfact.ng
          </a>
          .
        </p>

        <p className="text-sm text-muted-foreground mt-3 leading-6">
          For advertising and commercial partnerships, visit our{" "}
          <a href="/advertise" className="text-primary font-semibold hover:underline">
            Advertise
          </a>{" "}
          page or contact{" "}
          <a
            href="mailto:advertise@clearfact.ng?subject=Advertising%20Enquiry"
            className="text-primary font-semibold hover:underline"
          >
            advertise@clearfact.ng
          </a>
          .
        </p>

        <p className="text-sm text-muted-foreground mt-3 leading-6">
          For employment opportunities, visit our{" "}
          <a href="/careers" className="text-primary font-semibold hover:underline">
            Careers
          </a>{" "}
          page or contact{" "}
          <a
            href="mailto:careers@clearfact.ng?subject=Career%20Enquiry"
            className="text-primary font-semibold hover:underline"
          >
            careers@clearfact.ng
          </a>
          .
        </p>
      </section>

      {/* NEWSROOM CONTACTS */}
      <section className="mt-12 rounded-sm border border-border bg-card p-6 md:p-8">
        <h2 className="font-serif text-2xl">ClearFact News Desks</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {/* EDITORIAL */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gold font-semibold">
              Editorial
            </div>

            <a
              href="mailto:editor@clearfact.ng?subject=Editorial%20Enquiry"
              className="font-semibold mt-1 block hover:text-primary transition-colors"
            >
              editor@clearfact.ng
            </a>
          </div>

          {/* ADVERTISING */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gold font-semibold">
              Advertising
            </div>

            <a
              href="mailto:advertise@clearfact.ng?subject=Advertising%20Enquiry"
              className="font-semibold mt-1 block hover:text-primary transition-colors"
            >
              advertise@clearfact.ng
            </a>
          </div>

          {/* CAREERS */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gold font-semibold">Careers</div>

            <a
              href="mailto:careers@clearfact.ng?subject=Career%20Enquiry"
              className="font-semibold mt-1 block hover:text-primary transition-colors"
            >
              careers@clearfact.ng
            </a>
          </div>

          {/* GENERAL */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gold font-semibold">General</div>

            <a
              href="mailto:info@clearfact.ng?subject=General%20Enquiry"
              className="font-semibold mt-1 block hover:text-primary transition-colors"
            >
              info@clearfact.ng
            </a>
          </div>
        </div>

        {/* PHONE CONTACT */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-xs uppercase tracking-wider text-gold font-semibold">Telephone</div>

          <a
            href="tel:+2347079405543"
            className="inline-block font-semibold text-lg mt-1 hover:text-primary transition-colors"
          >
            +234 707 940 5543
          </a>
        </div>
      </section>

      {/* FOOTER BRAND MESSAGE */}
      <section className="mt-12 text-center">
        <p className="font-serif text-2xl">ClearFact News</p>

        <p className="text-sm text-muted-foreground mt-1">Verified Journalism From Nigeria</p>
      </section>
    </main>
  );
}
