INSERT INTO storage.buckets (id, name, public) VALUES ('article-covers', 'article-covers', true);

CREATE POLICY "Public can view article covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-covers');

CREATE POLICY "Editors upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article-covers'
  AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Editors update covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article-covers'
  AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Editors delete covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-covers'
  AND (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);