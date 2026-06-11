import { createFileRoute } from "@tanstack/react-router";

const WP_API = "https://cms.tijcef.org/wp-json/wp/v2";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const postsRes = await fetch(
          `${WP_API}/posts?per_page=100`
        );

        const posts = await postsRes.json();

        const urls = [
          "https://clearfact.ng/",
          "https://clearfact.ng/about",
          "https://clearfact.ng/contact",

          ...posts.map(
            (post: any) =>
              `https://clearfact.ng/post/${post.slug}`
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join("")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
          },
        });
      },
    },
  },
});