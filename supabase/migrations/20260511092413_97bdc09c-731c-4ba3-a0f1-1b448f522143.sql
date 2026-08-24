
-- Article truth/transparency fields
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trust_score integer NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS ai_analysis jsonb;

-- Public corrections log
CREATE TABLE IF NOT EXISTS public.corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  note text NOT NULL,
  editor_id uuid,
  editor_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corrections are public"
  ON public.corrections FOR SELECT
  USING (true);

CREATE POLICY "Editors log corrections"
  ON public.corrections FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'editor'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE INDEX IF NOT EXISTS corrections_article_idx ON public.corrections(article_id, created_at DESC);

-- Public revision history for published articles ("What changed" log)
CREATE POLICY "Public revisions for published articles"
  ON public.article_revisions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = article_revisions.article_id
      AND a.status = 'published'
      AND a.published_at IS NOT NULL
      AND a.published_at <= now()
  ));
