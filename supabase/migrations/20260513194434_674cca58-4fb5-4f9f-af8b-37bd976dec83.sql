
DROP POLICY IF EXISTS "Public can view non-sensitive document fields" ON public.documents;

DROP VIEW IF EXISTS public.documents_public;
CREATE VIEW public.documents_public AS
SELECT
  id, user_id, title, description, category, image_url,
  rarity_score, usefulness_score, ai_analysis, inscription_txid,
  price_per_page, total_pages, status, owner_paymail, total_earnings,
  view_count, document_photos, provenance_photos, created_at, updated_at
FROM public.documents;
GRANT SELECT ON public.documents_public TO anon, authenticated;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT id, username, avatar_url FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.credit_pending_balance(user_id uuid, amount_bsv numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE public.profiles SET pending_balance_bsv = pending_balance_bsv + amount_bsv
  WHERE id = user_id AND wallet_type = 'custodial';
END; $$;

CREATE OR REPLACE FUNCTION public.claim_pending_balance(user_id uuid, new_wallet_type text, new_identity text)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE balance numeric;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT pending_balance_bsv INTO balance FROM public.profiles WHERE id = user_id;
  UPDATE public.profiles
  SET wallet_type = new_wallet_type, identity_provider = new_wallet_type, pending_balance_bsv = 0,
      sigma_id = CASE WHEN new_wallet_type='sigma' THEN new_identity ELSE sigma_id END,
      metanet_identity = CASE WHEN new_wallet_type='metanet' THEN new_identity ELSE metanet_identity END
  WHERE id = user_id;
  RETURN COALESCE(balance, 0);
END; $$;

REVOKE EXECUTE ON FUNCTION public.credit_pending_balance(uuid, numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_pending_balance(uuid, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.credit_pending_balance(uuid, numeric) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.claim_pending_balance(uuid, text, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_document_earnings(uuid, numeric) FROM PUBLIC, anon, authenticated;
