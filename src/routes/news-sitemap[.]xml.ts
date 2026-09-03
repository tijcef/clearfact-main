import { createFileRoute } from "@tanstack/react-router";
import {
  getPublicPostPath,
  getRecentSitemapPosts,
  stripHtml,
  type SitemapPost,
} from "@/lib/wordpress";

const SITE_ORIGIN = "https://clearfact.ng";
const NEWS_WINDOW_HOURS = 48;
const NEWS_WINDOW_MS = NEWS_WINDOW_HOURS * 60 * 60 * 1_000;

function safeCdata(value: string) {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getPostTitle(post: SitemapPost) {
  return stripHtml(post.title?.rendered ?? "").trim();
}

function newsUrl(post: SitemapPost) {
  const title = safeCdata(getPostTitle(post));
  const publicationDate = new Date(post.date).toISOString();
  const postUrl = `${SITE_ORIGIN}${getPublicPostPath(post.slug)}`;

  return `  <url>
    <loc>${escapeXml(postUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>ClearFact News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title><![CDATA[${title}]]></news:title>
    </news:news>
  </url>`;
}

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let posts: SitemapPost[] = [];
        const cutoff = Date.now() - NEWS_WINDOW_MS;

        try {
          posts = await getRecentSitemapPosts(new Date(cutoff).toISOString());
        } catch (error) {
          console.error(
            "WordPress posts were unavailable for the news sitemap:",
            error,
          );

          return new Response("News sitemap temporarily unavailable", {
            status: 503,
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "no-store",
              "retry-after": "300",
            },
          });
        }

        const recentPosts = posts
          .filter((post) => {
            const publishedAt = new Date(post.date).getTime();

            return (
              Number.isFinite(publishedAt) &&
              publishedAt >= cutoff
            );
          })
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime(),
          );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentPosts.map(newsUrl).join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control":
              "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
