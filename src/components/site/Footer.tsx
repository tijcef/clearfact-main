import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Twitter, Facebook, Youtube, Instagram } from "lucide-react";
import { CATEGORIES } from "@/lib/news-data";

const policy = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/advertise", label: "Advertise" },
  { to: "/careers", label: "Careers" },
  { to: "/editorial-policy", label: "Editorial Policy" },
  { to: "/corrections", label: "Corrections Policy" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="container-news py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-serif text-2xl font-bold">
            ClearFact <span className="text-gold">News</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/80">
            An independent Nigerian newsroom delivering verified, transparent and timely journalism to a national and global audience.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /><span>32 Demsawo, Jimeta, Yola</span></div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /><span>clearfactmedia@gmail.com</span></div>
          </div>
          <div className="mt-4 flex gap-3">
            {[Twitter, Facebook, Instagram, Youtube].map((I, i) => (
              <a key={i} href="#" aria-label="Social link" className="p-2 rounded-sm bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Sections</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {CATEGORIES.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-gold">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">More</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {CATEGORIES.slice(8).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-gold">{c.label}</Link>
              </li>
            ))}
            <li><Link to="/trust-center" className="hover:text-gold">Trust Center</Link></li>
            <li><Link to="/submit-story" className="hover:text-gold">Submit a Story</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">About & Policies</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {policy.map((p) => (
              <li key={p.to}><Link to={p.to} className="hover:text-gold">{p.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-news py-4 flex flex-col md:flex-row gap-2 items-center justify-between text-xs text-primary-foreground/70">
          <span>© {new Date().getFullYear()} ClearFact News. All rights reserved.</span>
          <span>Truth over speed · Verification over virality · Transparency over secrecy.</span>
        </div>
      </div>
    </footer>
  );
}
