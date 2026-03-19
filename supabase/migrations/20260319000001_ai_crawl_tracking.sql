-- Track AI agent queries against the archive (Gorilla Pool crawls + direct API)
-- Each row = one AI query event (lightweight, no PII)
CREATE TABLE IF NOT EXISTS public.ai_queries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  query_type    text NOT NULL DEFAULT 'crawl',  -- 'crawl' | 'search' | 'analysis'
  sats_paid     integer NOT NULL DEFAULT 0,
  source        text DEFAULT 'gorilla_pool',     -- 'gorilla_pool' | 'api' | 'internal'
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_queries ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (AI queries come via edge functions / Gorilla Pool webhooks)
CREATE POLICY "Service role can manage ai_queries"
  ON public.ai_queries FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can read aggregate stats (not individual rows)
CREATE POLICY "Authenticated users can view ai_queries"
  ON public.ai_queries FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fast index for dashboard count queries
CREATE INDEX IF NOT EXISTS idx_ai_queries_created_at ON public.ai_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_queries_document_id ON public.ai_queries(document_id);

-- Platform-wide stats view for the Treasury dashboard
-- Single query returns all key counters in one round-trip
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*)::int         FROM public.documents  WHERE delisted = false)                        AS documents_inscribed,
  (SELECT COALESCE(SUM(view_count), 0)::bigint FROM public.documents WHERE delisted = false)          AS total_human_views,
  (SELECT COUNT(*)::bigint      FROM public.ai_queries)                                               AS total_ai_crawls,
  (SELECT COALESCE(SUM(sats_paid), 0)::bigint FROM public.ai_queries)                                AS ai_sats_earned,
  (SELECT COUNT(*)::int         FROM public.document_unlocks)                                         AS total_unlocks,
  (SELECT COALESCE(SUM(owner_share), 0)  FROM public.document_unlocks)                               AS total_royalties_bsv,
  (SELECT COALESCE(SUM(gorilla_pool_share), 0) FROM public.document_unlocks)                         AS gorilla_pool_bsv,
  (SELECT COUNT(*)::int         FROM public.profiles WHERE has_paid_entry_fee = true)                 AS paying_archivists,
  (SELECT COUNT(*)::int         FROM public.profiles)                                                 AS total_users;
