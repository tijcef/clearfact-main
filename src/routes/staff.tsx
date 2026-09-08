import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";
import { serviceHead } from "@/lib/services";
export const Route = createFileRoute("/staff")({
  head: () =>
    serviceHead("Staff Area", "/staff", "Authorised staff access for ClearFact Media Ltd."),
  component: () => (
    <SimplePage
      eyebrow="ClearFact Media Ltd"
      title="Staff area"
      intro="Sign in with the account assigned to you. Access to records and publishing tools depends on your staff role."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="border border-border rounded p-6">
          <h2 className="!mt-0">Publishing & services</h2>
          <p>
            Manage WordPress stories, books, e-print editions, service requests, partnerships and
            verified payment receipts.
          </p>
          <a
            href="https://cms.clearfact.ng/wp-admin/"
            rel="nofollow"
            className="inline-block mt-4 font-semibold"
          >
            WordPress staff sign-in ↗
          </a>
        </section>
        <section className="border border-border rounded p-6">
          <h2 className="!mt-0">Newsroom dashboard</h2>
          <p>Review contributor submissions and use your assigned newsroom tools.</p>
          <a href="/admin" rel="nofollow" className="inline-block mt-4 font-semibold">
            Open newsroom dashboard
          </a>
        </section>
      </div>
      <p className="pt-6">
        Need access? Contact the Lead / Founder or Chief Editor.{" "}
        <a href="/team">Meet the leadership</a>.
      </p>
    </SimplePage>
  ),
});
