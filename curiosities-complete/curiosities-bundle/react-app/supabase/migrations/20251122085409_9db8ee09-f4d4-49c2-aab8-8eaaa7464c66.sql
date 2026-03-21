-- Create function to increment document earnings atomically
CREATE OR REPLACE FUNCTION public.increment_document_earnings(
  doc_id UUID,
  amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.documents
  SET total_earnings = COALESCE(total_earnings, 0) + amount
  WHERE id = doc_id;
END;
$$;