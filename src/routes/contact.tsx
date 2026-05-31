import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ClearFact News" },
      { name: "description", content: "Get in touch with the ClearFact News editorial team, partnerships and reader services desks." },
      { property: "og:title", content: "Contact ClearFact News" },
      { property: "og:description", content: "Reach our editorial and partnerships teams." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="container-news py-12 md:py-16 grid lg:grid-cols-2 gap-12">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Get in touch</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2">We answer every message.</h1>
        <p className="text-muted-foreground mt-3">Editorial tips, corrections, partnerships and reader feedback are welcome.</p>
        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gold" /> 32 Demsawo, Jimeta, Yola, Nigeria</li>
          <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> clearfactmedia@gmail.com</li>
          <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> +234 (0) 800 CLEARFACT</li>
        </ul>
      </div>
      <form onSubmit={(e) => e.preventDefault()} className="rounded-sm border border-border p-6 bg-card space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="h-11 px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" placeholder="Full name" required />
          <input type="email" className="h-11 px-3 rounded-sm border border-border bg-background outline-none focus:border-primary" placeholder="Email" required />
        </div>
        <select className="h-11 w-full px-3 rounded-sm border border-border bg-background">
          <option>Editorial tip</option>
          <option>Correction request</option>
          <option>Advertise / Partner</option>
          <option>Reader feedback</option>
        </select>
        <textarea rows={6} className="w-full p-3 rounded-sm border border-border bg-background outline-none focus:border-primary" placeholder="Your message" required />
        <button className="h-11 px-5 rounded-sm bg-primary text-primary-foreground font-semibold">Send message</button>
      </form>
    </div>
  );
}
