import heroNews from "@/assets/hero-news.jpg";
import featLagos from "@/assets/feature-lagos.jpg";
import featAgric from "@/assets/feature-agric.jpg";
import featPolitics from "@/assets/feature-politics.jpg";
import featTech from "@/assets/feature-tech.jpg";
import featFact from "@/assets/feature-factcheck.jpg";

export type Verification = "Verified" | "Under Review" | "Developing" | "Fact-Checked" | "Opinion" | "Sponsored";
export type Confidence = "High" | "Medium" | "Preliminary";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  image: string;
  verification: Verification;
  confidence: Confidence;
  tags?: string[];
}

export const CATEGORIES = [
  { slug: "breaking-news", label: "Breaking" },
  { slug: "politics", label: "Politics" },
  { slug: "business", label: "Business" },
  { slug: "technology", label: "Technology" },
  { slug: "education", label: "Education" },
  { slug: "health", label: "Health" },
  { slug: "agriculture", label: "Agriculture" },
  { slug: "security", label: "Security" },
  { slug: "environment", label: "Environment" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "investigations", label: "Investigations" },
  { slug: "fact-check", label: "Fact Check" },
  { slug: "opinion", label: "Opinion" },
];

export const ARTICLES: Article[] = [
  {
    slug: "fec-approves-2026-federal-budget-framework",
    title: "FEC approves 2026 federal budget framework with focus on infrastructure and security",
    excerpt:
      "The Federal Executive Council endorsed a multi-trillion naira spending plan, prioritising road, rail and national security investments ahead of the National Assembly review.",
    category: "Politics",
    author: "Aisha Bello",
    publishedAt: "2026-05-08T07:30:00Z",
    updatedAt: "2026-05-08T08:10:00Z",
    readMinutes: 6,
    image: featPolitics,
    verification: "Verified",
    confidence: "High",
    tags: ["budget", "FEC", "policy"],
  },
  {
    slug: "naira-strengthens-against-dollar-cbn-reforms",
    title: "Naira strengthens against the dollar as CBN reforms take hold",
    excerpt:
      "Forex liquidity improves following a coordinated CBN intervention; analysts urge cautious optimism.",
    category: "Business",
    author: "Tunde Akinwale",
    publishedAt: "2026-05-08T06:00:00Z",
    readMinutes: 5,
    image: featLagos,
    verification: "Verified",
    confidence: "High",
    tags: ["naira", "CBN", "markets"],
  },
  {
    slug: "lagos-startups-raise-record-funding",
    title: "Lagos-based startups raise record funding in Q1 as African VC rebounds",
    excerpt:
      "Fintech and climate-tech ventures led the surge, signalling renewed investor appetite for African innovation.",
    category: "Technology",
    author: "Chiamaka Okeke",
    publishedAt: "2026-05-07T16:45:00Z",
    readMinutes: 7,
    image: featTech,
    verification: "Verified",
    confidence: "High",
    tags: ["startups", "VC", "fintech"],
  },
  {
    slug: "fact-check-viral-rice-import-ban",
    title: "FACT CHECK: Did the federal government ban all rice imports this week?",
    excerpt:
      "A viral WhatsApp message claims an outright ban took effect on Monday. Our review of official gazettes and CBN circulars finds the claim misleading.",
    category: "Fact Check",
    author: "ClearFact Verification Desk",
    publishedAt: "2026-05-07T14:20:00Z",
    readMinutes: 4,
    image: featFact,
    verification: "Fact-Checked",
    confidence: "High",
    tags: ["misinformation", "agriculture", "policy"],
  },
  {
    slug: "northeast-farmers-yield-up-25-percent",
    title: "Northeast farmers report 25% yield increase after dry-season irrigation rollout",
    excerpt:
      "Field reports from Adamawa and Borno suggest a turnaround for smallholder maize and rice producers.",
    category: "Agriculture",
    author: "Emmanuel S. Tijwun",
    publishedAt: "2026-05-07T10:00:00Z",
    readMinutes: 8,
    image: featAgric,
    verification: "Verified",
    confidence: "Medium",
    tags: ["agriculture", "Adamawa", "irrigation"],
  },
  {
    slug: "investigation-procurement-anomalies-ministry",
    title: "INVESTIGATION: Inside the procurement anomalies at a federal ministry",
    excerpt:
      "A six-month review of contract documents reveals patterns that raise serious questions about due process.",
    category: "Investigations",
    author: "ClearFact Investigations",
    publishedAt: "2026-05-06T09:15:00Z",
    readMinutes: 14,
    image: heroNews,
    verification: "Verified",
    confidence: "High",
    tags: ["investigation", "procurement", "accountability"],
  },
  {
    slug: "super-eagles-friendly-preview",
    title: "Super Eagles name strong squad ahead of international friendlies",
    excerpt: "Coach unveils 25-man list with three uncapped players in line for debuts.",
    category: "Sports",
    author: "Sports Desk",
    publishedAt: "2026-05-06T18:00:00Z",
    readMinutes: 3,
    image: heroNews,
    verification: "Verified",
    confidence: "High",
  },
  {
    slug: "developing-flooding-niger-state",
    title: "DEVELOPING: Heavy flooding displaces hundreds in Niger State communities",
    excerpt:
      "NEMA officials are on ground; ClearFact is verifying casualty figures with multiple independent sources.",
    category: "Security",
    author: "Field Reporter",
    publishedAt: "2026-05-08T05:00:00Z",
    readMinutes: 2,
    image: featAgric,
    verification: "Developing",
    confidence: "Preliminary",
    tags: ["flooding", "Niger", "NEMA"],
  },
];

export const HERO = ARTICLES[0];
export const TICKER = [
  "BREAKING: FEC approves 2026 budget framework",
  "MARKETS: Naira firms to N1,180/$ at the official window",
  "VERIFIED: Northeast farmers report 25% yield increase",
  "FACT-CHECK: Viral rice-import-ban claim rated MISLEADING",
  "DEVELOPING: Flooding displaces hundreds in Niger State",
];
