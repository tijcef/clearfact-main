import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Connect this form to your newsletter provider/database here.
    setSubmitted(true);
  };

  return (
    <section className="bg-accent border border-border rounded-sm p-6 md:p-8">
      <div className="grid md:grid-cols-[1fr_420px] gap-8 items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            ClearFact Newsletter
          </div>

          <h3 className="font-serif text-2xl md:text-3xl mt-2">
            The Morning Verify
          </h3>

          <p className="text-sm text-muted-foreground mt-2 leading-6 max-w-xl">
            Five important and verified stories shaping Nigeria, delivered
            to your inbox before 7am. Clear headlines, essential context and
            no unnecessary noise.
          </p>

          <p className="text-xs text-muted-foreground mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>

        <div>
          {submitted ? (
            <div className="rounded-sm border border-border bg-background p-5">
              <div className="font-semibold">
                You're on the list.
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                Thank you for subscribing to The Morning Verify.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Your email address"
                className="flex-1 h-11 px-3 rounded-sm bg-background border border-border focus:border-primary outline-none"
              />

              <button
                type="submit"
                className="h-11 px-5 rounded-sm bg-primary text-primary-foreground font-semibold hover:opacity-95"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}