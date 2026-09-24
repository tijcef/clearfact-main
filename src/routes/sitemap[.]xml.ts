import { createFileRoute } from "@tanstack/react-router";
import {
  getCategories,
  getPublicPostPath,
  getSitemapPosts,
  type SitemapPost,
} from "@/lib/wordpress";
import { categories, moreCategories } from "@/lib/site-navigation";

const SITE_ORIGIN = "https://clearfact.ng";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/advertise",
  "/careers",
  "/editorial-policy",
  "/corrections",
  "/privacy",
  "/terms",
  "/trust-center",
  "/newsletter",
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let posts: SitemapPost[] = [];
        let publishedCategories: Array<{ slug: string; count: number }> = [];

        try {
          [posts, publishedCategories] = await Promise.all([getSitemapPosts(), getCategories()]);
        } catch (error) {
          console.error("WordPress posts were unavailable while generating the sitemap:", error);
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "no-store",
              "retry-after": "300",
            },
          });
        }

        const staticUrls = STATIC_PATHS.map((path) => ({
          loc: `${SITE_ORIGIN}${path}`,
        }));
        const liveSlugs = new Set(
          publishedCategories
            .filter((category) => category.count > 0)
            .map((category) => category.slug),
        );
        const categoryUrls = [...categories, ...moreCategories]
          .filter((category) => liveSlugs.has(category.slug))
          .map((category) => ({ loc: `${SITE_ORIGIN}/category/${category.slug}` }));
        const articleUrls = posts.map((post) => ({
          loc: `${SITE_ORIGIN}${getPublicPostPath(post.slug)}`,
          lastmod: (post.modified || post.date).split("T")[0],
        }));

        const urls = [...staticUrls, ...categoryUrls, ...articleUrls];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>${"lastmod" in item ? `\n    <lastmod>${item.lastmod}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
