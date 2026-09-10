type ServicesEnvironment = {
  CLEARFACT_SERVICES_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
};

type SupabaseUser = { email?: string | null; email_confirmed_at?: string | null };

const PUBLIC_BOOK_KINDS = new Set(["cover", "sample"]);

function publicBookAssetUrl(origin: string, productId: number, kind: string) {
  return `${origin}/api/services/book-asset?product=${productId}&kind=${kind}`;
}

function isCmsUrl(value: unknown) {
  if (typeof value !== "string" || !value) return false;

  try {
    const url = new URL(value);
    return (
      ["cms.clearfact.ng", "www.cms.clearfact.ng"].includes(url.hostname) ||
      url.pathname.includes("/wp-admin") ||
      url.pathname.includes("admin-post.php") ||
      url.pathname.includes("wp-login.php")
    );
  } catch {
    return false;
  }
}

function sanitizeCatalogue(data: unknown, kind: string, origin: string) {
  if (!Array.isArray(data)) return data;

  return data.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;

    const item = { ...(entry as Record<string, unknown>) };
    const productId = Number(item.id);
    const isBookStoreItem = kind === "books" && Number.isSafeInteger(productId) && productId > 0;

    if (isBookStoreItem) {
      // The browser gets same-origin URLs. The Worker fetches approved assets
      // from WordPress with the server-only secret.
      item.cover = publicBookAssetUrl(origin, productId, "cover");
      item.sample = publicBookAssetUrl(origin, productId, "sample");
      item.url = `${origin}/books/buy?product=${productId}`;
      item.store = true;
      item.purchase_ready = item.purchase_ready === true;
    } else {
      for (const key of ["cover", "sample", "url"]) {
        if (isCmsUrl(item[key])) item[key] = "";
      }
    }

    return item;
  });
}

/** Narrow same-origin bridge. Never forwards browser cookies or exposes the shared secret. */
export async function proxyServices(request: Request, environment: unknown): Promise<Response> {
  const env = environment as ServicesEnvironment;
  const url = new URL(request.url);
  const endpoint = url.pathname.slice("/api/services/".length);
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow",
  };
  const fail = (status: number, message: string) =>
    new Response(JSON.stringify({ message }), { status, headers });
  if (!["config", "catalogue", "requests", "books", "book-asset"].includes(endpoint)) {
    return fail(404, "Not found.");
  }

  if (endpoint === "book-asset") {
    if (!PUBLIC_BOOK_KINDS.has(url.searchParams.get("kind") || "")) {
      return fail(400, "Invalid book asset.");
    }

    const productId = Number(url.searchParams.get("product"));
    if (!Number.isSafeInteger(productId) || productId < 1) {
      return fail(400, "Invalid book asset.");
    }

    if (!env.CLEARFACT_SERVICES_SECRET) {
      return fail(503, "The book service is not configured yet.");
    }

    const upstream = new URL("https://cms.clearfact.ng/wp-json/clearfact-books/v1/public-asset");
    upstream.searchParams.set("product", String(productId));
    upstream.searchParams.set("kind", url.searchParams.get("kind")!);

    try {
      const descriptorResponse = await fetch(upstream, {
        method: request.method === "HEAD" ? "GET" : request.method,
        headers: {
          accept: "image/avif,image/webp,image/*,application/pdf;q=0.9,*/*;q=0.1",
          "x-clearfact-secret": env.CLEARFACT_SERVICES_SECRET,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!descriptorResponse.ok) {
        return new Response(null, {
          status: descriptorResponse.status === 404 ? 404 : 503,
          headers: {
            "cache-control": "no-store",
            "x-robots-tag": "noindex, nofollow",
          },
        });
      }

      const descriptor = (await descriptorResponse.json()) as { url?: unknown };
      if (typeof descriptor.url !== "string") return fail(503, "The book asset is unavailable.");

      const assetUrl = new URL(descriptor.url);
      if (
        assetUrl.hostname !== "cms.clearfact.ng" ||
        !assetUrl.pathname.endsWith("/wp-admin/admin-post.php")
      ) {
        return fail(503, "The book asset is unavailable.");
      }

      const response = await fetch(assetUrl, {
        method: request.method,
        headers: {
          accept: "image/avif,image/webp,image/*,application/pdf;q=0.9,*/*;q=0.1",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return new Response(null, {
          status: response.status === 404 ? 404 : 503,
          headers: {
            "cache-control": "no-store",
            "x-robots-tag": "noindex, nofollow",
          },
        });
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/") && contentType !== "application/pdf") {
        return fail(503, "The book asset is unavailable.");
      }

      const assetHeaders = new Headers({
        "content-type": contentType,
        "cache-control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400",
        "x-robots-tag": "noindex, nofollow",
        "x-content-type-options": "nosniff",
      });
      const length = response.headers.get("content-length");
      if (length) assetHeaders.set("content-length", length);

      return new Response(request.method === "HEAD" ? null : response.body, {
        status: 200,
        headers: assetHeaders,
      });
    } catch {
      return fail(503, "The book asset is temporarily unavailable.");
    }
  }

  const isBooks = endpoint === "books";
  const isWrite = endpoint === "requests" || (isBooks && request.method === "POST");
  if (isBooks && !["GET", "POST"].includes(request.method)) {
    return fail(405, "Method not allowed.");
  }
  if (!isBooks && request.method !== (isWrite ? "POST" : "GET")) {
    return fail(405, "Method not allowed.");
  }

  let supabaseUser: SupabaseUser | undefined;
  if (isBooks) {
    const authorization = request.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return fail(401, "Sign in to use the author centre.");
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
      return fail(503, "The author service is not configured yet.");
    }
    try {
      const authResponse = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
        headers: {
          accept: "application/json",
          apikey: env.SUPABASE_PUBLISHABLE_KEY,
          authorization,
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!authResponse.ok) return fail(401, "Your session has expired. Please sign in again.");
      supabaseUser = (await authResponse.json()) as SupabaseUser;
      if (!supabaseUser.email) return fail(403, "A verified account email is required.");
      if (supabaseUser.email_confirmed_at === null) {
        return fail(403, "Confirm your account email before submitting a book.");
      }
    } catch {
      return fail(503, "We could not verify your session. Please retry.");
    }
  }

  let body: ArrayBuffer | undefined;
  let incomingContentType = "";
  if (isWrite) {
    if (request.headers.get("origin") !== url.origin)
      return fail(403, "Please submit through the ClearFact website.");
    incomingContentType = request.headers.get("content-type") || "";
    if (!incomingContentType.startsWith("application/json") && !incomingContentType.startsWith("multipart/form-data;"))
      return fail(415, "Use the website form to submit this request.");
    const reader = request.body?.getReader();
    if (!reader) return fail(400, "Request body required.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      const maxSize =
        endpoint === "books"
          ? 28 * 1024 * 1024
          : incomingContentType.startsWith("multipart/form-data;")
            ? 6 * 1024 * 1024
            : 24000;
      if (size > maxSize) {
        await reader.cancel();
        return fail(413, "Your request is too large. Please shorten the brief.");
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    body = bytes.buffer;
    if (incomingContentType.startsWith("application/json")) {
      try { JSON.parse(new TextDecoder().decode(bytes)); } catch { return fail(400, "Invalid request."); }
    }
  }
  const upstream = new URL(
    `https://cms.clearfact.ng/wp-json/${isBooks ? "clearfact-books/v1" : "clearfact-services/v1"}/${isBooks ? (request.method === "GET" ? "author" : "submissions") : endpoint}`,
  );
  if (endpoint === "catalogue") {
    const kind = url.searchParams.get("kind");
    if (!["books", "eprint"].includes(kind || "")) return fail(400, "Invalid catalogue.");
    upstream.searchParams.set("kind", kind!);
  }
  if (isBooks && request.method === "GET") {
    upstream.searchParams.set("email", supabaseUser?.email ?? "");
  }
  try {
    const response = await fetch(upstream, {
      method: request.method,
      body,
      headers: {
        accept: "application/json",
        ...(endpoint === "config" && env.CLEARFACT_SERVICES_SECRET
          ? { "x-clearfact-secret": env.CLEARFACT_SERVICES_SECRET }
          : {}),
        ...(isWrite
          ? {
              "content-type": incomingContentType,
              ...(env.CLEARFACT_SERVICES_SECRET
                ? { "x-clearfact-secret": env.CLEARFACT_SERVICES_SECRET }
                : {}),
              "x-clearfact-client": request.headers.get("cf-connecting-ip") || "unknown",
            }
          : {}),
        ...(isBooks
          ? {
              "x-clearfact-secret": env.CLEARFACT_SERVICES_SECRET || "",
              "x-clearfact-author-email": supabaseUser?.email || "",
              ...(request.headers.get("x-clearfact-author-name")
                ? { "x-clearfact-author-name": request.headers.get("x-clearfact-author-name")! }
                : {}),
            }
          : {}),
      },
      signal: AbortSignal.timeout(25000),
    });
    if (!response.headers.get("content-type")?.includes("application/json"))
      return fail(
        503,
        "This service is temporarily unavailable. Please contact ClearFact by email.",
      );
    let data: unknown = await response.json();
    if (endpoint === "catalogue" && response.ok) {
      data = sanitizeCatalogue(data, url.searchParams.get("kind") || "", url.origin);
    }
    if (endpoint === "config" && response.ok && data && typeof data === "object" && !Array.isArray(data)) {
      const config = data as Record<string, unknown>;
      config.ready = config.accepting_requests === true;
    }
    return new Response(JSON.stringify(data), { status: response.status, headers });
  } catch {
    return fail(
      503,
      "We could not confirm your request. Please retry using this form; the same request will not be saved twice.",
    );
  }
}
