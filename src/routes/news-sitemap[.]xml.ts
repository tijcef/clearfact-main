import { createFileRoute } from "@tanstack/react-router";
import { getPublicPostPath, getSitemapPosts, stripHtml, type SitemapPost } from "@/lib/wordpress";

const SITE_ORIGIN = "https://clearfact.ng";
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1_000;

function safeCdata(value: string) {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function newsUrl(post: SitemapPost) {
  const title = safeCdata(stripHtml(post.title?.rendered));

  return `  <url>
    <loc>${SITE_ORIGIN}${getPublicPostPath(post.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>ClearFact News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.date).toISOString()}</news:publication_date>
      <news:title><![CDATA[${title}]]></news:title>
    </news:news>
  </url>`;
}

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let posts: SitemapPost[] = [];

        try {
          posts = await getSitemapPosts(2);
        } catch (error) {
          console.error("WordPress posts were unavailable for the news sitemap:", error);
        }

        const cutoff = Date.now() - FORTY_EIGHT_HOURS;
        const recentPosts = posts.filter((post) => new Date(post.date).getTime() >= cutoff);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentPosts.map(newsUrl).join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
