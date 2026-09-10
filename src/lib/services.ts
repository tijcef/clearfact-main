export type Publication = {
  id: number;
  title: string;
  description: string;
  author: string;
  edition: string;
  price: string;
  cover: string;
  url: string;
  sample?: string;
  store?: boolean;
  purchase_ready?: boolean;
};

export type ServiceConfig = {
  bank: string;
  account_name: string;
  account_number: string;
  payment_url: string;
  instructions: string;
  ready?: boolean;
};
export function serviceHead(title: string, path: string, description: string, index = false) {
  return {
    meta: [
      { title: `${title} | ClearFact News` },
      { name: "description", content: description },
      { name: "robots", content: index ? "index, follow" : "noindex, follow" },
      { property: "og:title", content: title },
      { property: "og:url", content: `https://clearfact.ng${path}` },
    ],
    links: [{ rel: "canonical", href: `https://clearfact.ng${path}` }],
  };
}
export function safeExternalUrl(value: string) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return "";

    // The CMS is a server-side origin. A catalogue response must never turn
    // it into a browser destination, even if an older WordPress record still
    // contains a legacy product, media or admin URL.
    if (
      ["cms.clearfact.ng", "www.cms.clearfact.ng"].includes(u.hostname) ||
      u.pathname.includes("/wp-admin") ||
      u.pathname.includes("admin-post.php") ||
      u.pathname.includes("wp-login.php")
    ) {
      return "";
    }

    return u.href;
  } catch {
    return "";
  }
}
export async function getServiceData<T>(path: string): Promise<T> {
  const response = await fetch(`/api/services/${path}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      "This service is temporarily unavailable. Please contact ads@clearfact.ng for advertising or info@clearfact.ng for other enquiries.",
    );
  return data as T;
}
