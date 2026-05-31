
-- Enums
CREATE TYPE public.contributor_tier AS ENUM ('beginner', 'trusted', 'verified', 'elite');
CREATE TYPE public.contributor_specialty AS ENUM ('citizen_reporter','freelance_journalist','verified_correspondent','investigative_reporter','photojournalist','videographer');
CREATE TYPE public.submission_status AS ENUM ('draft','pending','ai_review','editor_review','approved','rejected','published');
CREATE TYPE public.wallet_entry_kind AS ENUM ('earning','payout','bonus','adjustment');

-- Add contributor roles to existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'contributor';

-- Contributor profiles
CREATE TABLE public.contributor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  specialty public.contributor_specialty NOT NULL DEFAULT 'citizen_reporter',
  tier public.contributor_tier NOT NULL DEFAULT 'beginner',
  trust_score INTEGER NOT NULL DEFAULT 50,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  location TEXT,
  phone TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  id_verified BOOLEAN NOT NULL DEFAULT false,
  face_verified BOOLEAN NOT NULL DEFAULT false,
  id_document_path TEXT,
  selfie_path TEXT,
  payout_method JSONB NOT NULL DEFAULT '{}'::jsonb,
  wallet_balance_kobo BIGINT NOT NULL DEFAULT 0,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contributor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contributors view own profile" ON public.contributor_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Editors view all contributor profiles" ON public.contributor_profiles
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'contributor_manager')
  );
CREATE POLICY "Users insert own contributor profile" ON public.contributor_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contributor profile" ON public.contributor_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Editors update contributor profiles" ON public.contributor_profiles
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'contributor_manager')
  );

CREATE TRIGGER trg_contributor_profiles_touch
BEFORE UPDATE ON public.contributor_profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Submissions
CREATE TABLE public.contributor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Politics',
  tags TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  geo JSONB,
  seo_title TEXT,
  seo_description TEXT,
  ai_analysis JSONB,
  plagiarism_score INTEGER,
  duplicate_of UUID,
  editor_feedback TEXT,
  status public.submission_status NOT NULL DEFAULT 'draft',
  reviewer_id UUID,
  published_article_id UUID,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contributor_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contributors view own submissions" ON public.contributor_submissions
  FOR SELECT TO authenticated USING (auth.uid() = contributor_id);
CREATE POLICY "Contributors insert own submissions" ON public.contributor_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = contributor_id);
CREATE POLICY "Contributors update own draft/pending submissions" ON public.contributor_submissions
  FOR UPDATE TO authenticated USING (auth.uid() = contributor_id AND status IN ('draft','pending'));
CREATE POLICY "Editors view all submissions" ON public.contributor_submissions
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'fact_checker') OR public.has_role(auth.uid(),'moderator')
  );
CREATE POLICY "Editors update all submissions" ON public.contributor_submissions
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'fact_checker') OR public.has_role(auth.uid(),'moderator')
  );

CREATE INDEX idx_submissions_contributor ON public.contributor_submissions(contributor_id);
CREATE INDEX idx_submissions_status ON public.contributor_submissions(status);

CREATE TRIGGER trg_submissions_touch
BEFORE UPDATE ON public.contributor_submissions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Editors create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'contributor_manager')
  );
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);

-- Wallet ledger
CREATE TABLE public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL,
  kind public.wallet_entry_kind NOT NULL,
  amount_kobo BIGINT NOT NULL,
  submission_id UUID,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributors view own ledger" ON public.wallet_ledger
  FOR SELECT TO authenticated USING (auth.uid() = contributor_id);
CREATE POLICY "Editors view all ledger" ON public.wallet_ledger
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'contributor_manager')
  );
CREATE POLICY "Editors create ledger entries" ON public.wallet_ledger
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'contributor_manager')
  );
CREATE INDEX idx_wallet_contributor ON public.wallet_ledger(contributor_id);

-- Community reports (anonymous tips / whistleblower)
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'tip',
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  contact TEXT,
  severity TEXT NOT NULL DEFAULT 'normal',
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  reporter_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit reports" ON public.community_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Editors view reports" ON public.community_reports
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'moderator')
  );
CREATE POLICY "Editors update reports" ON public.community_reports
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'moderator')
  );

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('contributor-evidence','contributor-evidence', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('contributor-media','contributor-media', true) ON CONFLICT DO NOTHING;

-- Evidence bucket: owner can read/write own folder; editors can read all
CREATE POLICY "Contributors upload own evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contributor-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Contributors read own evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'contributor-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Editors read all evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'contributor-evidence' AND (
      public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'fact_checker') OR public.has_role(auth.uid(),'moderator')
    )
  );
CREATE POLICY "Contributors delete own evidence" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'contributor-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public media bucket: anyone reads, contributors upload to own folder
CREATE POLICY "Public read contributor media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'contributor-media');
CREATE POLICY "Contributors upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contributor-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Contributors delete own media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'contributor-media' AND auth.uid()::text = (storage.foldername(name))[1]);
