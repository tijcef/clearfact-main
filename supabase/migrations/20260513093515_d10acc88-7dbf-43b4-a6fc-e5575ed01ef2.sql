
ALTER TYPE wallet_entry_kind ADD VALUE IF NOT EXISTS 'referral_bonus';
ALTER TYPE wallet_entry_kind ADD VALUE IF NOT EXISTS 'revenue_share';
ALTER TYPE wallet_entry_kind ADD VALUE IF NOT EXISTS 'tax_withhold';
ALTER TYPE wallet_entry_kind ADD VALUE IF NOT EXISTS 'payout_pending';
ALTER TYPE wallet_entry_kind ADD VALUE IF NOT EXISTS 'payout_failed';
