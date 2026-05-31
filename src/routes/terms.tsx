import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — ClearFact News" },
      { name: "description", content: "The terms governing the use of ClearFact News." },
      { property: "og:title", content: "Terms & Conditions" },
      { property: "og:description", content: "Terms of use." },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Legal" title="Terms & Conditions"
      intro="By using ClearFact News, you agree to the following terms.">
      <p>Content is for personal use. Republication requires written permission. We reserve the right to update these terms.</p>
    </SimplePage>
  ),
});
