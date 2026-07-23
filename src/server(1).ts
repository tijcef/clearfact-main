import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type ExecutionContextLike = {
  waitUntil?: (promise: Promise<unknown>) => void;
};

type CloudflareCacheStorage = CacheStorage & {
  default?: Cache;
};

type CloudflareRequestInit = RequestInit & {
  cf?: {
    cacheEverything?: boolean;
    cacheTtl?: number;
  };
};

const WP_REST_ORIGIN = "https://cms.tijcef.org/wp-json/wp/v2";
const WP_MEDIA_ORIGIN = "https://cms.tijcef.org/wp-content/uploads/";
const ONE_YEAR = 31_536_000;

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function getDefaultCache() {
  return (globalThis.caches as CloudflareCacheStorage | undefined)?.default;
}

function runInBackground(ctx: ExecutionContextLike, promise: Promise<unknown>) {
  if (ctx.waitUntil) {
    ctx.waitUntil(promise);
    return;
  }

  void promise;
}

function withCacheStatus(response: Response, status: "HIT" | "MISS") {
  const headers = new Headers(response.headers);
  headers.set("x-clearfact-cache", status);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function apiCacheTtl(pathname: string) {
  if (pathname.startsWith("/api/wp/categories")) return 900;
  if (pathname.startsWith("/api/wp/tags")) return 900;
  if (pathname.startsWith("/api/wp/comments")) return 60;
  return 300;
}

async function proxyWordPressRequest(request: Request, ctx: ExecutionContextLike) {
  const incomingUrl = new URL(request.url);
  const restPath = incomingUrl.pathname.slice("/api/wp".length);

  if (!/^\/(?:posts|categories|tags|comments)(?:\/|$)/.test(restPath)) {
    return new Response("Not found", { status: 404 });
  }

  const method = request.method.toUpperCase();
  const cache = method === "GET" ? getDefaultCache() : undefined;

  if (cache) {
    const cached = await cache.match(request);

    if (cached) {
      return withCacheStatus(cached, "HIT");
    }
  }

  const originUrl = new URL(`${WP_REST_ORIGIN}${restPath}`);
  originUrl.search = incomingUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");

  headers.set("accept", "application/json");
  if (contentType) headers.set("content-type", contentType);

  const ttl = apiCacheTtl(incomingUrl.pathname);
  const init: CloudflareRequestInit = {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
  };

  if (method === "GET") {
    init.cf = {
      cacheEverything: true,
      cacheTtl: ttl,
    };
  }

  const originResponse = await fetch(originUrl, init);
  const responseHeaders = new Headers();

  responseHeaders.set(
    "content-type",
    originResponse.headers.get("content-type") ?? "application/json; charset=utf-8",
  );

  if (method === "GET" && originResponse.ok) {
    responseHeaders.set(
      "cache-control",
      `public, max-age=60, s-maxage=${ttl}, stale-while-revalidate=86400`,
    );
  } else {
    responseHeaders.set("cache-control", "no-store");
  }

  const response = new Response(originResponse.body, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: responseHeaders,
  });

  if (cache && originResponse.ok) {
    runInBackground(ctx, cache.put(request, response.clone()));
  }

  return withCacheStatus(response, "MISS");
}

async function proxyWordPressMedia(request: Request, ctx: ExecutionContextLike) {
  const incomingUrl = new URL(request.url);
  const encodedPath = incomingUrl.pathname.slice("/media/".length);

  let mediaPath = "";

  try {
    mediaPath = decodeURIComponent(encodedPath);
  } catch {
    return new Response("Invalid media path", { status: 400 });
  }

  if (!mediaPath || mediaPath.includes("..") || mediaPath.includes("\\")) {
    return new Response("Invalid media path", { status: 400 });
  }

  const cache = getDefaultCache();

  if (cache) {
    const cached = await cache.match(request);

    if (cached) {
      return withCacheStatus(cached, "HIT");
    }
  }

  const originUrl = new URL(mediaPath, WP_MEDIA_ORIGIN);
  originUrl.search = incomingUrl.search;

  const originResponse = await fetch(originUrl, {
    headers: {
      accept: request.headers.get("accept") ?? "image/avif,image/webp,image/*,*/*",
    },
    cf: {
      cacheEverything: true,
      cacheTtl: ONE_YEAR,
    },
  } as CloudflareRequestInit);

  const contentType = originResponse.headers.get("content-type") ?? "";

  if (!originResponse.ok || !contentType.startsWith("image/")) {
    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: {
        "content-type": contentType || "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const headers = new Headers();
  headers.set("content-type", contentType);
  headers.set("cache-control", `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`);

  for (const name of ["etag", "last-modified"]) {
    const value = originResponse.headers.get(name);
    if (value) headers.set(name, value);
  }

  const response = new Response(originResponse.body, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers,
  });

  if (cache) {
    runInBackground(ctx, cache.put(request, response.clone()));
  }

  return withCacheStatus(response, "MISS");
}

function pageCacheTtl(request: Request) {
  if (request.method !== "GET") return null;

  const url = new URL(request.url);
  const accept = request.headers.get("accept") ?? "";

  if (!accept.includes("text/html") || url.search) return null;
  if (request.headers.has("authorization") || request.headers.has("cookie")) {
    return null;
  }

  const privatePrefixes = ["/admin", "/auth", "/contributor", "/dashboard", "/login"];

  if (privatePrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
    return null;
  }

  if (url.pathname === "/") return 60;
  if (url.pathname.startsWith("/post/")) return 300;
  if (url.pathname.startsWith("/category/")) return 180;
  return 900;
}

async function servePage(request: Request, env: unknown, ctx: ExecutionContextLike) {
  const ttl = pageCacheTtl(request);
  const cache = ttl ? getDefaultCache() : undefined;

  if (cache) {
    const cached = await cache.match(request);

    if (cached) {
      return withCacheStatus(cached, "HIT");
    }
  }

  const handler = await getServerEntry();
  const rendered = await handler.fetch(request, env, ctx);
  const response = await normalizeCatastrophicSsrResponse(rendered);

  if (
    !cache ||
    !ttl ||
    !response.ok ||
    !response.headers.get("content-type")?.includes("text/html") ||
    response.headers.has("set-cookie")
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("cache-control", `public, max-age=0, s-maxage=${ttl}, stale-while-revalidate=86400`);

  const cacheableResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  runInBackground(ctx, cache.put(request, cacheableResponse.clone()));
  return withCacheStatus(cacheableResponse, "MISS");
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const executionContext = ctx as ExecutionContextLike;

      if (url.pathname.startsWith("/api/wp/")) {
        return await proxyWordPressRequest(request, executionContext);
      }

      if (url.pathname.startsWith("/media/")) {
        return await proxyWordPressMedia(request, executionContext);
      }

      return await servePage(request, env, executionContext);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
