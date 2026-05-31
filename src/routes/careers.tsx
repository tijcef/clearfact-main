import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — ClearFact News" },
      { name: "description", content: "Join an independent Nigerian newsroom. Open roles in reporting, fact-checking, engineering and design." },
      { property: "og:title", content: "Careers at ClearFact News" },
      { property: "og:description", content: "Build the future of African journalism." },
    ],
  }),
  component: () => (
    <SimplePage eyebrow="Careers" title="Build the future of African journalism."
      intro="We hire reporters, editors, fact-checkers, engineers and designers who care about truth.">
      <h2>Open roles</h2>
      <ul>
        <li>Senior Investigative Reporter — Abuja</li>
        <li>Verification Editor — Yola</li>
        <li>Frontend Engineer (React/TanStack) — Remote</li>
        <li>Newsroom Product Designer — Remote</li>
      </ul>
      <p>Send your CV and clips to <a href="mailto:clearfactmedia@gmail.com">clearfactmedia@gmail.com</a>.</p>
    </SimplePage>
  ),
});
