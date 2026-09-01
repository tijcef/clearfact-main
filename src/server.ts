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

const WP_REST_ORIGIN = "https://cms.clearfact.ng/wp-json/wp/v2";
const WP_MEDIA_ORIGIN = "https://cms.clearfact.ng/wp-content/uploads/";
const ONE_YEAR = 31_536_000;
const ONE_WEEK = 604_800;
const API_ORIGIN_TIMEOUT_MS = 12_000;
const COMMENT_WRITE_TIMEOUT_MS = 30_000;
const MEDIA_ORIGIN_TIMEOUT_MS = 8_000;

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

function withCacheStatus(response: Response, status: "HIT" | "MISS" | "STALE") {
  const headers = new Headers(response.headers);
  headers.set("x-clearfact-cache", status);
  headers.append("server-timing", `clearfact-cache;desc="${status}"`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withSecurityHeaders(response: Response, isHttps = true) {
  const headers = new Headers(response.headers);

  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");

  if (isHttps) {
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: CloudflareRequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function staleCacheKey(request: Request, namespace: "page" | "wp") {
  const url = new URL(request.url);
  url.searchParams.set("__clearfact_stale", namespace);

  return new Request(url.toString(), {
    method: "GET",
    headers: {
      accept: request.headers.get("accept") ?? "*/*",
    },
  });
}

async function getStaleResponse(
  cache: Cache | undefined,
  request: Request,
  namespace: "page" | "wp",
) {
  if (!cache) return undefined;

  const stale = await cache.match(staleCacheKey(request, namespace));
  return stale ? withCacheStatus(stale, "STALE") : undefined;
}

function cacheFreshAndStale(
  cache: Cache,
  request: Request,
  response: Response,
  namespace: "page" | "wp",
  ctx: ExecutionContextLike,
) {
  const staleHeaders = new Headers(response.headers);
  staleHeaders.set(
    "cache-control",
    `public, max-age=0, s-maxage=${ONE_WEEK}, stale-while-revalidate=${ONE_WEEK}`,
  );

  const staleResponse = new Response(response.clone().body, {
    status: response.status,
    statusText: response.statusText,
    headers: staleHeaders,
  });

  runInBackground(
    ctx,
    Promise.all([
      cache.put(request, response.clone()),
      cache.put(staleCacheKey(request, namespace), staleResponse),
    ]),
  );
}

function apiCacheTtl(pathname: string) {
  if (pathname.startsWith("/api/wp/categories")) return 300;
  if (pathname.startsWith("/api/wp/tags")) return 900;
  if (pathname.startsWith("/api/wp/users")) return 3600;
  if (pathname.startsWith("/api/wp/comments")) return 60;
  return 900;
}

async function proxyWordPressRequest(
  request: Request,
  ctx: ExecutionContextLike,
  serveStaleImmediately = true,
) {
  const incomingUrl = new URL(request.url);
  let restPath = incomingUrl.pathname.slice("/api/wp".length);

  // Keep older cached frontend bundles working while they still request
  // /api/wp/wp/v2/posts.
  if (restPath.startsWith("/wp/v2/")) {
    restPath = restPath.slice("/wp/v2".length);
  }

  if (!/^\/(?:posts|categories|tags|comments|users)(?:\/|$)/.test(restPath)) {
    return new Response("Not found", { status: 404 });
  }

  const method = request.method.toUpperCase();
  const cache = method === "GET" ? getDefaultCache() : undefined;
  const isCommentWrite = method === "POST" && restPath === "/comments";

  if (!["GET", "HEAD"].includes(method) && !isCommentWrite) {
    return new Response("Method not allowed", {
      status: 405,
      headers: { allow: restPath === "/comments" ? "GET, HEAD, POST" : "GET, HEAD" },
    });
  }

  if (cache) {
    const cached = await cache.match(request);

    if (cached) {
      return withCacheStatus(cached, "HIT");
    }

    if (serveStaleImmediately) {
      const stale = await getStaleResponse(cache, request, "wp");

      if (stale) {
        runInBackground(
          ctx,
          proxyWordPressRequest(request, ctx, false).then(() => undefined),
        );
        return stale;
      }
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

  let originResponse: Response;

  try {
    originResponse = await fetchWithTimeout(
      originUrl,
      init,
      isCommentWrite ? COMMENT_WRITE_TIMEOUT_MS : API_ORIGIN_TIMEOUT_MS,
    );
  } catch (error) {
    console.error("WordPress origin request failed:", error);

    const stale = await getStaleResponse(cache, request, "wp");
    if (stale) return stale;

    return new Response(
      JSON.stringify({
        code: "clearfact_wordpress_unavailable",
        message: "The newsroom feed is temporarily unavailable.",
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "retry-after": "30",
        },
      },
    );
  }

  if (originResponse.status >= 500) {
    const stale = await getStaleResponse(cache, request, "wp");
    if (stale) return stale;
  }

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

  let responseBody: ArrayBuffer | null = null;

  try {
    responseBody = method === "HEAD" ? null : await originResponse.arrayBuffer();
  } catch (error) {
    console.error("WordPress origin response was interrupted:", error);

    const stale = await getStaleResponse(cache, request, "wp");
    if (stale) return stale;

    return new Response(
      JSON.stringify({
        code: "clearfact_wordpress_interrupted",
        message: "The newsroom feed is temporarily unavailable.",
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "retry-after": "15",
        },
      },
    );
  }

  // Buffer the small JSON payload before cloning it into the two edge-cache
  // entries. Cloning the live WordPress stream can apply backpressure and
  // leave mobile article requests stalled after only a partial response.
  const response = new Response(responseBody, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: responseHeaders,
  });

  if (cache && originResponse.ok) {
    cacheFreshAndStale(cache, request, response, "wp", ctx);
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

  let originResponse: Response;

  try {
    originResponse = await fetchWithTimeout(
      originUrl,
      {
        headers: {
          accept: request.headers.get("accept") ?? "image/avif,image/webp,image/*,*/*",
        },
        cf: {
          cacheEverything: true,
          cacheTtl: ONE_YEAR,
        },
      },
      MEDIA_ORIGIN_TIMEOUT_MS,
    );
  } catch (error) {
    console.error("WordPress media origin request failed:", error);

    return new Response("Image temporarily unavailable", {
      status: 503,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "retry-after": "30",
      },
    });
  }

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

  if (url.pathname === "/") return 600;
  if (url.pathname.startsWith("/post/")) return 120;
  if (url.pathname.startsWith("/category/")) return 120;
  return 900;
}

function canServeStaleBeforeOrigin(request: Request) {
  const pathname = new URL(request.url).pathname;

  // A deleted story or taxonomy term must be allowed to reach its real 404
  // promptly instead of being hidden behind a week-old stale 200 response.
  return !pathname.startsWith("/post/") && !pathname.startsWith("/category/");
}

async function servePage(
  request: Request,
  env: unknown,
  ctx: ExecutionContextLike,
  serveStaleImmediately = true,
) {
  const ttl = pageCacheTtl(request);
  const cache = ttl ? getDefaultCache() : undefined;

  if (cache) {
    const cached = await cache.match(request);

    if (cached) {
      return withCacheStatus(cached, "HIT");
    }

    if (serveStaleImmediately && canServeStaleBeforeOrigin(request)) {
      const stale = await getStaleResponse(cache, request, "page");

      if (stale) {
        runInBackground(
          ctx,
          servePage(request, env, ctx, false).then(() => undefined),
        );
        return stale;
      }
    }
  }

  let response: Response;

  try {
    const handler = await getServerEntry();
    const rendered = await handler.fetch(request, env, ctx);
    response = await normalizeCatastrophicSsrResponse(rendered);
  } catch (error) {
    console.error("Page render failed:", error);

    const stale = await getStaleResponse(cache, request, "page");
    if (stale) return stale;

    throw error;
  }

  if (response.status >= 500) {
    const stale = await getStaleResponse(cache, request, "page");
    if (stale) return stale;
  }

  if (response.status === 404 || response.status === 410) {
    if (cache) {
      runInBackground(ctx, cache.delete(staleCacheKey(request, "page")));
    }

    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

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

  cacheFreshAndStale(cache, request, cacheableResponse, "page", ctx);
  return withCacheStatus(cacheableResponse, "MISS");
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    try {
      if (url.hostname === "www.clearfact.ng") {
        url.hostname = "clearfact.ng";
        return withSecurityHeaders(Response.redirect(url.toString(), 301), true);
      }

      const executionContext = ctx as ExecutionContextLike;
      let response: Response;

      if (url.pathname === "/api/health") {
        response = new Response(
          JSON.stringify({
            status: "ok",
            service: "clearfact-edge",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      } else if (url.pathname.startsWith("/api/wp/")) {
        response = await proxyWordPressRequest(request, executionContext);
      } else if (url.pathname.startsWith("/media/")) {
        response = await proxyWordPressMedia(request, executionContext);
      } else {
        response = await servePage(request, env, executionContext);
      }

      return withSecurityHeaders(response, url.protocol === "https:");
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(brandedErrorResponse(), url.protocol === "https:");
    }
  },
};
