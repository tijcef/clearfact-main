export const SITE_ORIGIN = "https://clearfact.ng";
export const SITE_NAME = "ClearFact News";

export const ADSENSE_CLIENT = "ca-pub-8967021504063466";
export const ADSENSE_SLOT = "9755481370";

const AUTHOR_BIOS: Record<string, string> = {
  "emmanuel sunday tijwun":
    "Emmanuel Sunday Tijwun is the founder and publisher of ClearFact News. His reporting and research interests include governance, development, technology, education, health and public affairs, with particular attention to communities in Northeast Nigeria.",
};

export function hasCuratedAuthorBio(authorName: string) {
  return Boolean(AUTHOR_BIOS[authorName.trim().toLowerCase()]);
}

export function getClearFactAuthorBio(authorName: string) {
  const key = authorName.trim().toLowerCase();

  return (
    AUTHOR_BIOS[key] ||
    `${authorName} reports for ClearFact News, an independent Nigerian newsroom committed to verified, transparent and fact-based journalism. ClearFact publishes its editorial standards, correction process and source-transparency practices for reader review.`
  );
}
