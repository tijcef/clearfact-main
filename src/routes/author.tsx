import { createFileRoute } from "@tanstack/react-router";
import { AuthorBookDashboard } from "@/components/site/AuthorBookDashboard";
import { SimplePage } from "@/components/site/SimplePage";
import { serviceHead } from "@/lib/services";

export const Route = createFileRoute("/author")({
  head: () =>
    serviceHead(
      "Author Centre",
      "/author",
      "Create an author profile, submit a digital book for review and track sales through ClearFact Books.",
    ),
  component: AuthorCentre,
});

function AuthorCentre() {
  return (
    <SimplePage
      eyebrow="ClearFact Books"
      title="Author Centre"
      intro="Create your writer profile, submit your digital book and manage approved sales from one secure author account."
    >
      <div className="grid gap-5 sm:grid-cols-3 not-prose">
        {[
          [
            "Create your profile",
            "Use your email to create a secure author account. Add your name or pen name and maintain your profile from the author dashboard.",
          ],
          [
            "Submit for review",
            "Upload your cover, description, sample and full PDF. ClearFact reviews your rights, quality and presentation before publication.",
          ],
          [
            "Track what you earn",
            "See approved books, purchases, commission, earnings and staff-recorded payouts. Buyers’ personal details remain private.",
          ],
        ].map(([title, body]) => (
          <section key={title} className="border-t-4 border-gold bg-accent p-5">
            <h2 className="!mt-0 !text-xl">{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
      <AuthorBookDashboard />
      <h2>What happens after submission?</h2>
      <p>
        Your book remains private while it is reviewed. If approved, ClearFact creates a priced
        digital product, displays its cover, description and sample, and sends readers through the
        secure checkout. The full PDF is delivered only after the payment provider confirms payment.
      </p>
      <p>
        Authors can return to this frontend page to see review notes, sales, commission, earnings
        and payouts. ClearFact staff review and record payouts; the website does not make an
        unverified bank transfer.
      </p>
      <p>
        Questions about publishing or your profile:{" "}
        <a href="mailto:info@clearfact.ng">info@clearfact.ng</a>.
      </p>
    </SimplePage>
  );
}
