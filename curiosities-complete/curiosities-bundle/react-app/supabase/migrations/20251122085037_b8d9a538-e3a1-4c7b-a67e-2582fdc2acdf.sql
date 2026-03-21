-- Create table to track which users have unlocked which documents
CREATE TABLE public.document_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  owner_share NUMERIC NOT NULL,
  platform_share NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- Enable RLS
ALTER TABLE public.document_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can view their own unlocks
CREATE POLICY "Users can view their own unlocks"
ON public.document_unlocks
FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can create unlock records
CREATE POLICY "Authenticated users can create unlocks"
ON public.document_unlocks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_document_unlocks_user ON public.document_unlocks(user_id);
CREATE INDEX idx_document_unlocks_document ON public.document_unlocks(document_id);