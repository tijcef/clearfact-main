export const SITE_ORIGIN = "https://clearfact.ng";
export const SITE_NAME = "ClearFact News";

export const ADSENSE_CLIENT = "ca-pub-8967021504063466";
export const ADSENSE_SLOT = "9755481370";

export function getClearFactAuthorBio(authorName: string) {
  return `${authorName} reports for ClearFact News, an independent Nigerian newsroom committed to verified, transparent and fact-based journalism.`;
}

export function isAdSupportedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/fact-check" ||
    pathname.startsWith("/post/") ||
    pathname.startsWith("/category/")
  );
}
