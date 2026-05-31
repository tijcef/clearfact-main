import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise — ClearFact News" },
      { name: "description", content: "Reach a verified, engaged Nigerian audience through ClearFact News advertising and sponsorship programmes." },
      { property: "og:title", content: "Advertise with ClearFact News" },
      { property: "og:description", content: "A trusted environment for premium advertisers." },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Advertise" title="Reach Nigeria's most discerning readers."
      intro="ClearFact News offers display, sponsored content, newsletter and podcast partnerships — all clearly labelled and editorially independent.">
      <h2>Why ClearFact</h2>
      <ul>
        <li>Verified, brand-safe environment</li>
        <li>National + diaspora audience</li>
        <li>Premium formats with full transparency</li>
      </ul>
      <p>Email <a href="mailto:clearfactmedia@gmail.com">clearfactmedia@gmail.com</a> for the latest media kit.</p>
    </SimplePage>
  ),
});
