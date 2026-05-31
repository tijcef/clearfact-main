import { createFileRoute } from "@tanstack/react-router";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter — ClearFact News" },
      { name: "description", content: "Subscribe to The Morning Verify — five verified stories shaping Nigeria, every weekday." },
      { property: "og:title", content: "The Morning Verify Newsletter" },
      { property: "og:description", content: "Five verified stories, every weekday." },
    ],
  }),
  component: () => (
    <div className="container-news py-12 md:py-16">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Newsletter</div>
      <h1 className="font-serif text-4xl md:text-5xl mt-2 max-w-2xl text-balance">
        The Morning Verify — verified Nigeria news, before 7am.
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        A short, sourced briefing curated by the ClearFact editorial team. Free, ad-light, and never sold.
      </p>
      <div className="mt-10">
        <Newsletter />
      </div>
    </div>
  ),
});
