/** Narrow same-origin bridge. Never forwards browser cookies or exposes the shared secret. */
export async function proxyServices(request: Request, environment: unknown): Promise<Response> {
  const env = environment as { CLEARFACT_SERVICES_SECRET?: string };
  const url = new URL(request.url);
  const endpoint = url.pathname.slice("/api/services/".length);
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow",
  };
  const fail = (status: number, message: string) =>
    new Response(JSON.stringify({ message }), { status, headers });
  if (!["config", "catalogue", "requests"].includes(endpoint)) return fail(404, "Not found.");
  const isWrite = endpoint === "requests";
  if (request.method !== (isWrite ? "POST" : "GET")) return fail(405, "Method not allowed.");
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
      const maxSize = incomingContentType.startsWith("multipart/form-data;") ? 6 * 1024 * 1024 : 24000;
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
  const upstream = new URL(`https://cms.clearfact.ng/wp-json/clearfact-services/v1/${endpoint}`);
  if (endpoint === "catalogue") {
    const kind = url.searchParams.get("kind");
    if (!["books", "eprint"].includes(kind || "")) return fail(400, "Invalid catalogue.");
    upstream.searchParams.set("kind", kind!);
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
      },
      signal: AbortSignal.timeout(25000),
    });
    if (!response.headers.get("content-type")?.includes("application/json"))
      return fail(
        503,
        "This service is temporarily unavailable. Please contact ClearFact by email.",
      );
    const data = (await response.json()) as Record<string, unknown>;
    if (endpoint === "config" && response.ok) data.ready = data.accepting_requests === true;
    return new Response(JSON.stringify(data), { status: response.status, headers });
  } catch {
    return fail(
      503,
      "We could not confirm your request. Please retry using this form; the same request will not be saved twice.",
    );
  }
}
