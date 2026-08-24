import { createFileRoute } from "@tanstack/react-router";

const ROBOTS_TXT = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /auth
Disallow: /contributor/
Disallow: /dashboard
Disallow: /login
Disallow: /search
Disallow: /api/

Sitemap: https://clearfact.ng/sitemap.xml
Sitemap: https://clearfact.ng/news-sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
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