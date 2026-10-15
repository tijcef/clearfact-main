/** Only accepted YouTube hosts and video IDs can produce an iframe. */
export function parseYouTube(value = "") {
  try {
    const url = new URL(value.replace(/&amp;/g, "&").trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    let id: string | null = null;
    let portrait = false;
    if (host === "youtu.be") id = parts[0];
    else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      if (["shorts", "embed", "live"].includes(parts[0])) {
        id = parts[1];
        portrait = parts[0] === "shorts";
      } else if (url.pathname === "/watch") id = url.searchParams.get("v");
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? { id, portrait } : null;
  } catch {
    return null;
  }
}

function player(video: { id: string; portrait: boolean }) {
  return `<div class="clearfact-video${video.portrait ? " clearfact-video-portrait" : ""}"><iframe title="ClearFact News Video" src="https://www.youtube.com/embed/${video.id}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><p><a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p></div>`;
}

/** Runs identically during server rendering and in the browser. */
export function prepareYouTubeContent(html: string, featuredUrl = "") {
  const seen = new Set<string>();
  let content = html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (tag) => {
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const video = parseYouTube(src);
    if (!video) return tag;
    const width = Number(tag.match(/\bwidth=["'](\d+)["']/i)?.[1]);
    const height = Number(tag.match(/\bheight=["'](\d+)["']/i)?.[1]);
    video.portrait = video.portrait || (width > 0 && height > width);
    seen.add(video.id);
    return player(video);
  });
  // WordPress can return a bare URL inside its embed wrapper in headless responses.
  content = content.replace(
    /(<(?:p|div)\b[^>]*>)\s*(?:<a\b[^>]*>)?(https?:\/\/[^\s<>]+?)(?:<\/a>)?\s*(<\/(?:p|div)>)/gi,
    (match, open, url, close) => {
      const video = parseYouTube(url);
      if (!video) return match;
      seen.add(video.id);
      return `${open}${player(video)}${close}`.replace(/^<p\b[^>]*>([\s\S]*)<\/p>$/i, "$1");
    },
  );
  // An iframe pasted into a paragraph must not leave a block element inside <p>.
  content = content.replace(
    /<p\b[^>]*>\s*(<div class="clearfact-video[^"<]*">[\s\S]*?<\/div>)\s*<\/p>/gi,
    "$1",
  );
  const featured = parseYouTube(featuredUrl);
  if (featured && !seen.has(featured.id)) content = player(featured) + content;
  return content;
}
