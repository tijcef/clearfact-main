import { createFileRoute } from "@tanstack/react-router";

const ROBOTS_TXT = `User-agent: *
Allow: /

# Private/utility routes are intentionally crawlable so bots can read their
# X-Robots-Tag: noindex headers. They are never included in the sitemap.
Sitemap: https://clearfact.ng/sitemap.xml
Sitemap: https://clearfact.ng/news-sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      HEAD: async () => {
        return new Response(null, {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
      GET: async () => {
        return new Response(ROBOTS_TXT, {
          status: 200,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control":
              "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
