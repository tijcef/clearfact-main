import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { Lock, AlertTriangle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/whistleblower")({
  head: () => ({
    meta: [
      { title: "Anonymous Whistleblower — ClearFact News" },
      { name: "description", content: "Send confidential tips and evidence to the ClearFact investigations desk." },
      { property: "og:title", content: "Confidential Tip Line" },
      { property: "og:description", content: "Report wrongdoing securely and anonymously." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Whistle,
});

function Whistle() {
  const [kind, setKind] = useState("whistleblower");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [severity, setSeverity] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.length < 5 || details.length < 30) return toast.error("Please add a subject and detailed description (30+ chars)");
    setBusy(true);
    const { error } = await supabase.from("community_reports").insert({ kind, subject, details, contact: contact || null, severity });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone(true);
  };

  if (done) {
    return (
      <div className="container-news py-20 max-w-xl text-center">
        <ShieldAlert className="h-12 w-12 mx-auto text-verified" />
        <h1 className="font-serif text-3xl mt-4">Tip received — thank you</h1>
        <p className="text-muted-foreground mt-2">Your submission is encrypted and queued for the senior investigations editor. We do not log IP addresses for anonymous reports.</p>
      </div>
    );
  }

  return (
    <div className="container-news py-12 grid lg:grid-cols-[1fr_360px] gap-10 max-w-5xl">
      <Toaster richColors position="top-center" />
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Tip line</div>
        <h1 className="font-serif text-4xl mt-2">Anonymous whistleblower system</h1>
        <p className="text-muted-foreground mt-3">Report corruption, abuse of power, public-safety threats, environmental harm, election fraud or any wrongdoing. Submission is anonymous unless you choose to share contact.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-11 px-3 rounded-sm border border-border bg-background">
              <option value="whistleblower">Whistleblower disclosure</option>
              <option value="tip">News tip</option>
              <option value="emergency">Emergency report</option>
              <option value="correction">Correction request</option>
            </select>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="h-11 px-3 rounded-sm border border-border bg-background">
              <option value="normal">Normal urgency</option>
              <option value="high">High — public safety risk</option>
              <option value="critical">Critical — life-threatening</option>
            </select>
          </div>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required className="h-11 w-full px-3 rounded-sm border border-border bg-background" />
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={10} placeholder="Describe what happened, when, where, who is involved. Link to documents or evidence if possible." required className="w-full p-3 rounded-sm border border-border bg-background" />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Optional — Signal/email to follow up (leave blank to stay anonymous)" className="h-11 w-full px-3 rounded-sm border border-border bg-background" />
          <button disabled={busy} className="h-11 px-6 rounded-sm bg-gold text-gold-foreground font-semibold disabled:opacity-60">{busy ? "Sending…" : "Send securely"}</button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-sm border border-border bg-card p-5">
          <Lock className="h-5 w-5 text-verified" />
          <div className="font-semibold mt-2">Encrypted in transit</div>
          <p className="text-sm text-muted-foreground mt-1">Your tip is transmitted over TLS and stored with row-level access restricted to senior editors.</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <AlertTriangle className="h-5 w-5 text-gold" />
          <div className="font-semibold mt-2">Stay safe</div>
          <p className="text-sm text-muted-foreground mt-1">For maximum anonymity use Tor Browser and a public Wi-Fi network. Do not include identifying details unless necessary.</p>
        </div>
      </aside>
    </div>
  );
}
