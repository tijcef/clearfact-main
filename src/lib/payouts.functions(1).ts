import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PROVIDERS = [
  "paystack",
  "flutterwave",
  "opay",
  "palmpay",
  "bank_transfer",
  "stripe",
  "wise",
  "paypal",
] as const;

const MIN_WITHDRAWAL_KOBO = 200000; // ₦2,000
const MAX_WITHDRAWAL_KOBO = 500000000; // ₦5,000,000
const FEE_BPS = 150; // 1.5% gateway fee
const TAX_BPS = 500; // 5% withholding tax (NG WHT for services)

function computeFraudScore(opts: {
  amount_kobo: number;
  balance_kobo: number;
  trust_score: number;
  recent_count: number;
  account_age_days: number;
  account_verified: boolean;
}) {
  const flags: string[] = [];
  let score = 0;
  if (opts.amount_kobo > opts.balance_kobo) {
    score += 100;
    flags.push("amount_exceeds_balance");
  }
  if (opts.amount_kobo > 100_000_00) {
    score += 25;
    flags.push("very_large_request");
  }
  if (opts.recent_count >= 3) {
    score += 30;
    flags.push("rapid_withdrawals");
  }
  if (opts.trust_score < 60) {
    score += 25;
    flags.push("low_trust_score");
  }
  if (opts.account_age_days < 7) {
    score += 20;
    flags.push("new_payout_account");
  }
  if (!opts.account_verified) {
    score += 15;
    flags.push("unverified_payout_account");
  }
  return { score: Math.min(score, 100), flags };
}

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      payoutAccountId: z.string().uuid(),
      amountKobo: z.number().int().min(MIN_WITHDRAWAL_KOBO).max(MAX_WITHDRAWAL_KOBO),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };

    const [{ data: account }, { data: profile }, { data: recent }] = await Promise.all([
      supabase.from("payout_accounts").select("*").eq("id", data.payoutAccountId).eq("contributor_id", userId).maybeSingle(),
      supabase.from("contributor_profiles").select("wallet_balance_kobo,trust_score").eq("user_id", userId).maybeSingle(),
      supabase.from("withdrawal_requests").select("id").eq("contributor_id", userId).gte("requested_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
    ]);

    if (!account) throw new Error("Payout account not found");
    if (!profile) throw new Error("Contributor profile missing");

    const balance = profile.wallet_balance_kobo ?? 0;
    if (data.amountKobo > balance) throw new Error("Amount exceeds wallet balance");

    const fee = Math.round((data.amountKobo * FEE_BPS) / 10_000);
    const tax = Math.round((data.amountKobo * TAX_BPS) / 10_000);

    const ageDays = account.created_at
      ? Math.floor((Date.now() - new Date(account.created_at).getTime()) / 86400_000)
      : 0;

    const fraud = computeFraudScore({
      amount_kobo: data.amountKobo,
      balance_kobo: balance,
      trust_score: profile.trust_score ?? 50,
      recent_count: (recent ?? []).length,
      account_age_days: ageDays,
      account_verified: !!account.verified,
    });

    const { data: req, error } = await supabase.from("withdrawal_requests").insert({
      contributor_id: userId,
      payout_account_id: account.id,
      amount_kobo: data.amountKobo,
      fee_kobo: fee,
      tax_kobo: tax,
      fraud_score: fraud.score,
      fraud_flags: fraud.flags,
      status: "pending",
    }).select("*").single();
    if (error || !req) throw new Error(error?.message ?? "Failed to create withdrawal");

    // Hold the funds: deduct from balance and log a pending ledger entry.
    await supabase.from("contributor_profiles").update({
      wallet_balance_kobo: balance - data.amountKobo,
    }).eq("user_id", userId);

    await supabase.from("wallet_ledger").insert({
      contributor_id: userId,
      kind: "payout_pending",
      amount_kobo: data.amountKobo,
      note: `Withdrawal requested via ${account.provider}`,
    });

    return { ok: true, withdrawal: req };
  });

export const decideWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      withdrawalId: z.string().uuid(),
      decision: z.enum(["approve", "reject", "mark_paid", "mark_failed"]),
      note: z.string().max(2000).optional(),
      gatewayReference: z.string().max(255).optional(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };

    // Verify caller is editor/admin/contributor_manager
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const allowed = (roles ?? []).some((r: { role: string }) =>
      ["admin", "super_admin", "editor", "contributor_manager"].includes(r.role),
    );
    if (!allowed) throw new Error("Forbidden");

    const { data: w } = await supabase.from("withdrawal_requests").select("*").eq("id", data.withdrawalId).single();
    if (!w) throw new Error("Not found");

    const now = new Date().toISOString();

    if (data.decision === "reject") {
      // Refund the held amount back to the wallet
      const { data: prof } = await supabase.from("contributor_profiles").select("wallet_balance_kobo").eq("user_id", w.contributor_id).maybeSingle();
      await supabase.from("contributor_profiles").update({
        wallet_balance_kobo: (prof?.wallet_balance_kobo ?? 0) + w.amount_kobo,
      }).eq("user_id", w.contributor_id);

      await supabase.from("wallet_ledger").insert({
        contributor_id: w.contributor_id,
        kind: "adjustment",
        amount_kobo: w.amount_kobo,
        note: `Withdrawal rejected — refund (${data.note ?? ""})`.trim(),
        created_by: userId,
      });

      await supabase.from("withdrawal_requests").update({
        status: "rejected", reviewer_id: userId, reviewer_note: data.note ?? null, reviewed_at: now,
      }).eq("id", w.id);

      await supabase.from("notifications").insert({
        user_id: w.contributor_id,
        kind: "withdrawal_rejected",
        title: "Withdrawal rejected",
        body: data.note ?? "Your withdrawal request could not be approved.",
        link: "/contributor/wallet",
      });
      return { ok: true, status: "rejected" as const };
    }

    if (data.decision === "approve") {
      await supabase.from("withdrawal_requests").update({
        status: "approved", reviewer_id: userId, reviewer_note: data.note ?? null, reviewed_at: now,
      }).eq("id", w.id);
      await supabase.from("notifications").insert({
        user_id: w.contributor_id,
        kind: "withdrawal_approved",
        title: "Withdrawal approved",
        body: "Your withdrawal has been approved and is queued for payout.",
        link: "/contributor/wallet",
      });
      return { ok: true, status: "approved" as const };
    }

    if (data.decision === "mark_paid") {
      // Convert held pending into a real payout entry
      await supabase.from("wallet_ledger").insert({
        contributor_id: w.contributor_id,
        kind: "payout",
        amount_kobo: w.amount_kobo,
        note: `Paid via ${data.gatewayReference ?? "manual"}${w.fee_kobo ? ` (fee ₦${(w.fee_kobo/100).toLocaleString()})` : ""}`,
        created_by: userId,
      });
      if (w.tax_kobo > 0) {
        await supabase.from("wallet_ledger").insert({
          contributor_id: w.contributor_id,
          kind: "tax_withhold",
          amount_kobo: w.tax_kobo,
          note: "Withholding tax reserved",
          created_by: userId,
        });
      }
      await supabase.from("withdrawal_requests").update({
        status: "paid", paid_at: now, gateway_reference: data.gatewayReference ?? null, reviewer_id: userId, reviewer_note: data.note ?? null,
      }).eq("id", w.id);
      await supabase.from("notifications").insert({
        user_id: w.contributor_id,
        kind: "withdrawal_paid",
        title: "Payout sent",
        body: `Your withdrawal of ₦${(w.amount_kobo / 100).toLocaleString()} has been paid.`,
        link: "/contributor/wallet",
      });
      return { ok: true, status: "paid" as const };
    }

    // mark_failed → refund + log
    const { data: prof } = await supabase.from("contributor_profiles").select("wallet_balance_kobo").eq("user_id", w.contributor_id).maybeSingle();
    await supabase.from("contributor_profiles").update({
      wallet_balance_kobo: (prof?.wallet_balance_kobo ?? 0) + w.amount_kobo,
    }).eq("user_id", w.contributor_id);
    await supabase.from("wallet_ledger").insert({
      contributor_id: w.contributor_id,
      kind: "payout_failed",
      amount_kobo: w.amount_kobo,
      note: `Gateway failure — refund (${data.note ?? ""})`.trim(),
      created_by: userId,
    });
    await supabase.from("withdrawal_requests").update({
      status: "failed", reviewer_id: userId, reviewer_note: data.note ?? null, reviewed_at: now,
    }).eq("id", w.id);
    return { ok: true, status: "failed" as const };
  });

export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      referralCode: z.string().min(4).max(32),
      kind: z.enum(["contributor", "reader"]).default("reader"),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as { supabase: any; userId: string };

    const { data: referrer } = await supabase
      .from("contributor_profiles")
      .select("user_id")
      .eq("referral_code", data.referralCode.trim().toUpperCase())
      .maybeSingle();
    if (!referrer) throw new Error("Invalid referral code");
    if (referrer.user_id === userId) throw new Error("You cannot refer yourself");

    const reward = data.kind === "contributor" ? 500_00 : 100_00; // ₦500 / ₦100

    const { error } = await supabase.from("referrals").insert({
      referrer_id: referrer.user_id,
      referred_user_id: userId,
      referred_kind: data.kind,
      reward_kobo: reward,
      rewarded: true,
    });
    if (error) throw new Error(error.message);

    // Credit the referrer wallet
    const { data: rprof } = await supabase.from("contributor_profiles").select("wallet_balance_kobo").eq("user_id", referrer.user_id).maybeSingle();
    if (rprof) {
      await supabase.from("contributor_profiles").update({
        wallet_balance_kobo: (rprof.wallet_balance_kobo ?? 0) + reward,
      }).eq("user_id", referrer.user_id);
      await supabase.from("wallet_ledger").insert({
        contributor_id: referrer.user_id,
        kind: "referral_bonus",
        amount_kobo: reward,
        note: `Referral bonus — ${data.kind}`,
      });
      await supabase.from("notifications").insert({
        user_id: referrer.user_id,
        kind: "referral_reward",
        title: "Referral bonus credited",
        body: `₦${(reward / 100).toLocaleString()} added to your wallet.`,
        link: "/contributor/wallet",
      });
    }
    return { ok: true, reward_kobo: reward };
  });

export const PROVIDER_LIST = PROVIDERS;
