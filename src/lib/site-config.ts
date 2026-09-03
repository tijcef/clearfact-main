export const SITE_ORIGIN = "https://clearfact.ng";
export const SITE_NAME = "ClearFact News";

export const ADSENSE_CLIENT = "ca-pub-8967021504063466";
export const ADSENSE_SLOT = "9755481370";

export function getClearFactAuthorBio(authorName: string) {
  const normalizedName = authorName.trim().toLowerCase();

  const authorBios: Record<string, string> = {
    "emmanuel sunday tijwun":
      "Emmanuel Sunday Tijwun is the Founder and Publisher of ClearFact News, a researcher, geospatial professional and social impact leader committed to verified, evidence-driven and public-interest journalism.",
  };

  return (
    authorBios[normalizedName] ||
    `${authorName} reports for ClearFact News, an independent Nigerian newsroom committed to verified, transparent and public-interest journalism.`
  );
}

export function isAdSupportedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/fact-check" ||
    pathname.startsWith("/post/") ||
    pathname.startsWith("/category/")
  );
}