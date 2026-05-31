import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const screenSchema = z.object({
  trust_score: z.number().min(0).max(100),
  fake_news_risk: z.enum(["none", "low", "medium", "high"]),
  hate_speech_risk: z.enum(["none", "low", "medium", "high"]),
  spam_risk: z.enum(["none", "low", "medium", "high"]),
  plagiarism_score: z.number().min(0).max(100).describe("Estimated probability the text is recycled or paraphrased from public sources"),
  duplicate_risk: z.enum(["none", "low", "medium", "high"]).describe("Risk that the same story has been recently covered"),
  red_flags: z.array(z.string()),
  verdict: z.enum(["approve", "review", "reject"]),
  summary: z.string(),
});

export type SubmissionScreening = z.infer<typeof screenSchema>;

export const screenSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      submissionId: z.string().uuid(),
      title: z.string().min(3),
      body: z.string().default(""),
      excerpt: z.string().default(""),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    // Duplicate detection: search for existing published articles or pending submissions with similar title
    const { supabase } = context as { supabase: import("@supabase/supabase-js").SupabaseClient };
    const titleStem = data.title.trim().slice(0, 60);
    const { data: dupes } = await supabase
      .from("contributor_submissions")
      .select("id,title")
      .neq("id", data.submissionId)
      .ilike("title", `%${titleStem}%`)
      .limit(3);

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: screenSchema }),
      system:
        "You are ClearFact News' contributor screening engine. Score user-submitted citizen journalism for fake news, hate speech, tribal incitement, spam, plagiarism risk and duplicate coverage. Be strict. Reply only via the structured schema.",
      prompt: `TITLE: ${data.title}\n\nEXCERPT: ${data.excerpt}\n\nBODY:\n${data.body.slice(0, 8000)}\n\nNEAR-TITLE MATCHES IN DATABASE: ${(dupes ?? []).map((d) => d.title).join(" | ") || "none"}`,
    });

    const result = experimental_output as SubmissionScreening;

    // Persist back onto submission
    const newStatus = result.verdict === "reject" ? "rejected" : "editor_review";
    await supabase
      .from("contributor_submissions")
      .update({
        ai_analysis: result as unknown as Record<string, unknown>,
        plagiarism_score: result.plagiarism_score,
        status: newStatus,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", data.submissionId);

    return result;
  });

const decisionSchema = z.object({
  submissionId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  feedback: z.string().optional(),
  payoutKobo: z.number().int().min(0).max(10_000_000).optional(),
});

export const decideSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => decisionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };

    const { data: sub, error } = await supabase
      .from("contributor_submissions")
      .select("*")
      .eq("id", data.submissionId)
      .single();
    if (error || !sub) throw new Error("Submission not found");

    if (data.decision === "reject") {
      await supabase.from("contributor_submissions").update({
        status: "rejected",
        editor_feedback: data.feedback ?? null,
        reviewer_id: userId,
        reviewed_at: new Date().toISOString(),
      }).eq("id", sub.id);

      const { data: prof } = await supabase.from("contributor_profiles").select("rejected_count,trust_score").eq("user_id", sub.contributor_id).maybeSingle();
      if (prof) {
        await supabase.from("contributor_profiles").update({
          rejected_count: (prof.rejected_count ?? 0) + 1,
          trust_score: Math.max(0, (prof.trust_score ?? 50) - 3),
        }).eq("user_id", sub.contributor_id);
      }

      await supabase.from("notifications").insert({
        user_id: sub.contributor_id,
        kind: "submission_rejected",
        title: `Submission rejected: ${sub.title}`,
        body: data.feedback ?? "An editor has reviewed your submission and could not approve it at this time.",
        link: "/contributor/submissions",
      });

      return { ok: true, status: "rejected" as const };
    }

    // Approve → create published article from submission
    const slugBase = sub.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
    const slug = `${slugBase}-${sub.id.slice(0, 6)}`;

    const { data: art, error: artErr } = await supabase.from("articles").insert({
      slug,
      title: sub.title,
      excerpt: sub.excerpt,
      body: sub.body,
      category: sub.category,
      tags: sub.tags,
      cover_image: sub.cover_image,
      author_id: sub.contributor_id,
      author_name: "Contributor",
      status: "published",
      published_at: new Date().toISOString(),
      verification: "Fact-Checked",
      confidence: "Medium",
      sources: sub.sources,
      trust_score: Math.min(95, 60 + Math.round((100 - (sub.plagiarism_score ?? 30)) / 5)),
    }).select("id,slug").single();
    if (artErr || !art) throw new Error(artErr?.message ?? "Failed to publish");

    await supabase.from("contributor_submissions").update({
      status: "published",
      editor_feedback: data.feedback ?? null,
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
      published_article_id: art.id,
    }).eq("id", sub.id);

    // Wallet credit
    const payout = data.payoutKobo ?? 250000; // default ₦2,500
    if (payout > 0) {
      await supabase.from("wallet_ledger").insert({
        contributor_id: sub.contributor_id,
        kind: "earning",
        amount_kobo: payout,
        submission_id: sub.id,
        note: `Story payout: ${sub.title}`,
        created_by: userId,
      });

      const { data: prof } = await supabase.from("contributor_profiles").select("wallet_balance_kobo,accepted_count,trust_score,tier").eq("user_id", sub.contributor_id).maybeSingle();
      if (prof) {
        const newAccepted = (prof.accepted_count ?? 0) + 1;
        const newTrust = Math.min(100, (prof.trust_score ?? 50) + 4);
        const newTier = newAccepted >= 25 && newTrust >= 85 ? "elite"
          : newAccepted >= 10 && newTrust >= 75 ? "verified"
          : newAccepted >= 3 ? "trusted"
          : "beginner";
        await supabase.from("contributor_profiles").update({
          wallet_balance_kobo: (prof.wallet_balance_kobo ?? 0) + payout,
          accepted_count: newAccepted,
          trust_score: newTrust,
          tier: newTier,
        }).eq("user_id", sub.contributor_id);
      }
    }

    await supabase.from("notifications").insert({
      user_id: sub.contributor_id,
      kind: "submission_published",
      title: `Published: ${sub.title}`,
      body: `Your story is now live on ClearFact News.${payout > 0 ? ` ₦${(payout / 100).toLocaleString()} credited to your wallet.` : ""}`,
      link: `/article/${art.slug}`,
    });

    return { ok: true, status: "published" as const, slug: art.slug };
  });
