import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-bold">404</h1>
        <h2 className="mt-4 font-serif text-xl">This story isn't here</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page may have moved or never existed. Try the homepage for the latest verified reporting.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-95"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Refresh to try again, or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="h-10 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-semibold"
          >
            Try again
          </button>
          <a href="/" className="h-10 px-4 rounded-sm border border-border text-sm font-semibold inline-flex items-center">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ClearFact News — Verified, transparent journalism from Nigeria" },
      {
        name: "description",
        content:
          "ClearFact News is an independent Nigerian newsroom delivering verified, transparent and timely journalism with a fact-check-first standard.",
      },
      { name: "author", content: "ClearFact News" },
      { property: "og:title", content: "ClearFact News — Verified, transparent journalism from Nigeria" },
      { property: "og:description", content: "ClearFact News is a Nigeria-based digital media platform delivering verified, transparent, and factual news globally." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ClearFactNews" },
      { name: "theme-color", content: "#11203d" },
      { name: "twitter:title", content: "ClearFact News — Verified, transparent journalism from Nigeria" },
      { name: "description", content: "ClearFact News is a Nigeria-based digital media platform delivering verified, transparent, and factual news globally." },
      { name: "twitter:description", content: "ClearFact News is a Nigeria-based digital media platform delivering verified, transparent, and factual news globally." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b63546f1-03d8-4c3e-89a8-79b1535eef35/id-preview-f102d6cb--a5c284b7-ee24-49dc-84b5-18cee9bf5a7f.lovable.app-1778242884096.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b63546f1-03d8-4c3e-89a8-79b1535eef35/id-preview-f102d6cb--a5c284b7-ee24-49dc-84b5-18cee9bf5a7f.lovable.app-1778242884096.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700;8..60,900&display=swap",
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
