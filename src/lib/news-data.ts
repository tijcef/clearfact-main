import heroNews from "@/assets/hero-news.jpg";
import featLagos from "@/assets/feature-lagos.jpg";
import featAgric from "@/assets/feature-agric.jpg";
import featPolitics from "@/assets/feature-politics.jpg";
import featTech from "@/assets/feature-tech.jpg";
import featFact from "@/assets/feature-factcheck.jpg";

export type Verification =
  | "Verified"
  | "Under Review"
  | "Developing"
  | "Fact-Checked"
  | "Opinion"
  | "Sponsored";

export type ContentFormat =
  | "Article"
  | "Feature"
  | "Top Story"
  | "Featured"
  | "Trending"
  | "Editor's Pick"
  | "Most Read"
  | "Video Post";

export type Confidence =
  | "High"
  | "Medium"
  | "Preliminary";

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
  contentFormat?: ContentFormat;
  videoDuration?: string;
  body?: string;

  confidence: Confidence;
  tags?: string[];
}

export const CATEGORIES = [
  { slug: "breaking", label: "Breaking" },
  { slug: "politics", label: "Politics" },
  { slug: "business", label: "Business" },
  { slug: "technology", label: "Technology" },
  { slug: "education", label: "Education" },
  { slug: "health", label: "Health" },
  { slug: "security", label: "Security" },
  { slug: "fact-check", label: "Fact Check" },
  { slug: "investigations", label: "Investigations" },
  { slug: "opportunities", label: "Opportunities" },
  { slug: "world", label: "World" },
];

export const MORE_CATEGORIES = [
  { slug: "metro", label: "Metro" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "opinion", label: "Opinion" },
  { slug: "climate-environment", label: "Climate & Environment" },
  { slug: "data-research", label: "Data & Research" },
  { slug: "video", label: "Video" },
];

export const ARTICLES: Article[] = [
  {
    slug: "fec-approves-2026-federal-budget-framework",

    title:
      "FEC approves 2026 federal budget framework with focus on infrastructure and security",

    excerpt:
      "The Federal Executive Council endorsed a multi-trillion naira spending plan, prioritising road, rail and national security investments ahead of the National Assembly review.",

    category: "Politics",

    author: "Aisha Bello",

    publishedAt: "2026-05-08T07:30:00Z",

    updatedAt: "2026-05-08T08:10:00Z",

    readMinutes: 6,

    image: featPolitics,

    verification: "Verified",

    contentFormat: "Top Story",

    body:
      "The Federal Executive Council approved the 2026 budget framework during a high-level meeting in Abuja. Officials say the proposal focuses heavily on national infrastructure, transport expansion and improved security funding across the federation.",

    confidence: "High",

    tags: ["budget", "FEC", "policy"],
  },

  {
    slug: "naira-strengthens-against-dollar-cbn-reforms",

    title:
      "Naira strengthens against the dollar as CBN reforms take hold",

    excerpt:
      "Forex liquidity improves following a coordinated CBN intervention; analysts urge cautious optimism.",

    category: "Business",

    author: "Tunde Akinwale",

    publishedAt: "2026-05-08T06:00:00Z",

    readMinutes: 5,

    image: featLagos,

    verification: "Verified",

    contentFormat: "Featured",

    body:
      "Financial analysts say recent Central Bank reforms are beginning to stabilise the foreign exchange market as liquidity gradually improves.",

    confidence: "High",

    tags: ["naira", "CBN", "markets"],
  },

  {
    slug: "lagos-startups-raise-record-funding",

    title:
      "Lagos-based startups raise record funding in Q1 as African VC rebounds",

    excerpt:
      "Fintech and climate-tech ventures led the surge, signalling renewed investor appetite for African innovation.",

    category: "Technology",

    author: "Chiamaka Okeke",

    publishedAt: "2026-05-07T16:45:00Z",

    readMinutes: 7,

    image: featTech,

    verification: "Verified",

    contentFormat: "Trending",

    body:
      "Technology startups across Lagos recorded increased venture capital investment during the first quarter of the year.",

    confidence: "High",

    tags: ["startups", "VC", "fintech"],
  },

  {
    slug: "fact-check-viral-rice-import-ban",

    title:
      "FACT CHECK: Did the federal government ban all rice imports this week?",

    excerpt:
      "A viral WhatsApp message claims an outright ban took effect on Monday. Our review of official gazettes and CBN circulars finds the claim misleading.",

    category: "Fact Check",

    author: "ClearFact Verification Desk",

    publishedAt: "2026-05-07T14:20:00Z",

    readMinutes: 4,

    image: featFact,

    verification: "Fact-Checked",

    contentFormat: "Article",

    body:
      "ClearFact reviewed multiple government publications and found no evidence supporting claims of a total rice import ban.",

    confidence: "High",

    tags: ["misinformation", "agriculture", "policy"],
  },

  {
    slug: "super-eagles-friendly-preview",

    title:
      "Super Eagles name strong squad ahead of international friendlies",

    excerpt:
      "Coach unveils 25-man list with three uncapped players in line for debuts.",

    category: "Sports",

    author: "Sports Desk",

    publishedAt: "2026-05-06T18:00:00Z",

    readMinutes: 3,

    image: heroNews,

    verification: "Verified",

    contentFormat: "Most Read",

    body:
      "The Nigerian national team has released a strong squad list ahead of upcoming international fixtures.",

    confidence: "High",
  },

  {
    slug: "developing-flooding-niger-state",

    title:
      "DEVELOPING: Heavy flooding displaces hundreds in Niger State communities",

    excerpt:
      "NEMA officials are on ground; ClearFact is verifying casualty figures with multiple independent sources.",

    category: "Security",

    author: "Field Reporter",

    publishedAt: "2026-05-08T05:00:00Z",

    readMinutes: 2,

    image: featAgric,

    verification: "Developing",

    contentFormat: "Top Story",

    body:
      "Emergency officials say rescue efforts are ongoing after severe flooding affected several communities in Niger State.",

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