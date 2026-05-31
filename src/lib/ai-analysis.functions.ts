import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const analysisSchema = z.object({
  trust_score: z.number().min(0).max(100).describe("Overall editorial trust score"),
  clickbait_score: z.number().min(0).max(100).describe("0=neutral, 100=extreme clickbait"),
  hate_speech_risk: z.enum(["none", "low", "medium", "high"]),
  propaganda_risk: z.enum(["none", "low", "medium", "high"]),
  fake_news_indicators: z.array(z.string()).describe("Specific signals of misinformation"),
  duplicate_risk: z.enum(["none", "low", "medium", "high"]).describe("Risk of duplicating recent coverage based on the title"),
  emotional_manipulation: z.array(z.string()).describe("Emotional or sensational phrases detected"),
  unverified_claims: z.array(z.string()).describe("Specific claims that need a cited source"),
  headline_alternatives: z.array(z.string()).describe("3 professional, neutral headline rewrites"),
  summary: z.string().describe("Two-sentence editorial verdict"),
});

export type ArticleAnalysis = z.infer<typeof analysisSchema>;

export const analyzeArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ title: z.string().min(3), body: z.string().default(""), excerpt: z.string().default("") }).parse(data),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: analysisSchema }),
      system:
        "You are ClearFact News' editorial integrity engine. Audit drafts for clickbait, emotional manipulation, hate speech, tribal incitement, propaganda, plagiarism risk, duplicate coverage and unverified claims. Reply ONLY via the structured schema. Be strict, neutral, evidence-based.",
      prompt: `TITLE: ${data.title}\n\nEXCERPT: ${data.excerpt}\n\nBODY:\n${data.body.slice(0, 8000)}`,
    });

    return experimental_output as ArticleAnalysis;
  });
