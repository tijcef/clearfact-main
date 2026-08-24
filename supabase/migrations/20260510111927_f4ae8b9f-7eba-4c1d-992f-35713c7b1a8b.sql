
CREATE TABLE IF NOT EXISTS public.article_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  editor_id UUID,
  editor_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_revisions_article ON public.article_revisions(article_id, created_at DESC);

ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors view revisions"
  ON public.article_revisions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Editors create revisions"
  ON public.article_revisions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author_id);
