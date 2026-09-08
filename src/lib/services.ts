export type Publication = {
  id: number;
  title: string;
  description: string;
  author: string;
  edition: string;
  price: string;
  cover: string;
  url: string;
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
    return u.protocol === "https:" ? u.href : "";
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
