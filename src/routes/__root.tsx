import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { getCategories } from "@/lib/wordpress";
import { ADSENSE_CLIENT, isAdSupportedPath } from "@/lib/site-config";

const GA_MEASUREMENT_ID = "G-GZZJ1W1D3P";

function AdSenseScript() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (!isAdSupportedPath(pathname)) {
    return null;
  }

  return (
    <script
      id="clearfact-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}

function NotFoundComponent() {
  return (
    <>
      <title>Page not found | ClearFact News</title>
      <meta name="robots" content="noindex,follow" />

      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-7xl font-bold">404</h1>

          <h2 className="mt-4 font-serif text-xl">This story isn't here</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            The page may have moved or never existed.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  const router = useRouter();
  const [isRecovering, setIsRecovering] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    const storageKey = `clearfact-route-recovery:${path}`;
    const now = Date.now();

    let recovery = {
      attempts: 0,
      startedAt: now,
    };

    try {
      const stored = window.sessionStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored) as typeof recovery;

        if (now - parsed.startedAt < 30_000) {
          recovery = parsed;
        }
      }
    } catch {
      // Recovery must still work when storage is unavailable.
    }

    if (recovery.attempts >= 2) {
      setIsRecovering(false);
      return;
    }

    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          attempts: recovery.attempts + 1,
          startedAt: recovery.startedAt,
        }),
      );
    } catch {
      // Recovery must still work when storage is unavailable.
    }

    const timeout = window.setTimeout(
      () => {
        void router.invalidate().finally(reset);
      },
      recovery.attempts === 0 ? 500 : 1_500,
    );

    return () => window.clearTimeout(timeout);
  }, [reset, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">
          {isRecovering ? "Reconnecting to ClearFact…" : "This page needs another moment"}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {isRecovering
            ? "The page is recovering automatically. You do not need to refresh."
            : "Please try again, or continue from the latest news."}
        </p>

        {!isRecovering && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => {
                window.sessionStorage.removeItem(
                  `clearfact-route-recovery:${window.location.pathname}`,
                );

                setIsRecovering(true);
                void router.invalidate().finally(reset);
              }}
              className="h-10 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Try again
            </button>

            <a
              href="/"
              className="inline-flex h-10 items-center rounded-sm border border-border px-4 text-sm font-semibold"
            >
              Latest news
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<Record<string, never>>()({
  loader: async () => {
    try {
      const categories = await getCategories();

      return {
        categories: Array.isArray(categories) ? categories : [],
      };
    } catch (error) {
      console.error("WordPress categories failed to load for site navigation:", error);

      return {
        categories: [],
      };
    }
  },

  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        title: "ClearFact News | Verified Journalism From Nigeria",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "theme-color",
        content: "#0f2f62",
      },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large",
      },
      {
        name: "google-adsense-account",
        content: ADSENSE_CLIENT,
      },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },

      // ClearFact favicon for Google Search and browser tabs
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        href: "/favicon.png",
      },

      // Compatibility for browsers that use shortcut icon
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },

      // Mobile / Apple devices
      {
        rel: "apple-touch-icon",
        sizes: "512x512",
        href: "/logo.jpg",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />

        {/* Google Analytics */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag("js", new Date());
              gtag("config", "${GA_MEASUREMENT_ID}", {
                anonymize_ip: true
              });
            `,
          }}
        />

        {/* Google AdSense is limited to substantive public content routes. */}
        <AdSenseScript />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { categories } = Route.useLoaderData();

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-white text-black transition-colors dark:bg-black dark:text-white">
        <Header categories={categories} />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer categories={categories} />
      </div>
    </ThemeProvider>
  );
}
