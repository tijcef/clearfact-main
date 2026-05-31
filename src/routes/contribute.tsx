import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Video, ShieldCheck, Coins, BookOpen, Search } from "lucide-react";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Become a Contributor — ClearFact News" },
      { name: "description", content: "Join Nigeria's verified citizen journalism network. Submit stories, get fact-checked, earn payouts." },
      { property: "og:title", content: "Report for ClearFact" },
      { property: "og:description", content: "Verified citizen journalism, paid contributors, transparent editorial." },
    ],
  }),
  component: Contribute,
});

const ROLES = [
  { icon: <BookOpen className="h-5 w-5" />, name: "Citizen Reporter", desc: "Eyewitness accounts, community news." },
  { icon: <BookOpen className="h-5 w-5" />, name: "Freelance Journalist", desc: "Independent reporting across beats." },
  { icon: <ShieldCheck className="h-5 w-5" />, name: "Verified Correspondent", desc: "Embedded reporter for a region." },
  { icon: <Search className="h-5 w-5" />, name: "Investigative Reporter", desc: "Long-form, evidence-heavy work." },
  { icon: <Camera className="h-5 w-5" />, name: "Photojournalist", desc: "Visual storytelling with imagery." },
  { icon: <Video className="h-5 w-5" />, name: "Videographer", desc: "On-site video and broadcast clips." },
];

function Contribute() {
  return (
    <div>
      <section className="bg-foreground text-background">
        <div className="container-news py-16 md:py-24 max-w-3xl">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Contributor Network</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-tight">Report Nigeria. Get verified. Get paid.</h1>
          <p className="text-background/80 mt-4 text-lg">Submit your story. ClearFact's AI screens for fake news, plagiarism and bias. Editors verify and publish. You earn — and build a public trust score that travels with you.</p>
          <div className="flex gap-3 mt-6">
            <Link to="/contributor/onboarding" className="h-12 px-6 rounded-sm bg-gold text-gold-foreground font-semibold inline-flex items-center">Apply now</Link>
            <Link to="/contributor" className="h-12 px-6 rounded-sm border border-background/40 font-semibold inline-flex items-center">Open dashboard</Link>
          </div>
        </div>
      </section>

      <section className="container-news py-16 grid md:grid-cols-3 gap-6">
        <Stat icon={<Coins className="h-6 w-6 text-gold" />} title="Paid per published story" body="Default ₦2,500 per accepted report; investigative pieces and exclusives earn more." />
        <Stat icon={<ShieldCheck className="h-6 w-6 text-verified" />} title="Trust score, public" body="Beginner → Trusted → Verified → Elite Reporter. Tier unlocks higher payouts." />
        <Stat icon={<Search className="h-6 w-6 text-primary" />} title="AI + editor verification" body="Every submission passes fake-news, plagiarism, duplicate, hate-speech and human review." />
      </section>

      <section className="bg-accent/40">
        <div className="container-news py-16">
          <h2 className="font-serif text-3xl">Six ways to contribute</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {ROLES.map((r) => (
              <div key={r.name} className="rounded-sm border border-border bg-background p-5">
                <div className="h-10 w-10 grid place-items-center rounded-sm bg-accent">{r.icon}</div>
                <div className="font-serif text-lg mt-3">{r.name}</div>
                <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-news py-16 max-w-3xl">
        <h2 className="font-serif text-3xl">How it works</h2>
        <ol className="mt-6 space-y-5 text-sm">
          {["Apply and verify your identity (phone, government ID, selfie).",
            "Submit a story with sources, evidence and optional geo-tag.",
            "Our AI screens for fake news, plagiarism, duplicates, hate speech.",
            "An editor reviews, corrects and publishes — or gives feedback.",
            "Payout lands in your wallet; trust score adjusts; tier may upgrade."].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="h-7 w-7 grid place-items-center rounded-full bg-primary text-primary-foreground font-semibold shrink-0">{i + 1}</span>
                <span className="pt-1">{s}</span>
              </li>
          ))}
        </ol>
        <div className="mt-8 flex gap-3">
          <Link to="/contributor/onboarding" className="h-12 px-6 rounded-sm bg-primary text-primary-foreground font-semibold inline-flex items-center">Start application</Link>
          <Link to="/whistleblower" className="h-12 px-6 rounded-sm border border-border font-semibold inline-flex items-center">Anonymous tip instead</Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="h-12 w-12 rounded-sm bg-accent grid place-items-center">{icon}</div>
      <div className="font-serif text-xl mt-3">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
