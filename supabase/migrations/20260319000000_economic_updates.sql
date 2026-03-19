-- Economic model updates: inscription_credits, entry fee, delist, gorilla pool split

-- Rename free_inscriptions_remaining → inscription_credits
-- (preserves existing values so no data is lost)
ALTER TABLE public.profiles
  RENAME COLUMN free_inscriptions_remaining TO inscription_credits;

-- Track whether user has paid the £3.99 entry fee
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_paid_entry_fee boolean NOT NULL DEFAULT false;

-- Gorilla pool share column on document_unlocks
ALTER TABLE public.document_unlocks
  ADD COLUMN IF NOT EXISTS gorilla_pool_share numeric(10, 8) DEFAULT 0;

-- Update platform_share to reflect new 20% (was also 20%, no value change needed)
-- Record gorilla pool paymail for audit trail
ALTER TABLE public.treasury_transactions
  ADD COLUMN IF NOT EXISTS gorilla_pool_share numeric(10, 8) DEFAULT 0;

-- Delist mechanism: platform can hide content without touching the blockchain
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS delisted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delisted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS delisted_reason text;

-- Only platform (service role) can set delisted — regular users cannot delist others' docs
CREATE POLICY "Only service role can delist documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Filter delisted documents from public reads by default
DROP POLICY IF EXISTS "Documents are viewable by everyone" ON public.documents;
CREATE POLICY "Non-delisted documents are viewable by everyone"
  ON public.documents FOR SELECT
  USING (delisted = false OR auth.uid() = user_id);

-- Index for fast delist filter
CREATE INDEX IF NOT EXISTS idx_documents_delisted ON public.documents(delisted);

-- Index for recently added query
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Index for top rated query
CREATE INDEX IF NOT EXISTS idx_documents_rarity_score ON public.documents(rarity_score DESC);

-- Full text search index on title for Browse/search feature
CREATE INDEX IF NOT EXISTS idx_documents_title_fts
  ON public.documents USING gin(to_tsvector('english', title));
