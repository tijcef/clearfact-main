import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ClearFact News" },
      { name: "description", content: "How ClearFact News collects, uses and protects reader data." },
      { property: "og:title", content: "Privacy Policy" },
      { property: "og:description", content: "Reader privacy at ClearFact News." },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Legal" title="Privacy Policy"
      intro="We respect your privacy and only collect what we need to deliver our journalism.">
      <p>This policy explains what data we collect, how we use it, and the choices you have. Contact <a href="mailto:clearfactmedia@gmail.com">clearfactmedia@gmail.com</a> with privacy questions.</p>
    </SimplePage>
  ),
});
