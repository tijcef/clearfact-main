import { createFileRoute } from "@tanstack/react-router";

const WP_API = "https://cms.tijcef.org/wp-json/wp/v2";

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const postsRes = await fetch(
          `${WP_API}/posts?per_page=100&status=publish&_fields=slug,date,title`
        );

        if (!postsRes.ok) {
          return new Response("Unable to generate Google News Sitemap", {
            status: 500,
          });
        }

        const posts = await postsRes.json();

        // Google News only accepts articles from the last 48 hours
        const cutoff = Date.now() - 48 * 60 * 60 * 1000;

        const recentPosts = posts.filter((post: any) => {
          return new Date(post.date).getTime() >= cutoff;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">

${recentPosts
  .map((post: any) => {
    const title = post.title.rendered
      .replace(/<[^>]*>/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `
<url>
  <loc>https://clearfact.ng/post/${post.slug}</loc>

  <news:news>

    <news:publication>
      <news:name>ClearFact News</news:name>
      <news:language>en</news:language>
    </news:publication>

    <news:publication_date>${new Date(
      post.date
    ).toISOString()}</news:publication_date>

    <news:title><![CDATA[${title}]]></news:title>

  </news:news>

</url>`;
  })
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