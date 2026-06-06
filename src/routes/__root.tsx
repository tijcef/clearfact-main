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
import { ThemeProvider } from "@/components/theme-provider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-bold">
          404
        </h1>

        <h2 className="mt-4 font-serif text-xl">
          This story isn't here
        </h2>

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
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Refresh to try again.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="h-10 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-semibold"
          >
            Try again
          </button>

          <a
            href="/"
            className="h-10 px-4 rounded-sm border border-border text-sm font-semibold inline-flex items-center"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        { charSet: "utf-8" },

        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },

        {
          title:
            "ClearFact News — Verified journalism",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8967021504063466"
          crossOrigin="anonymous"
        />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors">
          <Header />

          <main className="flex-1">
            <Outlet />
          </main>

          <Footer />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}