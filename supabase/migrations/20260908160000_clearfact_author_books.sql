-- Frontend author marketplace. Full PDFs are private; only staff can approve.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pen_name TEXT;
CREATE TYPE public.book_submission_status AS ENUM ('pending','changes_requested','approved','rejected','withdrawn');
CREATE TABLE public.book_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 180),
  pen_name TEXT NOT NULL CHECK (char_length(pen_name) BETWEEN 2 AND 120),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 40 AND 6000),
  price_kobo BIGINT NOT NULL CHECK (price_kobo BETWEEN 100 AND 100000000),
  full_path TEXT NOT NULL,
  sample_path TEXT NOT NULL,
  cover_path TEXT NOT NULL,
  status public.book_submission_status NOT NULL DEFAULT 'pending',
  review_note TEXT,
  woo_product_id BIGINT,
  rights_accepted_at TIMESTAMPTZ NOT NULL,
  policy_accepted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.book_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors view own book submissions" ON public.book_submissions FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors insert own book submissions" ON public.book_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND status = 'pending');
CREATE POLICY "Authors update pending submissions" ON public.book_submissions FOR UPDATE TO authenticated USING (auth.uid() = author_id AND status IN ('pending','changes_requested')) WITH CHECK (auth.uid() = author_id AND status IN ('pending','changes_requested'));
CREATE POLICY "Public view approved book catalogue" ON public.book_submissions FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Editors manage book submissions" ON public.book_submissions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE INDEX idx_book_submissions_author ON public.book_submissions(author_id, created_at DESC);
CREATE INDEX idx_book_submissions_status ON public.book_submissions(status, created_at DESC);
CREATE TABLE public.book_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  book_id UUID NOT NULL REFERENCES public.book_submissions(id) ON DELETE RESTRICT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  gross_kobo BIGINT NOT NULL DEFAULT 0 CHECK (gross_kobo >= 0),
  commission_kobo BIGINT NOT NULL DEFAULT 0 CHECK (commission_kobo >= 0),
  author_net_kobo BIGINT NOT NULL DEFAULT 0 CHECK (author_net_kobo >= 0),
  status TEXT NOT NULL DEFAULT 'paid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, book_id)
);
ALTER TABLE public.book_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors view own book sales" ON public.book_sales FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Editors manage book sales" ON public.book_sales FOR ALL TO authenticated USING (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE INDEX idx_book_sales_author ON public.book_sales(author_id, created_at DESC);
INSERT INTO storage.buckets (id, name, public) VALUES ('author-books-private','author-books-private',false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('author-book-covers','author-book-covers',true) ON CONFLICT DO NOTHING;
CREATE POLICY "Authors upload own books" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'author-books-private' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authors read own books" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'author-books-private' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Editors read submitted books" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'author-books-private' AND (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "Authors upload own book covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'author-book-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Public read approved book covers" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'author-book-covers');
