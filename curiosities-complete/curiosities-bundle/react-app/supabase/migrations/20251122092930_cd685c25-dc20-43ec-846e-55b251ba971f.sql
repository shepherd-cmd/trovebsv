-- Add lifetime archivist fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lifetime_archivist boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS free_inscriptions_remaining integer DEFAULT 0;

-- Add owner_paymail to documents table for payment routing
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS owner_paymail text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_lifetime_archivist ON public.profiles(lifetime_archivist);
CREATE INDEX IF NOT EXISTS idx_documents_owner_paymail ON public.documents(owner_paymail);