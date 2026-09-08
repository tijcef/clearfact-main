import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";
import { serviceHead } from "@/lib/services";
export const Route = createFileRoute("/team")({
  head: () => serviceHead("Our Team", "/team", "Meet the leadership of ClearFact Media Ltd."),
  component: () => (
    <SimplePage
      eyebrow="ClearFact Media Ltd"
      title="Our team"
      intro="The people leading ClearFact News."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          ["Emmanuel Sunday Tijwun", "Lead / Founder"],
          ["Nuhu Danladi Mamtso", "Chief Editor"],
        ].map(([name, role]) => (
          <article key={name} className="border-t-4 border-gold bg-accent p-6">
            <p className="text-sm font-semibold uppercase tracking-wide">{role}</p>
            <h2 className="!mt-3">{name}</h2>
          </article>
        ))}
      </div>
      <p className="pt-6">
        Editorial enquiries: <a href="mailto:editor@clearfact.ng">editor@clearfact.ng</a>.
      </p>
      <p>
        Working with us? <a href="/staff">Open the staff area</a>.
      </p>
    </SimplePage>
  ),
});
