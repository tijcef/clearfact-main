import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShieldCheck, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SocialFollow } from "./SocialMedia";
import { getCategories, normalizeWpSlug, primePostCache, stripHtml } from "@/lib/wordpress";
import {
  fallbackNavigationCategories,
  filterNavigationCategories,
  type NavigationCategory,
  type WordPressCategory,
} from "@/lib/site-navigation";

type TickerPost = {
  id: number;
  slug: string;
  title?: {
    rendered?: string;
  };
};

const TICKER_CACHE_KEY = "clearfact:ticker:v1";
const TICKER_REFRESH_MS = 5 * 60 * 1_000;

function isTickerPostList(value: unknown): value is TickerPost[] {
  return (
    Array.isArray(value) &&
    value.every(
      (post) =>
        post &&
        typeof post === "object" &&
        typeof post.id === "number" &&
        typeof post.slug === "string",
    )
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 md:gap-4" aria-label="ClearFact News home">
      <img
        src="/logo.jpg"
        alt="ClearFact News logo"
        className="h-11 w-auto object-contain md:h-12"
        width="120"
        height="120"
        decoding="async"
      />

      <div>
        <div className="text-3xl font-black tracking-tight transition-colors hover:text-red-600 md:text-4xl">
          ClearFact
        </div>

        <p className="hidden sm:block text-xs md:text-base text-muted-foreground">
          Verified journalism from Nigeria
        </p>
      </div>
    </Link>
  );
}

export function Header({ categories = [] }: { categories?: WordPressCategory[] }) {
  const routePosts = useRouterState({
    select: (state) =>
      state.matches.flatMap((match) => {
        const loaderData = match.loaderData as { posts?: unknown } | undefined;
        return isTickerPostList(loaderData?.posts) ? loaderData.posts : [];
      }),
  });
  const routeTickerPosts = routePosts.slice(0, 8);
  const [open, setOpen] = useState(false);
  const initialCategories = categories.length
    ? filterNavigationCategories(categories)
    : fallbackNavigationCategories;
  const [activeMainCategories, setActiveMainCategories] = useState<NavigationCategory[]>([
    ...initialCategories.main,
  ]);
  const [activeMoreCategories, setActiveMoreCategories] = useState<NavigationCategory[]>([
    ...initialCategories.more,
  ]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [tickerPosts, setTickerPosts] = useState<TickerPost[]>(routeTickerPosts);
  const [tickerLoading, setTickerLoading] = useState(routeTickerPosts.length === 0);
  const displayedTickerPosts = tickerPosts.length ? tickerPosts : routeTickerPosts;

  useEffect(() => {
    primePostCache(routePosts);
  }, [routePosts]);

  useEffect(() => {
    let active = true;

    async function loadActiveCategories() {
      try {
        const available = await getCategories();
        const filtered = filterNavigationCategories(available);
        if (active && (filtered.main.length || filtered.more.length)) {
          setActiveMainCategories(filtered.main);
          setActiveMoreCategories(filtered.more);
        }
      } catch (error) {
        if (active) console.error("Unable to load active categories:", error);
      }
    }

    void loadActiveCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!categories.length) return;

    const filtered = filterNavigationCategories(categories);
    setActiveMainCategories(filtered.main);
    setActiveMoreCategories(filtered.more);
  }, [categories]);

  useEffect(() => {
    let active = true;
    let currentController: AbortController | undefined;

    try {
      const cached = JSON.parse(window.localStorage.getItem(TICKER_CACHE_KEY) ?? "null");

      if (isTickerPostList(cached) && cached.length) {
        setTickerPosts(cached);
        setTickerLoading(false);
      }
    } catch {
      window.localStorage.removeItem(TICKER_CACHE_KEY);
    }

    async function loadTickerPosts() {
      currentController?.abort();
      currentController = new AbortController();
      const timeout = window.setTimeout(() => currentController?.abort(), 5_000);

      try {
        const response = await fetch(
          "/api/wp/posts?per_page=8&orderby=date&order=desc&_fields=id,slug,title",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: currentController.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Ticker request failed with status ${response.status}`);
        }

        const posts: unknown = await response.json();

        if (!active || !isTickerPostList(posts)) {
          return;
        }

        setTickerPosts(posts);
        window.localStorage.setItem(TICKER_CACHE_KEY, JSON.stringify(posts));
      } catch (error) {
        if (active && error instanceof Error && error.name !== "AbortError") {
          console.error("Unable to refresh ticker posts:", error);
        }
      } finally {
        window.clearTimeout(timeout);

        if (active) {
          setTickerLoading(false);
        }
      }
    }

    void loadTickerPosts();
    const refresh = window.setInterval(() => void loadTickerPosts(), TICKER_REFRESH_MS);

    return () => {
      active = false;
      currentController?.abort();
      window.clearInterval(refresh);
    };
  }, []);

  const date = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Lagos",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/98 shadow-sm">
      {/* Utility bar */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="container-news flex min-h-8 items-center justify-between gap-3">
          <span className="hidden md:inline">{date} · Nigeria</span>

          <div className="flex items-center gap-3 md:gap-4 overflow-x-auto whitespace-nowrap py-2">
            <SocialFollow compact inverse className="hidden xl:flex" />

            <span className="hidden h-4 w-px bg-primary-foreground/20 xl:block" />
            <Link to="/trust-center" className="inline-flex items-center gap-1 hover:text-gold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust Center
            </Link>

            <Link to="/fact-check" className="hover:text-gold">
              Fact Check
            </Link>

            <Link to="/newsletter" className="hover:text-gold">
              Newsletter
            </Link>

            <Link to="/contribute" className="hidden lg:inline hover:text-gold">
              Become a Contributor
            </Link>

            <Link to="/whistleblower" className="hidden sm:inline hover:text-gold">
              Tip Line
            </Link>

            <Link to="/dashboard" className="hidden sm:inline hover:text-gold">
              My Account
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-news flex min-h-20 items-center justify-between gap-4 py-3 md:min-h-24">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 -ml-2 rounded-sm hover:bg-accent"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Logo />
        </div>

        <form
          className="hidden md:flex items-center gap-2 max-w-md w-full"
          onSubmit={(event) => {
            event.preventDefault();

            const input = event.currentTarget.elements.namedItem("q") as HTMLInputElement | null;

            const query = input?.value.trim() ?? "";

            if (!query) {
              return;
            }

            window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }}
        >
          <label className="relative w-full">
            <span className="sr-only">Search ClearFact News</span>

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <input
              name="q"
              type="search"
              placeholder="Search news, investigations, reports and topics…"
              className="w-full h-10 pl-9 pr-3 text-sm bg-muted rounded-sm border border-transparent focus:border-primary focus:bg-background outline-none"
            />
          </label>
        </form>
      </div>

      {/* Category navigation */}
      <nav
        className={`border-t border-border ${open ? "block" : "hidden lg:block"}`}
        aria-label="News sections"
      >
        <div className="container-news flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 py-2 text-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
            {activeMainCategories.map((category) => (
              <Link
                key={category.slug}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="px-3 py-2 lg:px-2 lg:py-1 rounded-sm whitespace-nowrap font-medium text-foreground/80 hover:text-foreground hover:bg-accent"
                activeProps={{
                  className:
                    "px-3 py-2 lg:px-2 lg:py-1 rounded-sm whitespace-nowrap font-semibold text-primary bg-accent",
                }}
                onClick={() => setOpen(false)}
              >
                {"shortName" in category ? category.shortName : category.name}
              </Link>
            ))}
          </div>

          <div className="relative">
            {activeMoreCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                className="w-full lg:w-auto text-left px-3 py-2 lg:px-2 lg:py-1 rounded-sm whitespace-nowrap font-medium text-foreground/80 hover:text-foreground hover:bg-accent"
                aria-expanded={moreOpen}
              >
                More {moreOpen ? "▲" : "▼"}
              </button>
            )}

            {activeMoreCategories.length > 0 && moreOpen && (
              <div className="lg:absolute lg:top-full lg:right-0 mt-1 lg:mt-2 w-full lg:w-60 bg-background border border-border rounded-lg shadow-xl z-[999] overflow-hidden">
                {activeMoreCategories.map((category) => (
                  <Link
                    key={category.slug}
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    className="block px-4 py-3 hover:bg-accent"
                    onClick={() => {
                      setMoreOpen(false);
                      setOpen(false);
                    }}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {open && (
            <div className="mt-2 border-t border-border px-3 pt-3 lg:hidden">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Follow ClearFact
              </p>
              <SocialFollow />
            </div>
          )}
        </div>
      </nav>

      {/* Live ticker */}
      <div
        className="ticker-shell overflow-hidden border-y border-slate-700 bg-[#0f172a] text-white"
        role="region"
        aria-label="Latest ClearFact headlines"
      >
        <div className="container-news flex items-center gap-3 py-2.5">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Breaking News
          </span>

          <div className="ticker-viewport min-w-0 flex-1 overflow-hidden" aria-live="polite">
            {displayedTickerPosts.length > 0 ? (
              <div className="ticker-track gap-6 whitespace-nowrap md:gap-8">
                {[...displayedTickerPosts, ...displayedTickerPosts].map((post, index) => (
                  <Link
                    key={`${post.id}-${index}`}
                    to="/post/$slug"
                    params={{ slug: normalizeWpSlug(post.slug) }}
                    className="inline-flex shrink-0 items-center gap-3 text-sm font-semibold transition-colors hover:text-amber-400"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />

                    <span>
                      {stripHtml(post.title?.rendered ?? "Latest ClearFact verified report")}
                    </span>

                    <span className="text-slate-500">•</span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                to="/"
                className="whitespace-nowrap text-sm font-medium text-slate-300 hover:text-amber-400"
              >
                {tickerLoading ? "Browse the latest verified reports" : "View the latest news"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
