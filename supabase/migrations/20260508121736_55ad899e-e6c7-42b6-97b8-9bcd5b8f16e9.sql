
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Articles table
CREATE TYPE public.article_status AS ENUM ('draft', 'scheduled', 'published');
CREATE TYPE public.verification_status AS ENUM ('Verified','Under Review','Developing','Fact-Checked','Opinion','Sponsored');
CREATE TYPE public.confidence_level AS ENUM ('High','Medium','Preliminary');

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Politics',
  cover_image text,
  verification public.verification_status NOT NULL DEFAULT 'Under Review',
  confidence public.confidence_level NOT NULL DEFAULT 'Medium',
  status public.article_status NOT NULL DEFAULT 'draft',
  read_minutes integer NOT NULL DEFAULT 3,
  tags text[] NOT NULL DEFAULT '{}',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'ClearFact Newsroom',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_status_pub ON public.articles (status, published_at DESC);
CREATE INDEX idx_articles_category ON public.articles (category);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles whose publish time has passed
CREATE POLICY "Public can read published articles"
ON public.articles FOR SELECT
TO anon, authenticated
USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

-- Editors/admins can read all
CREATE POLICY "Editors view all articles"
ON public.articles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Editors insert articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Editors update articles"
ON public.articles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete articles"
ON public.articles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(),'admin'));

-- Auto updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER articles_touch_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
