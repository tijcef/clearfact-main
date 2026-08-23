import { createFileRoute } from "@tanstack/react-router";
import {
  getCategories,
  getPublicPostPath,
  getSitemapPosts,
  type SitemapPost,
} from "@/lib/wordpress";
import {
  categories,
  getCategorySourceSlugs,
  MIN_INDEXABLE_CATEGORY_POSTS,
  moreCategories,
} from "@/lib/site-navigation";

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
  "/transparency",
  "/fact-check",
  "/newsletter",
  "/contribute",
  "/submit-story",
];

type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDate(value?: string | null) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString().split("T")[0];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let posts: SitemapPost[] = [];
        let publishedCategories: Array<{
          slug: string;
          count: number;
        }> = [];

        try {
          [posts, publishedCategories] = await Promise.all([getSitemapPosts(), getCategories()]);
        } catch (error) {
          console.error("WordPress data was unavailable while generating the sitemap:", error);

          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "no-store",
              "retry-after": "300",
            },
          });
        }

        const staticUrls: SitemapUrl[] = STATIC_PATHS.map((path) => ({
          loc: `${SITE_ORIGIN}${path}`,
        }));

        const liveCategorySlugs = new Set(
          publishedCategories
            .filter((category) => category.count >= MIN_INDEXABLE_CATEGORY_POSTS)
            .map((category) => category.slug),
        );

        const categoryUrls: SitemapUrl[] = [...categories, ...moreCategories]
          .filter((category) =>
            getCategorySourceSlugs(category.slug).some((slug) => liveCategorySlugs.has(slug)),
          )
          .map((category) => ({
            loc: `${SITE_ORIGIN}/category/${category.slug}`,
          }));

        const articleUrls: SitemapUrl[] = posts
          .filter((post) => post.slug)
          .map((post) => ({
            loc: `${SITE_ORIGIN}${getPublicPostPath(post.slug)}`,
            lastmod: normalizeDate(post.modified || post.date),
          }));

        const uniqueUrls = new Map<string, SitemapUrl>();

        for (const item of [...staticUrls, ...categoryUrls, ...articleUrls]) {
          if (!uniqueUrls.has(item.loc)) {
            uniqueUrls.set(item.loc, item);
          }
        }

        const urls = Array.from(uniqueUrls.values());

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>${
      item.lastmod ? `\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>` : ""
    }
  </url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
