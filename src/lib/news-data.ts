/**
 * Shared display types for Supabase-backed newsroom components. Published
 * stories are never declared here; public article content comes exclusively
 * from the live WordPress newsroom.
 */
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
  | "Profile"
  | "Interview"
  | "Explainer"
  | "Special Report"
  | "Top Story"
  | "Featured"
  | "Trending"
  | "Editor's Pick"
  | "Most Read"
  | "Video Post";

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
  acf?: {
    verification_status?: Verification;
  };
  contentFormat?: ContentFormat;
  videoDuration?: string;
  body?: string;
  confidence: Confidence;
  tags?: string[];
}
