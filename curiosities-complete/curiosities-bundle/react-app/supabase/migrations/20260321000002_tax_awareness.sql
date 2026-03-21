-- ── Tax Awareness System ─────────────────────────────────────────────────────
-- Tracks per-user earnings in a way that makes annual tax statements trivial.
-- The app notifies users when they approach their country's tax-free threshold
-- and generates downloadable statements — we are not a tax collector, just a
-- responsible platform that helps users stay compliant.

-- Store the GBP (or local-currency) equivalent at time of each unlock.
-- HMRC and most tax authorities want the fiat value on the day of receipt,
-- not what BSV is worth today. This lets us produce accurate historic statements.
ALTER TABLE public.document_unlocks
  ADD COLUMN IF NOT EXISTS bsv_price_gbp    numeric(14, 6)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS owner_share_gbp  numeric(12, 4)  DEFAULT NULL;

-- Backfill note: existing rows will have NULL for these columns — that's fine.
-- New rows from the Stripe/Metanet integration will populate them at time of unlock.

-- Country preference per user (persisted server-side for notifications)
CREATE TABLE IF NOT EXISTS public.tax_settings (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country_code          char(2)     NOT NULL DEFAULT 'GB',
  notifications_enabled boolean     NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tax settings"
  ON public.tax_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tax_settings_user ON public.tax_settings(user_id);

-- ── Per-user earnings by calendar year view ───────────────────────────────────
-- Used by the Tax Awareness dashboard to show year-to-date totals quickly.
CREATE OR REPLACE VIEW public.user_earnings_by_year AS
SELECT
  du.user_id,
  EXTRACT(YEAR FROM du.created_at)::int                         AS year,
  COUNT(*)::int                                                 AS unlock_count,
  COALESCE(SUM(du.owner_share),     0)                          AS total_bsv,
  COALESCE(SUM(du.owner_share_gbp), 0)                          AS total_gbp_recorded,
  -- Count documents that contributed to earnings
  COUNT(DISTINCT du.document_id)::int                           AS documents_earning
FROM public.document_unlocks du
GROUP BY du.user_id, EXTRACT(YEAR FROM du.created_at);

-- ── Earnings velocity view ────────────────────────────────────────────────────
-- Compares last-7-day unlock rate vs prior-23-day rate, per document, per owner.
-- Used by the viral-detection logic: if 7d rate ≥ 2× baseline → flag as trending.
CREATE OR REPLACE VIEW public.earnings_velocity AS
SELECT
  d.user_id,
  d.id                                                                          AS document_id,
  d.title,
  COUNT(CASE WHEN du.created_at >= now() - interval '7 days'  THEN 1 END)::int AS unlocks_last_7d,
  COUNT(CASE WHEN du.created_at >= now() - interval '30 days'
             AND  du.created_at <  now() - interval '7 days'  THEN 1 END)::int AS unlocks_prior_23d,
  COALESCE(SUM(CASE WHEN du.created_at >= now() - interval '7 days'
                    THEN du.owner_share ELSE 0 END), 0)                         AS bsv_last_7d,
  COALESCE(SUM(du.owner_share), 0)                                              AS bsv_all_time
FROM public.documents d
LEFT JOIN public.document_unlocks du ON du.document_id = d.id
WHERE d.status = 'inscribed' AND d.delisted = false
GROUP BY d.user_id, d.id, d.title;

-- Fast index for velocity queries
CREATE INDEX IF NOT EXISTS idx_document_unlocks_user_created
  ON public.document_unlocks(user_id, created_at DESC);
