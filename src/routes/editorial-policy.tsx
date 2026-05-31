import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/editorial-policy")({
  head: () => ({
    meta: [
      { title: "Editorial Policy — ClearFact News" },
      { name: "description", content: "How ClearFact News reports, sources, verifies and labels content." },
      { property: "og:title", content: "Editorial Policy" },
      { property: "og:description", content: "Our standards, in public." },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Standards" title="Editorial Policy" intro="Our newsroom standards are public so readers can hold us accountable.">
      <h2>Sourcing</h2>
      <p>We prefer named, on-the-record sources. Anonymous sourcing requires editor approval and a documented reason.</p>
      <h2>Verification</h2>
      <p>Every claim is verified against primary documents or multiple independent sources before publication.</p>
      <h2>Labels</h2>
      <p>News, Opinion, Analysis, Sponsored and Developing stories are clearly labelled.</p>
      <h2>AI use</h2>
      <p>Where AI assists with summarisation, transcription or pattern-detection, it is disclosed and reviewed by a human editor.</p>
    </SimplePage>
  ),
});
