import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { SocialFollow } from "./SocialMedia";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/wordpress";
import { fallbackNavigationCategories, filterNavigationCategories } from "@/lib/site-navigation";

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
  const [activeCategories, setActiveCategories] = useState(
    () => fallbackNavigationCategories as ReturnType<typeof filterNavigationCategories>,
  );

  useEffect(() => {
    let active = true;

    getCategories()
      .then((available) => {
        if (active) {
          const filtered = filterNavigationCategories(available);

          if (filtered.main.length || filtered.more.length) {
            setActiveCategories(filtered);
          }
        }
      })
      .catch((error) => console.error("Unable to load active footer categories:", error));

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="container-news py-12 grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="font-serif text-2xl font-bold">
            ClearFact <span className="text-gold">News</span>
          </div>

          <p className="mt-3 text-sm text-primary-foreground/80">
            An independent Nigerian newsroom delivering verified, transparent and timely journalism
            to a national and global audience.
          </p>

          {/* Contact Information */}
          <div className="mt-5 space-y-3 text-sm">
            {/* Office */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />

              <span>32 Demsawo, Jimeta, Yola, Nigeria</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold shrink-0" />

              <a href="mailto:info@clearfact.ng" className="hover:text-gold transition-colors">
                info@clearfact.ng
              </a>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold shrink-0" />

              <a href="tel:+2347079405543" className="hover:text-gold transition-colors">
                +234 707 940 5543
              </a>
            </div>
          </div>

          {/* Social Media */}
          <SocialFollow inverse className="mt-5" />
        </div>

        {/* Sections */}
        <div>
          <h4 className="font-serif text-lg mb-3">Sections</h4>

          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {activeCategories.main.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-gold transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More */}
        <div>
          <h4 className="font-serif text-lg mb-3">More</h4>

          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {activeCategories.more.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-gold transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}

            <li>
              <Link to="/fact-check" className="hover:text-gold transition-colors">
                Fact Check Center
              </Link>
            </li>

            <li>
              <Link to="/trust-center" className="hover:text-gold transition-colors">
                Trust Center
              </Link>
            </li>

            <li>
              <Link to="/submit-story" className="hover:text-gold transition-colors">
                Submit a Story
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-serif text-lg mb-3">About & Policies</h4>

          <ul className="space-y-2 text-sm text-primary-foreground/85">
            {policy.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="hover:text-gold transition-colors">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-news py-4 flex flex-col md:flex-row gap-2 items-center justify-between text-xs text-primary-foreground/70">
          <span>© {new Date().getFullYear()} ClearFact News. All rights reserved.</span>

          <span className="text-center">
            Truth over speed · Verification over virality · Transparency over secrecy.
          </span>
        </div>
      </div>
    </footer>
  );
}
