import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/submit-story")({
  head: () => ({
    meta: [
      { title: "Submit a Story — ClearFact News" },
      { name: "description", content: "Send a tip or whistleblower submission to the ClearFact News investigations desk." },
      { property: "og:title", content: "Submit a Story to ClearFact" },
      { property: "og:description", content: "Confidential tips welcome." },
    ],
  }),
  component: SubmitStory,
});

function SubmitStory() {
  return (
    <div className="container-news py-12 md:py-16 grid lg:grid-cols-2 gap-12">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Tip line</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2">Send us a tip — confidentially.</h1>
        <p className="text-muted-foreground mt-3">
          Your identity is protected. Submissions are encrypted and reviewed by a senior editor only.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-verified">
          <Lock className="h-4 w-4" /> Encrypted submission
        </div>
      </div>
      <form onSubmit={(e) => e.preventDefault()} className="rounded-sm border border-border p-6 bg-card space-y-4">
        <input className="h-11 w-full px-3 rounded-sm border border-border bg-background" placeholder="Subject" required />
        <textarea rows={8} className="w-full p-3 rounded-sm border border-border bg-background" placeholder="Describe the story, share documents links, and any context…" required />
        <input className="h-11 w-full px-3 rounded-sm border border-border bg-background" placeholder="Optional contact (email or Signal)" />
        <button className="h-11 px-5 rounded-sm bg-gold text-gold-foreground font-semibold">Send securely</button>
      </form>
    </div>
  );
}
