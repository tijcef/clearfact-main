import { createFileRoute } from "@tanstack/react-router";

const WP_API = "https://cms.tijcef.org/wp-json/wp/v2";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const postsRes = await fetch(
          `${WP_API}/posts?per_page=100&status=publish&_fields=slug,date,modified`
        );

        if (!postsRes.ok) {
          return new Response("Unable to generate sitemap", {
            status: 500,
          });
        }

        const posts = await postsRes.json();

        const today = new Date().toISOString().split("T")[0];

        const staticPages = [
          {
            loc: "https://clearfact.ng/",
            lastmod: today,
          },
          {
            loc: "https://clearfact.ng/about",
            lastmod: today,
          },
          {
            loc: "https://clearfact.ng/contact",
            lastmod: today,
          },
        ];

        const articlePages = posts.map((post: any) => ({
          loc: `https://clearfact.ng/post/${post.slug}`,
          lastmod: (
            post.modified ||
            post.date
          ).split("T")[0],
        }));

        const urls = [
          ...staticPages,
          ...articlePages,
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `
  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </url>`
  )
  .join("")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});