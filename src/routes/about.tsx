import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/site/SimplePage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ClearFact" },
      { name: "description", content: "ClearFact News is an independent Nigerian newsroom committed to verified, transparent journalism." },
      { property: "og:title", content: "About ClearFact News" },
      { property: "og:description", content: "Independent. Verified. Nigerian." },
    ],
  }),
  component: () => (
    <SimplePage
      eyebrow="Our story"
      title="An independent newsroom built on verification."
      intro="Founded by Emmanuel Sunday Tijwun and a team of Nigerian journalists, ClearFact News exists to deliver verified, transparent, fact-based information to the public — without fear and without favour."
    >
      <h2>Mission</h2>
      <p>To provide verified, transparent, unbiased and fact-based information to the Nigerian and global public.</p>
      <h2>Vision</h2>
      <p>To become Africa's leading trusted digital news platform for truthful journalism and public enlightenment.</p>
      <h2>Core values</h2>
      <ul>
        <li>Transparency · Accuracy · Accountability</li>
        <li>Integrity · Public Trust</li>
        <li>Investigative Journalism · Speed with Verification</li>
      </ul>
      <h2>Headquarters</h2>
      <p>32 Demsawo, Jimeta, Yola, Adamawa State, Nigeria.</p>
    </SimplePage>
  ),
});