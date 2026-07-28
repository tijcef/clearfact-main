export const WP_API = "https://cms.tijcef.org/wp-json/wp/v2";

const WP_PROXY = "/api/wp";
const WP_MEDIA_PATH = "/wp-content/uploads/";
const DEFAULT_LIST_SIZE = 36;
const SERVER_GET_TIMEOUT_MS = 12_500;
const BROWSER_GET_TIMEOUT_MS = 15_000;
const WRITE_TIMEOUT_MS = 10_000;
const MEMORY_STALE_TTL_MS = 24 * 60 * 60 * 1_000;

const LIST_FIELDS = [
  "id",
  "slug",
  "date",
  "date_gmt",
  "modified",
  "title",
  "excerpt",
  "content",
  "categories",
  "featured_media",
  "acf",
  "authors",
  "_links",
  "_embedded",
].join(",");

type CacheEntry = {
  expiresAt: number;
  staleUntil: number;
  value: unknown;
};

type CloudflareRequestInit = RequestInit & {
  cf?: {
    cacheEverything?: boolean;
    cacheTtl?: number;
  };
};

const memoryCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<unknown>>();
const postDetailCache = new Map<string, any>();

export function primePostCache(posts: unknown) {
  if (!Array.isArray(posts)) {
    return;
  }

  posts.forEach((post) => {
    if (
      post &&
      typeof post === "object" &&
      typeof post.slug === "string" &&
      typeof post.content?.rendered === "string"
    ) {
      postDetailCache.set(normalizeWpSlug(post.slug), post);
    }
  });
}

function buildQuery(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  return `?${params.toString()}`;
}

function resolveEndpoint(path: string) {
  return typeof window === "undefined" ? `${WP_API}${path}` : `${WP_PROXY}${path}`;
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { cacheTtl?: number } = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const cacheTtl = options.cacheTtl ?? 900;
  const endpoint = resolveEndpoint(path);
  const cacheKey = `${method}:${endpoint}`;
  const now = Date.now();
  let staleEntry: CacheEntry | undefined;

  if (method === "GET") {
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }

    if (cached && cached.staleUntil > now) {
      staleEntry = cached;
    } else if (cached) {
      memoryCache.delete(cacheKey);
    }

    const pendingRequest = inflightRequests.get(cacheKey);

    if (pendingRequest) {
      return pendingRequest as Promise<T>;
    }
  }

  const request = async (): Promise<T> => {
    const init: CloudflareRequestInit = {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    };

    delete (init as { cacheTtl?: number }).cacheTtl;

    if (method === "GET" && typeof window === "undefined") {
      init.cf = {
        cacheEverything: true,
        cacheTtl,
      };
    }

    const controller = new AbortController();
    const timeoutMs =
      method === "GET"
        ? typeof window === "undefined"
          ? SERVER_GET_TIMEOUT_MS
          : BROWSER_GET_TIMEOUT_MS
        : WRITE_TIMEOUT_MS;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`WordPress request failed (${response.status} ${response.statusText})`);
      }

      const value = (await response.json()) as T;

      if (method === "GET") {
        memoryCache.set(cacheKey, {
          expiresAt: Date.now() + cacheTtl * 1_000,
          staleUntil: Date.now() + Math.max(cacheTtl * 1_000, MEMORY_STALE_TTL_MS),
          value,
        });
      }

      return value;
    } catch (error) {
      if (method === "GET" && staleEntry) {
        console.warn(`Using cached WordPress data after ${endpoint} failed.`);
        return staleEntry.value as T;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`WordPress request timed out after ${timeoutMs / 1_000} seconds`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };

  const pending = request();

  if (method === "GET") {
    inflightRequests.set(cacheKey, pending);
  }

  try {
    return await pending;
  } finally {
    if (method === "GET") {
      inflightRequests.delete(cacheKey);
    }
  }
}

function listQuery(values: Record<string, string | number | undefined> = {}) {
  return buildQuery({
    per_page: DEFAULT_LIST_SIZE,
    _embed: "wp:featuredmedia,wp:term,author",
    acf_format: "standard",
    _fields: LIST_FIELDS,
    ...values,
  });
}

export async function getPosts(limit = DEFAULT_LIST_SIZE) {
  const posts = await requestJson<any[]>(
    `/posts${listQuery({ per_page: Math.min(Math.max(limit, 1), 100) })}`,
  );

  primePostCache(posts);
  return posts;
}

export async function getCategories() {
  return requestJson<any[]>(
    `/categories${buildQuery({
      per_page: 100,
      _fields: "id,name,slug,parent,count,description",
    })}`,
    { cacheTtl: 900 },
  );
}

export async function getCategoryBySlug(slug: string) {
  const categories = await requestJson<any[]>(
    `/categories${buildQuery({
      slug,
      per_page: 1,
      _fields: "id,name,slug,parent,count,description",
    })}`,
    { cacheTtl: 900 },
  );

  return categories[0] ?? null;
}

export async function getTags() {
  return requestJson<any[]>(
    `/tags${buildQuery({
      per_page: 20,
      orderby: "count",
      order: "desc",
      _fields: "id,name,slug,count",
    })}`,
    { cacheTtl: 900 },
  );
}

export async function searchPosts(query: string, limit = 24) {
  const posts = await requestJson<any[]>(
    `/posts${listQuery({
      search: query,
      per_page: Math.min(Math.max(limit, 1), 100),
    })}`,
    { cacheTtl: 120 },
  );

  primePostCache(posts);
  return posts;
}

export async function getPostBySlug(slug: string) {
  const publicSlug = normalizeWpSlug(slug);
  const cachedPost = postDetailCache.get(publicSlug);

  if (cachedPost) {
    return cachedPost;
  }

  const containsUnicode = [...publicSlug].some(
    (character) => (character.codePointAt(0) ?? 0) > 127,
  );
  const wordpressSlug = containsUnicode ? encodeURIComponent(publicSlug).toLowerCase() : publicSlug;
  const candidates = [...new Set([wordpressSlug, slug])];

  for (const candidate of candidates) {
    const posts = await requestJson<any[]>(
      `/posts${buildQuery({
        slug: candidate,
        per_page: 1,
        _embed: "wp:featuredmedia,wp:term,author",
        acf_format: "standard",
      })}`,
      { cacheTtl: 300 },
    );

    if (posts.length) {
      primePostCache(posts);
      return posts[0];
    }
  }

  return null;
}

export async function getPostsByCategory(categoryId: number, limit = 24) {
  const posts = await requestJson<any[]>(
    `/posts${listQuery({
      categories: categoryId,
      per_page: Math.min(Math.max(limit, 1), 100),
    })}`,
    { cacheTtl: 600 },
  );

  primePostCache(posts);
  return posts;
}

export async function getRelatedPosts(categoryId: number, currentPostId: number, limit = 8) {
  const posts = await requestJson<any[]>(
    `/posts${listQuery({
      categories: categoryId,
      exclude: currentPostId,
      per_page: Math.min(limit, 20),
    })}`,
    { cacheTtl: 300 },
  );

  return posts.slice(0, limit);
}

export async function getAdjacentPosts(publishedAt: string, currentPostId: number) {
  const fields = "id,slug,date,title";
  const common = {
    per_page: 1,
    exclude: currentPostId,
    orderby: "date",
    _fields: fields,
  };

  const [previousPosts, nextPosts] = await Promise.all([
    requestJson<any[]>(
      `/posts${buildQuery({
        ...common,
        before: publishedAt,
        order: "desc",
      })}`,
      { cacheTtl: 300 },
    ),
    requestJson<any[]>(
      `/posts${buildQuery({
        ...common,
        after: publishedAt,
        order: "asc",
      })}`,
      { cacheTtl: 300 },
    ),
  ]);

  return {
    previousPost: previousPosts[0] ?? null,
    nextPost: nextPosts[0] ?? null,
  };
}

export async function getComments(postId: number) {
  return requestJson<any[]>(
    `/comments${buildQuery({
      post: postId,
      per_page: 20,
      _fields: "id,author_name,date,content",
    })}`,
    { cacheTtl: 60 },
  );
}

export async function submitComment(postId: number, name: string, email: string, content: string) {
  return requestJson("/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post: postId,
      author_name: name,
      author_email: email,
      content,
    }),
    cacheTtl: 0,
  });
}

export type SitemapPost = {
  id: number;
  slug: string;
  date: string;
  modified?: string;
  title?: {
    rendered?: string;
  };
};

export async function getSitemapPosts(maxPages = 10) {
  const posts: SitemapPost[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    let batch: SitemapPost[];

    try {
      batch = await requestJson<SitemapPost[]>(
        `/posts${buildQuery({
          per_page: 100,
          page,
          status: "publish",
          orderby: "date",
          order: "desc",
          _fields: "id,slug,date,modified,title",
        })}`,
        { cacheTtl: 900 },
      );
    } catch (error) {
      if (posts.length) {
        console.warn("A later WordPress sitemap page failed; returning the pages already loaded.");
        break;
      }

      throw error;
    }

    posts.push(...batch);

    if (batch.length < 100) {
      break;
    }
  }

  return posts;
}

export function normalizeWpSlug(slug: string) {
  let value = slug.trim();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const decoded = decodeURIComponent(value);

      if (decoded === value) {
        break;
      }

      value = decoded;
    } catch {
      break;
    }
  }

  return value;
}

export function getPublicPostPath(slug: string) {
  return `/post/${encodeURIComponent(normalizeWpSlug(slug))}`;
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  rdquo: "”",
  rsquo: "’",
};

export function decodeHtmlEntities(value = "") {
  return value.replace(
    /&#(\d+);|&#x([\da-f]+);|&([a-z]+);/gi,
    (entity, decimal: string | undefined, hexadecimal: string | undefined, named: string) => {
      if (decimal) {
        return String.fromCodePoint(Number(decimal));
      }

      if (hexadecimal) {
        return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      }

      return HTML_ENTITIES[named.toLowerCase()] ?? entity;
    },
  );
}

export function stripHtml(value = "") {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, "")).trim();
}

export function proxyWpMediaUrl(sourceUrl?: string) {
  if (!sourceUrl) return "";

  try {
    const url = new URL(sourceUrl, "https://clearfact.ng");

    if (url.hostname === "cms.tijcef.org" && url.pathname.startsWith(WP_MEDIA_PATH)) {
      const mediaPath = url.pathname.slice(WP_MEDIA_PATH.length);
      return `/media/${mediaPath}${url.search}`;
    }
  } catch {
    return sourceUrl;
  }

  return sourceUrl;
}

type PreferredImageSize = "full" | "large" | "medium_large" | "medium";

export function getFeaturedImageUrl(
  post: any,
  fallback = "",
  preferredSize: PreferredImageSize = "large",
) {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes ?? {};
  const sizePriority: PreferredImageSize[] =
    preferredSize === "full"
      ? ["full", "large", "medium_large", "medium"]
      : preferredSize === "large"
        ? ["large", "medium_large", "medium", "full"]
        : preferredSize === "medium_large"
          ? ["medium_large", "large", "medium", "full"]
          : ["medium", "medium_large", "large", "full"];

  const sourceUrl =
    sizePriority
      .map((size) => (size === "full" ? media?.source_url : sizes?.[size]?.source_url))
      .find(Boolean) ?? "";

  return proxyWpMediaUrl(sourceUrl) || fallback;
}

export function proxyWpMediaInHtml(html: string) {
  return html.replace(/https?:\/\/cms\.tijcef\.org\/wp-content\/uploads\//gi, "/media/");
}
