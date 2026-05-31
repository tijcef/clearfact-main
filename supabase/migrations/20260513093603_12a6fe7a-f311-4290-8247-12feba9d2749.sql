
DO $$ BEGIN
  CREATE TYPE withdrawal_status AS ENUM ('pending','approved','processing','paid','rejected','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_provider AS ENUM ('paystack','flutterwave','opay','palmpay','bank_transfer','stripe','wise','paypal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE submission_rate_kind AS ENUM ('standard','breaking','exclusive','photo','video','opinion');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.payout_rate_cards (
  id uuid primary key default gen_random_uuid(),
  kind submission_rate_kind not null unique,
  label text not null,
  description text,
  amount_kobo bigint not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
ALTER TABLE public.payout_rate_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rate cards public" ON public.payout_rate_cards FOR SELECT USING (true);
CREATE POLICY "Admins manage rate cards" ON public.payout_rate_cards FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));

INSERT INTO public.payout_rate_cards (kind,label,description,amount_kobo) VALUES
  ('standard','Standard report','Verified general report',250000),
  ('breaking','Breaking news','Time-sensitive verified breaking story',500000),
  ('exclusive','Exclusive investigation','Original investigative reporting',1500000),
  ('photo','Photo submission','Newsworthy verified photo',100000),
  ('video','Video submission','Field video / footage',300000),
  ('opinion','Opinion piece','Editorial / opinion column',150000)
ON CONFLICT (kind) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null,
  contributor_id uuid not null,
  source text not null check (source in ('article_view','ad','subscriber','watch_time')),
  units bigint not null default 0,
  amount_kobo bigint not null default 0,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_revenue_events_contrib ON public.revenue_events(contributor_id, occurred_on DESC);
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors view own revenue" ON public.revenue_events FOR SELECT TO authenticated
  USING (auth.uid() = contributor_id OR has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'contributor_manager'));
CREATE POLICY "Editors insert revenue" ON public.revenue_events FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'contributor_manager'));

ALTER TABLE public.contributor_profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid;

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null,
  referred_user_id uuid not null,
  referred_kind text not null check (referred_kind in ('contributor','reader')),
  reward_kobo bigint not null default 0,
  rewarded boolean not null default false,
  created_at timestamptz not null default now(),
  unique (referred_user_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrer views own" ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'contributor_manager'));
CREATE POLICY "Anyone insert referral" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE TABLE IF NOT EXISTS public.payout_accounts (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null,
  provider payout_provider not null,
  display_name text not null,
  account_number_masked text,
  bank_name text,
  currency text not null default 'NGN',
  details jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
ALTER TABLE public.payout_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors view own payout acc" ON public.payout_accounts FOR SELECT TO authenticated
  USING (auth.uid() = contributor_id OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'contributor_manager'));
CREATE POLICY "Contributors insert own payout acc" ON public.payout_accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = contributor_id);
CREATE POLICY "Contributors update own payout acc" ON public.payout_accounts FOR UPDATE TO authenticated
  USING (auth.uid() = contributor_id);
CREATE POLICY "Contributors delete own payout acc" ON public.payout_accounts FOR DELETE TO authenticated
  USING (auth.uid() = contributor_id);

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null,
  payout_account_id uuid not null,
  amount_kobo bigint not null check (amount_kobo > 0),
  fee_kobo bigint not null default 0,
  tax_kobo bigint not null default 0,
  status withdrawal_status not null default 'pending',
  fraud_score integer not null default 0,
  fraud_flags jsonb not null default '[]'::jsonb,
  reviewer_id uuid,
  reviewer_note text,
  gateway_reference text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_contrib ON public.withdrawal_requests(contributor_id, requested_at DESC);
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors view own withdrawals" ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (auth.uid() = contributor_id OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'contributor_manager'));
CREATE POLICY "Contributors insert own withdrawals" ON public.withdrawal_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = contributor_id);
CREATE POLICY "Editors update withdrawals" ON public.withdrawal_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'contributor_manager'));

CREATE TABLE IF NOT EXISTS public.monthly_awards (
  id uuid primary key default gen_random_uuid(),
  award text not null check (award in ('top_journalist','most_trusted','highest_impact')),
  contributor_id uuid not null,
  month date not null,
  metric_value numeric,
  note text,
  created_at timestamptz not null default now(),
  unique (award, month)
);
ALTER TABLE public.monthly_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Awards public" ON public.monthly_awards FOR SELECT USING (true);
CREATE POLICY "Admins manage awards" ON public.monthly_awards FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE VIEW public.contributor_leaderboard
WITH (security_invoker = true)
AS
SELECT
  cp.user_id AS contributor_id,
  COALESCE(p.display_name, 'Contributor') AS display_name,
  p.avatar_url,
  cp.tier,
  cp.trust_score,
  cp.accepted_count,
  COALESCE(SUM(w.amount_kobo) FILTER (WHERE w.kind IN ('earning','bonus','revenue_share','referral_bonus')), 0) AS lifetime_earned_kobo
FROM public.contributor_profiles cp
LEFT JOIN public.profiles p ON p.user_id = cp.user_id
LEFT JOIN public.wallet_ledger w ON w.contributor_id = cp.user_id
GROUP BY cp.user_id, p.display_name, p.avatar_url, cp.tier, cp.trust_score, cp.accepted_count;

GRANT SELECT ON public.contributor_leaderboard TO anon, authenticated;
