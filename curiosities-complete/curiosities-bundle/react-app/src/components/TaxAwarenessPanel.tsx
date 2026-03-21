/**
 * TaxAwarenessPanel — curIosities
 *
 * Shows each user their current-year earnings against their country's tax-free
 * threshold. The goal is simple: nobody gets a surprise bill from the tax man.
 *
 * Three modes:
 *   CLEAR      — well under the threshold, green, no action needed
 *   APPROACHING — getting close, amber, heads-up
 *   ACTION     — over or nearly over, red, declaration guidance + download
 *
 * Viral detection: if a document's 7-day unlock rate is ≥ 2× its 30-day
 * baseline, a 🔥 trending alert fires so the user knows early.
 *
 * We are NOT a tax adviser. We give users the data they need; a qualified
 * accountant handles the actual filing.
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBsvGbpPrice } from '@/utils/bsvPrice';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, AlertTriangle, TrendingUp,
  Download, ChevronDown, ChevronUp, Info,
} from 'lucide-react';

// ── Country tax-free thresholds ───────────────────────────────────────────────
// These are the "no-action-needed" limits for hobby / casual trading income.
// Over these amounts, users should declare to their tax authority.
// Values in local currency. Verify annually — thresholds change.
const THRESHOLDS: Record<string, {
  name: string;
  symbol: string;
  currencyCode: string;
  threshold: number;
  note: string;
  taxYear: string;
  selfAssessmentUrl: string;
}> = {
  GB: {
    name: 'United Kingdom',
    symbol: '£', currencyCode: 'GBP',
    threshold: 1_000,
    note: 'HMRC Trading Allowance',
    taxYear: '6 Apr – 5 Apr',
    selfAssessmentUrl: 'https://www.gov.uk/self-assessment-tax-returns',
  },
  US: {
    name: 'United States',
    symbol: '$', currencyCode: 'USD',
    threshold: 400,
    note: 'IRS self-employment threshold',
    taxYear: '1 Jan – 31 Dec',
    selfAssessmentUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center',
  },
  AU: {
    name: 'Australia',
    symbol: 'A$', currencyCode: 'AUD',
    threshold: 18_200,
    note: 'ATO tax-free threshold',
    taxYear: '1 Jul – 30 Jun',
    selfAssessmentUrl: 'https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-you-must-declare/crypto-asset-investments',
  },
  CA: {
    name: 'Canada',
    symbol: 'C$', currencyCode: 'CAD',
    threshold: 15_000,
    note: 'CRA basic personal amount',
    taxYear: '1 Jan – 31 Dec',
    selfAssessmentUrl: 'https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/digital-economy-taxation.html',
  },
  DE: {
    name: 'Germany',
    symbol: '€', currencyCode: 'EUR',
    threshold: 10_908,
    note: 'Grundfreibetrag',
    taxYear: '1 Jan – 31 Dec',
    selfAssessmentUrl: 'https://www.bundesfinanzministerium.de',
  },
  FR: {
    name: 'France',
    symbol: '€', currencyCode: 'EUR',
    threshold: 10_777,
    note: 'Revenu fiscal de référence',
    taxYear: '1 Jan – 31 Dec',
    selfAssessmentUrl: 'https://www.impots.gouv.fr',
  },
  NL: {
    name: 'Netherlands',
    symbol: '€', currencyCode: 'EUR',
    threshold: 8_700,
    note: 'Heffingsvrij vermogen',
    taxYear: '1 Jan – 31 Dec',
    selfAssessmentUrl: 'https://www.belastingdienst.nl',
  },
  OTHER: {
    name: 'Other country',
    symbol: '$', currencyCode: 'USD',
    threshold: 0,
    note: 'Check your local tax authority',
    taxYear: '',
    selfAssessmentUrl: '',
  },
};

// Approximate exchange rates vs GBP (MVP: static; production: wire to FX API)
const FX_TO_GBP: Record<string, number> = {
  GBP: 1.00,
  USD: 0.79,
  AUD: 0.51,
  CAD: 0.58,
  EUR: 0.86,
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface UnlockRow {
  id: string;
  document_id: string;
  owner_share: number;
  owner_share_gbp: number | null;
  created_at: string;
  documents: { title: string } | null;
}

interface DocSummary {
  documentId: string;
  title: string;
  totalUnlocks: number;
  totalBsv: number;
  last7dUnlocks: number;
  prior23dUnlocks: number;
}

type Status = 'clear' | 'watching' | 'approaching' | 'action' | 'over';

// ── Component ─────────────────────────────────────────────────────────────────
export const TaxAwarenessPanel = ({ userId }: { userId: string }) => {
  const [country, setCountry]         = useState<string>(() =>
    localStorage.getItem('curiosities_country') ?? 'GB'
  );
  const [unlocks, setUnlocks]         = useState<UnlockRow[]>([]);
  const [bsvPriceGbp, setBsvPriceGbp] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState(false);

  // Persist country choice
  useEffect(() => {
    localStorage.setItem('curiosities_country', country);
  }, [country]);

  // Load earnings + BSV price
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [price, { data }] = await Promise.all([
        getBsvGbpPrice(),
        supabase
          .from('document_unlocks')
          .select('id, document_id, owner_share, owner_share_gbp, created_at, documents(title)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);
      setBsvPriceGbp(price);
      if (data) setUnlocks(data as UnlockRow[]);
      setLoading(false);
    })();
  }, [userId]);

  // ── Tax year start for selected country ──────────────────────────────────────
  const taxYearStart = useMemo(() => {
    const now = new Date();
    const y   = now.getFullYear();
    if (country === 'GB') {
      const start = new Date(y, 3, 6); // 6 Apr
      return now >= start ? start : new Date(y - 1, 3, 6);
    }
    if (country === 'AU') {
      const start = new Date(y, 6, 1); // 1 Jul
      return now >= start ? start : new Date(y - 1, 6, 1);
    }
    return new Date(y, 0, 1); // calendar year
  }, [country]);

  // ── Earnings calculations ─────────────────────────────────────────────────
  const thr  = THRESHOLDS[country] ?? THRESHOLDS.OTHER;
  const fx   = FX_TO_GBP[thr.currencyCode] ?? 1;

  const thisYearUnlocks = useMemo(
    () => unlocks.filter(u => new Date(u.created_at) >= taxYearStart),
    [unlocks, taxYearStart]
  );

  const totalBsvThisYear = useMemo(
    () => thisYearUnlocks.reduce((s, u) => s + (u.owner_share ?? 0), 0),
    [thisYearUnlocks]
  );

  // Prefer the stored GBP value (accurate at time of receipt); fall back to live price
  const totalLocalThisYear = useMemo(() => {
    if (bsvPriceGbp === 0 && fx === 0) return 0;
    const gbp = thisYearUnlocks.reduce((s, u) => {
      const g = u.owner_share_gbp != null
        ? u.owner_share_gbp                          // stored historic value
        : (u.owner_share ?? 0) * bsvPriceGbp;        // live rate fallback
      return s + g;
    }, 0);
    return gbp / fx;
  }, [thisYearUnlocks, bsvPriceGbp, fx]);

  const percentage  = thr.threshold > 0 ? Math.min((totalLocalThisYear / thr.threshold) * 100, 999) : 0;
  const remaining   = Math.max(thr.threshold - totalLocalThisYear, 0);

  const status: Status =
    thr.threshold === 0    ? 'clear'      :
    percentage >= 100      ? 'over'       :
    percentage >= 90       ? 'action'     :
    percentage >= 65       ? 'approaching':
    percentage >= 35       ? 'watching'   : 'clear';

  // ── Per-document summary + viral detection ────────────────────────────────
  const docSummaries = useMemo<DocSummary[]>(() => {
    const now  = Date.now();
    const d7   = now - 7  * 86_400_000;
    const d30  = now - 30 * 86_400_000;
    const map  = new Map<string, DocSummary>();

    for (const u of unlocks) {
      const ts  = new Date(u.created_at).getTime();
      const cur = map.get(u.document_id) ?? {
        documentId:    u.document_id,
        title:         u.documents?.title ?? 'Unknown document',
        totalUnlocks:  0,
        totalBsv:      0,
        last7dUnlocks: 0,
        prior23dUnlocks: 0,
      };
      cur.totalUnlocks++;
      cur.totalBsv += u.owner_share ?? 0;
      if (ts >= d7) cur.last7dUnlocks++;
      else if (ts >= d30) cur.prior23dUnlocks++;
      map.set(u.document_id, cur);
    }
    return [...map.values()].sort((a, b) => b.totalBsv - a.totalBsv);
  }, [unlocks]);

  // Viral: 7-day rate ≥ 2× prior baseline AND minimum volume
  const viralDocs = useMemo(
    () => docSummaries.filter(d => {
      if (d.last7dUnlocks < 2) return false;
      const rate7  = d.last7dUnlocks   / 7;
      const rate23 = d.prior23dUnlocks / 23;
      return rate23 === 0 ? rate7 >= 3 : rate7 >= rate23 * 2;
    }),
    [docSummaries]
  );

  // Days to threshold at current 7-day BSV earning rate
  const daysToThreshold = useMemo(() => {
    if (remaining <= 0 || thr.threshold === 0) return null;
    const bsv7d     = unlocks
      .filter(u => Date.now() - new Date(u.created_at).getTime() < 7 * 86_400_000)
      .reduce((s, u) => s + (u.owner_share ?? 0), 0);
    const dailyLocal = (bsv7d / 7) * bsvPriceGbp / fx;
    if (dailyLocal <= 0) return null;
    const days = Math.ceil(remaining / dailyLocal);
    return days > 9_999 ? null : days;
  }, [unlocks, bsvPriceGbp, fx, remaining, thr]);

  // ── CSV export ───────────────────────────────────────────────────────────
  const downloadStatement = () => {
    const header = ['Date (UTC)', 'Document', 'BSV Received', 'Approx GBP at Receipt', 'Reference'];
    const rows   = unlocks.map(u => [
      u.created_at.slice(0, 10),
      u.documents?.title ?? 'Unknown',
      (u.owner_share ?? 0).toFixed(8),
      u.owner_share_gbp != null
        ? u.owner_share_gbp.toFixed(4)
        : bsvPriceGbp > 0 ? ((u.owner_share ?? 0) * bsvPriceGbp).toFixed(4) : 'N/A',
      u.id,
    ]);
    const csv  = [header, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(blob),
      download: `curIosities-earnings-${new Date().getFullYear()}.csv`,
    });
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ── Status display config ────────────────────────────────────────────────
  const STATUS_CFG = {
    clear:      { color: 'hsl(142 65% 42%)', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.18)',   Icon: CheckCircle,   headline: "You're under the limit — no tax action needed" },
    watching:   { color: 'hsl(42 88% 55%)',  bg: 'rgba(218,165,32,0.07)',  border: 'rgba(218,165,32,0.2)',   Icon: TrendingUp,    headline: "Building nicely — keep an eye on your threshold" },
    approaching:{ color: 'hsl(30 90% 55%)',  bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.22)',  Icon: AlertTriangle, headline: "Approaching your tax-free threshold" },
    action:     { color: 'hsl(10 85% 55%)',  bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',   Icon: AlertTriangle, headline: "Nearly at your limit — review your tax position" },
    over:       { color: 'hsl(0 80% 52%)',   bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.32)',   Icon: AlertTriangle, headline: "Over the threshold — this income should be declared" },
  } as const;

  const cfg = STATUS_CFG[status];
  const { Icon } = cfg;

  const barColour =
    status === 'clear'       ? 'hsl(142 65% 42%)' :
    status === 'watching'    ? 'hsl(42 88% 55%)'  :
    status === 'approaching' ? 'hsl(30 90% 55%)'  : 'hsl(0 80% 52%)';

  if (loading) return (
    <div className="mb-6 p-4 rounded-sm animate-pulse"
         style={{ background: 'rgba(139,90,0,0.06)', border: '1px solid hsl(38 35% 35% / 0.2)' }}>
      <p className="text-xs text-muted-foreground">Loading earnings data…</p>
    </div>
  );

  return (
    <div className="mb-6 rounded-sm overflow-hidden transition-all duration-300"
         style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className="h-5 w-5 mt-0.5 shrink-0" style={{ color: cfg.color }} />
          <div className="min-w-0">
            <p className="text-sm font-bold font-display leading-tight" style={{ color: cfg.color }}>
              {cfg.headline}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-body">
              {thr.symbol}{totalLocalThisYear.toFixed(2)} earned this tax year
              {thr.threshold > 0 && (
                <span> · {thr.symbol}{thr.threshold.toLocaleString()} {thr.note}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Country selector */}
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="text-xs rounded-sm px-2 py-1 font-body cursor-pointer"
            style={{
              background: 'hsl(20 15% 8%)',
              border: '1px solid hsl(38 35% 25%)',
              color: 'hsl(40 20% 70%)',
            }}
          >
            {Object.entries(THRESHOLDS).map(([code, t]) => (
              <option key={code} value={code}>{t.name}</option>
            ))}
          </select>

          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs font-body transition-colors hover:opacity-80"
            style={{ color: 'hsl(38 60% 50%)' }}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {thr.threshold > 0 && (
        <div className="px-4 pb-3">
          <div className="h-1.5 rounded-full overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(percentage, 100)}%`, background: barColour }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground font-body">
              {percentage.toFixed(1)}% of {thr.note}
            </span>
            {status !== 'over' && remaining > 0 && (
              <span className="text-[10px] text-muted-foreground font-body">
                {thr.symbol}{remaining.toFixed(2)} remaining
                {daysToThreshold !== null && (
                  <span style={{ color: daysToThreshold < 60 ? 'hsl(30 90% 60%)' : undefined }}>
                    {' '}· ~{daysToThreshold} days at current rate
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Viral alert(s) ── */}
      {viralDocs.length > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-sm"
             style={{ background: 'rgba(249,115,22,0.09)', border: '1px solid rgba(249,115,22,0.28)' }}>
          <p className="text-xs font-bold font-display mb-1"
             style={{ color: 'hsl(30 90% 62%)' }}>
            🔥 Trending document{viralDocs.length > 1 ? 's' : ''} — monitor your threshold
          </p>
          {viralDocs.map(d => (
            <p key={d.documentId} className="text-xs text-muted-foreground mt-0.5 font-body">
              <span className="font-medium" style={{ color: 'hsl(40 20% 78%)' }}>
                "{d.title}"
              </span>
              {' '}— {d.last7dUnlocks} unlocks in the last 7 days
              {d.prior23dUnlocks > 0 && ` (vs ${d.prior23dUnlocks} in the prior 23)`}
            </p>
          ))}
          {daysToThreshold !== null && daysToThreshold < 90 && (
            <p className="text-xs mt-2 font-body" style={{ color: 'hsl(30 90% 62%)' }}>
              At this rate you could reach your threshold in roughly {daysToThreshold} days.
            </p>
          )}
        </div>
      )}

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="border-t px-4 pt-4 pb-4 space-y-4"
             style={{ borderColor: cfg.border }}>

          {/* Plain-English guidance */}
          <div className="p-3 rounded-sm"
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold font-display mb-1.5" style={{ color: 'hsl(40 20% 80%)' }}>
              What does this mean for you?
            </p>
            {status === 'clear' && (
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                You're well within your country's tax-free allowance. No action needed right now.
                We'll tell you the moment that changes.
              </p>
            )}
            {status === 'watching' && (
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                Your earnings are growing — nothing to declare yet, but worth knowing your threshold.
                If a document goes viral, things can move fast.
              </p>
            )}
            {(status === 'approaching' || status === 'action') && (
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                You're close to the {thr.note} for {thr.name}.
                Above {thr.symbol}{thr.threshold.toLocaleString()} you should declare this income — it doesn't
                necessarily mean you'll pay tax (other allowances may apply), but you do need to report it.
                {thr.selfAssessmentUrl && (
                  <> <a href={thr.selfAssessmentUrl} target="_blank" rel="noopener noreferrer"
                       style={{ color: 'hsl(42 88% 55%)' }}>
                    Learn more ↗
                  </a></>
                )}
              </p>
            )}
            {status === 'over' && (
              <div className="text-xs leading-relaxed font-body space-y-2">
                <p style={{ color: 'hsl(0 80% 70%)' }}>
                  Your curIosities earnings have exceeded the {thr.note}
                  ({thr.symbol}{thr.threshold.toLocaleString()}) for this tax year.
                  You should register for Self Assessment (or your country's equivalent) and declare
                  this as income if you haven't already.
                </p>
                <p className="text-muted-foreground">
                  <strong style={{ color: 'hsl(40 20% 72%)' }}>Important note on BSV:</strong>{' '}
                  HMRC (and most tax authorities) treat crypto received as income at the market value
                  on the day you receive it — not what it's worth today. Your downloaded statement
                  shows approximate GBP values; verify against actual BSV prices for your official return.
                </p>
                {thr.selfAssessmentUrl && (
                  <a href={thr.selfAssessmentUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-block font-medium"
                     style={{ color: 'hsl(42 88% 55%)' }}>
                    {thr.name} guidance →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Per-document breakdown */}
          {docSummaries.length > 0 && (
            <div>
              <p className="text-xs font-bold font-display mb-2" style={{ color: 'hsl(40 20% 78%)' }}>
                Breakdown by document — {new Date().getFullYear()}
              </p>
              <div className="space-y-1.5">
                {docSummaries.map(doc => {
                  const localVal = bsvPriceGbp > 0
                    ? (doc.totalBsv * bsvPriceGbp / fx).toFixed(2)
                    : '—';
                  const isViral = viralDocs.some(v => v.documentId === doc.documentId);
                  return (
                    <div key={doc.documentId}
                         className="flex items-center justify-between gap-2 py-1"
                         style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isViral && <span className="text-[10px]">🔥</span>}
                        <p className="text-xs text-muted-foreground truncate font-body">{doc.title}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-body">
                          {doc.totalUnlocks} unlock{doc.totalUnlocks !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs font-mono font-bold"
                              style={{ color: 'hsl(42 88% 60%)' }}>
                          {thr.symbol}{localVal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tax year + disclaimer */}
          <p className="text-[10px] text-muted-foreground leading-relaxed font-body">
            {thr.taxYear && (
              <><strong style={{ color: 'hsl(40 20% 60%)' }}>Tax year:</strong> {thr.taxYear} &nbsp;·&nbsp;</>
            )}
            <strong style={{ color: 'hsl(40 20% 60%)' }}>Threshold:</strong> {thr.note}
            &nbsp;·&nbsp; curIosities is not a tax adviser. Figures are approximate.
            Always consult a qualified accountant for your personal situation.
          </p>

          {/* Download */}
          <Button
            onClick={downloadStatement}
            size="sm"
            variant="outline"
            className="w-full font-body text-xs gap-2"
            style={{ borderColor: 'hsl(38 35% 32%)', color: 'hsl(42 88% 58%)' }}
          >
            <Download className="h-3.5 w-3.5" />
            Download Annual Earnings Statement (CSV)
          </Button>

          {unlocks.length === 0 && (
            <p className="text-xs text-center text-muted-foreground font-body pt-1">
              No earnings yet — your statement will populate as documents are unlocked.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
