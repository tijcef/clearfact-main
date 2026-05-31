import { Link } from "@tanstack/react-router";
import { Search, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, TICKER } from "@/lib/news-data";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/clearfact-logo.jpg";

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 group"
      aria-label="ClearFact News home"
    >
      <img
        src={logo}
        alt="ClearFact News Logo"
        className="h-10 w-10 object-contain"
      />

      <span className="leading-tight">
        <span className="block font-serif text-xl font-bold tracking-tight">
          ClearFact <span className="text-gold">News</span>
        </span>

        <span className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Verified · Transparent · Nigerian
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  const date = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      {/* Utility bar */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="container-news flex h-8 items-center justify-between">
          <span className="hidden sm:inline">
            {date} · Yola, Nigeria
          </span>

          <div className="flex items-center gap-4">
            <Link
              to="/trust-center"
              className="inline-flex items-center gap-1 hover:text-gold"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust Center
            </Link>

            <Link
              to="/newsletter"
              className="hover:text-gold"
            >
              Newsletter
            </Link>

            <Link
              to="/contribute"
              className="hover:text-gold"
            >
              Become a Contributor
            </Link>

            <Link
              to="/whistleblower"
              className="hover:text-gold"
            >
              Tip Line
            </Link>

            <Link
              to="/dashboard"
              className="hover:text-gold"
            >
              My Account
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-news flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 rounded-sm hover:bg-accent"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo />
        </div>

        <form
          className="hidden md:flex items-center gap-2 max-w-md w-full"
          onSubmit={(e) => {
            e.preventDefault();

            const q =
              (
                e.currentTarget.elements.namedItem(
                  "q"
                ) as HTMLInputElement
              )?.value ?? "";

            window.location.href = `/search?q=${encodeURIComponent(
              q
            )}`;
          }}
        >
          <label className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <input
              name="q"
              placeholder="Search verified reports, fact-checks, topics…"
              className="w-full h-10 pl-9 pr-3 text-sm bg-muted rounded-sm border border-transparent focus:border-primary focus:bg-background outline-none"
            />
          </label>
        </form>

        <Link
          to="/fact-check"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-sm bg-gold text-gold-foreground text-sm font-semibold hover:opacity-90"
        >
          <ShieldCheck className="h-4 w-4" />
          Fact Check
        </Link>
      </div>

      {/* Category nav */}
      <nav
        className={`border-t border-border ${
          open ? "block" : "hidden lg:block"
        }`}
        aria-label="Sections"
      >
        <div className="container-news flex flex-wrap lg:flex-nowrap gap-x-1 gap-y-1 lg:gap-x-3 overflow-x-auto py-2 text-sm">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/category/$slug`}
              params={{ slug: c.slug }}
              className="px-2 py-1 rounded-sm whitespace-nowrap font-medium text-foreground/80 hover:text-foreground hover:bg-accent"
              activeProps={{
                className:
                  "px-2 py-1 rounded-sm whitespace-nowrap font-semibold text-primary bg-accent",
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Live ticker */}
      <div className="bg-foreground text-background overflow-hidden">
        <div className="container-news flex items-center gap-3 py-1.5">
          <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-breaking text-breaking-foreground px-2 py-0.5 rounded-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-breaking-foreground animate-pulse" />
            Live
          </span>

          <div className="overflow-hidden flex-1">
            <div className="ticker-track flex gap-10 whitespace-nowrap text-xs">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="opacity-90">
                  • {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}