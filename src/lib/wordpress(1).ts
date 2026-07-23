export const WP_API = "https://cms.tijcef.org/wp-json/wp/v2";

const WP_PROXY = "/api/wp";
const WP_MEDIA_PATH = "/wp-content/uploads/";
const DEFAULT_LIST_SIZE = 36;

const LIST_FIELDS = [
  "id",
  "slug",
  "date",
  "modified",
  "title",
  "excerpt",
  "categories",
  "featured_media",
  "acf",
  "authors",
  "_links",
  "_embedded",
].join(",");

type CacheEntry = {
  expiresAt: number;
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
  const cacheTtl = options.cacheTtl ?? 300;
  const endpoint = resolveEndpoint(path);
  const cacheKey = `${method}:${endpoint}`;
  const now = Date.now();

  if (method === "GET") {
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }

    const pending = inflightRequests.get(cacheKey);

    if (pending) {
      return pending as Promise<T>;
    }
  }

  const request = async () => {
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

    const response = await fetch(endpoint, init);

    if (!response.ok) {
      throw new Error(`WordPress request failed (${response.status} ${response.statusText})`);
    }

    const value = (await response.json()) as T;

    if (method === "GET") {
      memoryCache.set(cacheKey, {
        expiresAt: Date.now() + cacheTtl * 1_000,
        value,
      });
    }

    return value;
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
  return requestJson<any[]>(`/posts${listQuery({ per_page: Math.min(Math.max(limit, 1), 100) })}`);
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
  return requestJson<any[]>(
    `/posts${listQuery({
      search: query,
      per_page: Math.min(Math.max(limit, 1), 100),
    })}`,
    { cacheTtl: 120 },
  );
}

export async function getPostBySlug(slug: string) {
  const posts = await requestJson<any[]>(
    `/posts${buildQuery({
      slug,
      per_page: 1,
      _embed: "wp:featuredmedia,wp:term,author",
      acf_format: "standard",
    })}`,
    { cacheTtl: 300 },
  );

  return posts.length ? posts[0] : null;
}

export async function getPostsByCategory(categoryId: number, limit = 24) {
  return requestJson<any[]>(
    `/posts${listQuery({
      categories: categoryId,
      per_page: Math.min(Math.max(limit, 1), 100),
    })}`,
    { cacheTtl: 180 },
  );
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

export function getFeaturedImageUrl(post: any, fallback = "") {
  const sourceUrl = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";

  return proxyWpMediaUrl(sourceUrl) || fallback;
}

export function proxyWpMediaInHtml(html: string) {
  return html.replace(/https?:\/\/cms\.tijcef\.org\/wp-content\/uploads\//gi, "/media/");
}
