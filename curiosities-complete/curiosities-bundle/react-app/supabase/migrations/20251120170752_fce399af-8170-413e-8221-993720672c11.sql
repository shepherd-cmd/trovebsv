-- Add new fields to documents table for the complete upload flow
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS provenance_photos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS wallet_address text,
ADD COLUMN IF NOT EXISTS payable_link text,
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS document_photos jsonb DEFAULT '[]'::jsonb;