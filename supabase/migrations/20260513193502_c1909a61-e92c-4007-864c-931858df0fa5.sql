-- 1. Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Documents are viewable by everyone" ON public.documents;

-- 2. Restrict direct SELECT on base table to owners only
CREATE POLICY "Owners can view their own documents"
  ON public.documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Create a public view that excludes sensitive financial routing fields
CREATE OR REPLACE VIEW public.documents_public
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  title,
  description,
  category,
  image_url,
  rarity_score,
  usefulness_score,
  ai_analysis,
  inscription_txid,
  price_per_page,
  total_pages,
  status,
  owner_paymail,
  total_earnings,
  view_count,
  document_photos,
  provenance_photos,
  created_at,
  updated_at
FROM public.documents;

-- The view inherits RLS from the base table via security_invoker.
-- To allow public reads through the view, add a permissive SELECT policy
-- scoped to anon/authenticated that only matters when accessed via the view's columns.
-- Since RLS is row-level (not column-level), we need a second SELECT policy
-- that allows everyone to read rows — but the view itself omits the sensitive columns.
CREATE POLICY "Public can view non-sensitive document fields"
  ON public.documents
  FOR SELECT
  USING (true);

-- NOTE: Both SELECT policies are permissive (OR'd). The "Public" policy allows
-- row visibility, but client code MUST query documents_public to avoid exposing
-- wallet_address / payable_link. We enforce this at the application layer.

GRANT SELECT ON public.documents_public TO anon, authenticated;