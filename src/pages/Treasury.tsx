import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTroveStore } from "@/store/useTroveStore";
import { Button } from "@/components/ui/button";
import {
  LogOut, Home, RefreshCw, TrendingUp,
  FileText, Eye, Bot, Coins,
  Users, Unlock, Globe, ArrowUpRight,
} from "lucide-react";
import { getBsvGbpPrice, satsToGbp } from "@/utils/bsvPrice";

interface PlatformStats {
  documentsInscribed: number;
  totalHumanViews: number;
  totalAiCrawls: number;
  aiSatsEarned: number;
  totalUnlocks: number;
  totalRoyaltiesBsv: number;
  gorillaPoolBsv: number;
  payingArchivists: number;
  totalUsers: number;
  treasuryBsv: number;
}

interface RecentActivity {
  id: string;
  type: 'unlock' | 'inscription';
  label: string;
  amount?: number;
  created_at: string;
}

const EMPTY_STATS: PlatformStats = {
  documentsInscribed: 0,
  totalHumanViews: 0,
  totalAiCrawls: 0,
  aiSatsEarned: 0,
  totalUnlocks: 0,
  totalRoyaltiesBsv: 0,
  gorillaPoolBsv: 0,
  payingArchivists: 0,
  totalUsers: 0,
  treasuryBsv: 0,
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── Metric Card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value: string;
  subvalue?: string;
  accent: string;
  fillPct?: number;
  badge?: string;
}

function MetricCard({ icon, label, sublabel, value, subvalue, accent, fillPct, badge }: MetricCardProps) {
  return (
    <div
      className="relative flex flex-col p-5 rounded-sm overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20,14,8,0.92) 0%, rgba(30,20,12,0.88) 100%)',
        border: `1px solid ${accent}33`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${accent}18`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${accent}14 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-sm" style={{ background: `${accent}1a`, border: `1px solid ${accent}40` }}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-bold font-display uppercase tracking-wider" style={{ color: accent }}>
              {label}
            </p>
            <p className="text-xs text-muted-foreground font-body">{sublabel}</p>
          </div>
        </div>
        {badge && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-sm font-display"
            style={{ background: `${accent}2a`, color: accent, border: `1px solid ${accent}40` }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="relative z-10 mb-1">
        <span className="text-4xl font-bold font-display" style={{ color: accent }}>{value}</span>
      </div>
      {subvalue && (
        <p className="text-xs text-muted-foreground font-body relative z-10 mb-3">{subvalue}</p>
      )}
      {fillPct !== undefined && (
        <div className="mt-auto relative z-10 h-1.5 rounded-full overflow-hidden" style={{ background: `${accent}1a` }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(fillPct, 100)}%`, background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 100%)` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Treasury Page ─────────────────────────────────────────────────────────────

const Treasury = () => {
  const { user, setUser, setSession } = useTroveStore();
  const [stats, setStats]             = useState<PlatformStats>(EMPTY_STATS);
  const [activity, setActivity]       = useState<RecentActivity[]>([]);
  const [gbpPrice, setGbpPrice]       = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsSince, setSecondsSince] = useState(0);
  const navigate = useNavigate();

  // Track session for sign out button — but do NOT redirect if not logged in
  // Treasury is a public dashboard, anyone can view it
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setUser, setSession]);

  // "Xs ago" ticker
  useEffect(() => {
    const t = setInterval(() => setSecondsSince(
      Math.floor((Date.now() - lastUpdated.getTime()) / 1000)
    ), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  const loadStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [price, balanceRes] = await Promise.all([
        getBsvGbpPrice(),
        supabase.functions.invoke('get-treasury-balance'),
      ]);
      setGbpPrice(price);
      const treasuryBsv = balanceRes.data?.balanceBSV ?? 0;

      // All counters from platform_stats view — one round-trip
      const { data: row } = await supabase
        .from('platform_stats')
        .select('*')
        .single();

      if (row) {
        setStats({
          documentsInscribed: row.documents_inscribed    ?? 0,
          totalHumanViews:    Number(row.total_human_views ?? 0),
          totalAiCrawls:      Number(row.total_ai_crawls   ?? 0),
          aiSatsEarned:       Number(row.ai_sats_earned    ?? 0),
          totalUnlocks:       row.total_unlocks            ?? 0,
          totalRoyaltiesBsv:  Number(row.total_royalties_bsv ?? 0),
          gorillaPoolBsv:     Number(row.gorilla_pool_bsv    ?? 0),
          payingArchivists:   row.paying_archivists          ?? 0,
          totalUsers:         row.total_users                ?? 0,
          treasuryBsv,
        });
      }

      // Recent activity — last 6 unlocks + last 6 inscriptions, interleaved
      const [unlockRows, inscriptionRows] = await Promise.all([
        supabase.from('document_unlocks').select('id, created_at, owner_share')
          .order('created_at', { ascending: false }).limit(6),
        supabase.from('documents').select('id, title, created_at')
          .eq('delisted', false).order('created_at', { ascending: false }).limit(6),
      ]);

      const combined: RecentActivity[] = [
        ...(unlockRows.data ?? []).map(u => ({
          id: `unlock-${u.id}`, type: 'unlock' as const,
          label: 'Curiosity unlocked', amount: Number(u.owner_share),
          created_at: u.created_at,
        })),
        ...(inscriptionRows.data ?? []).map(d => ({
          id: `inscr-${d.id}`, type: 'inscription' as const,
          label: d.title ?? 'New inscription', created_at: d.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 10);

      setActivity(combined);
      setLastUpdated(new Date());
      setSecondsSince(0);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load stats for everyone — public dashboard
  useEffect(() => {
    loadStats();
    const t = setInterval(loadStats, 30_000);
    return () => clearInterval(t);
  }, [loadStats]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/");
  };

  // Public page — no auth required

  // Derived GBP figures
  const royaltiesGbp  = gbpPrice > 0
    ? `£${(stats.totalRoyaltiesBsv * gbpPrice).toFixed(2)}`
    : `${stats.totalRoyaltiesBsv.toFixed(6)} BSV`;

  const treasuryGbp   = gbpPrice > 0
    ? `£${(stats.treasuryBsv * gbpPrice).toFixed(2)}`
    : `${stats.treasuryBsv.toFixed(4)} BSV`;

  const aiEarnedGbp   = gbpPrice > 0 && stats.aiSatsEarned > 0
    ? satsToGbp(stats.aiSatsEarned, gbpPrice)
    : null;

  const conversionPct = stats.totalHumanViews > 0
    ? Math.min((stats.totalUnlocks / stats.totalHumanViews) * 100, 100)
    : 0;

  return (
    <div
      className="min-h-screen text-foreground relative"
      style={{ background: 'linear-gradient(180deg, hsl(25 30% 7%) 0%, hsl(25 25% 5%) 100%)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(218,165,32,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139,90,0,0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Header */}
      <header
        className="border-b border-brass-border/30 backdrop-blur-sm sticky top-0 z-20"
        style={{ background: 'rgba(18,12,6,0.94)', paddingTop: 'env(safe-area-inset-top)',
                 boxShadow: '0 1px 0 rgba(218,165,32,0.1)' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm"
                   style={{ background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.25)' }}>
                <TrendingUp className="h-5 w-5" style={{ color: 'hsl(42 88% 55%)' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display" style={{ color: 'hsl(42 88% 60%)' }}>
                  Treasury
                </h1>
                <p className="text-xs text-muted-foreground font-body">Live platform metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="hidden sm:flex">
                <Home className="mr-1.5 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
                Home
              </Button>
              {user && (
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-1.5 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Live ticker strip */}
        <div
          className="flex items-center gap-4 mb-6 px-4 py-2.5 rounded-sm overflow-x-auto"
          style={{ background: 'rgba(218,165,32,0.05)', border: '1px solid rgba(218,165,32,0.15)' }}
        >
          {[
            { label: 'Inscribed',  value: fmt(stats.documentsInscribed), icon: <FileText className="h-3.5 w-3.5" /> },
            { label: 'Views',      value: fmt(stats.totalHumanViews),    icon: <Eye      className="h-3.5 w-3.5" /> },
            { label: 'AI Crawls',  value: fmt(stats.totalAiCrawls),      icon: <Bot      className="h-3.5 w-3.5" /> },
            { label: 'Unlocks',    value: fmt(stats.totalUnlocks),       icon: <Unlock   className="h-3.5 w-3.5" /> },
            { label: 'Archivists', value: fmt(stats.payingArchivists),   icon: <Users    className="h-3.5 w-3.5" /> },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <span style={{ color: 'hsl(42 88% 50%)' }}>{item.icon}</span>
              <span className="text-xs text-muted-foreground font-body">{item.label}</span>
              <span className="text-sm font-bold font-display" style={{ color: 'hsl(42 88% 65%)' }}>
                {item.value}
              </span>
              {i < 4 && <span className="mx-1 text-muted-foreground/25">|</span>}
            </div>
          ))}

          <button
            onClick={loadStats}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 ml-auto flex-shrink-0 px-2.5 py-1 rounded-sm"
            style={{ background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.2)' }}
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ color: 'hsl(42 88% 55%)' }}
            />
            <span className="text-xs font-body" style={{ color: 'hsl(42 88% 55%)' }}>
              {isRefreshing ? 'Loading…' : `${secondsSince}s ago`}
            </span>
          </button>
        </div>

        {/* 2×2 Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <MetricCard
            icon={<FileText className="h-5 w-5" style={{ color: 'hsl(42 88% 55%)' }} />}
            label="Documents Inscribed"
            sublabel="Forever on BSV blockchain"
            value={fmt(stats.documentsInscribed)}
            subvalue={`${stats.totalUsers} users · ${stats.payingArchivists} paying archivists`}
            accent="hsl(42, 88%, 55%)"
            fillPct={(stats.documentsInscribed / Math.max(stats.payingArchivists * 5, 1)) * 100}
            badge="LIVE"
          />

          <MetricCard
            icon={<Eye className="h-5 w-5" style={{ color: 'hsl(200, 75%, 60%)' }} />}
            label="Human Views"
            sublabel="Unique document page views"
            value={fmt(stats.totalHumanViews)}
            subvalue={`${stats.totalUnlocks.toLocaleString()} paid unlocks · ${conversionPct.toFixed(1)}% conversion`}
            accent="hsl(200, 75%, 60%)"
            fillPct={conversionPct}
          />

          <MetricCard
            icon={<Bot className="h-5 w-5" style={{ color: 'hsl(160, 65%, 50%)' }} />}
            label="AI Crawls"
            sublabel="Gorilla Pool agent queries"
            value={fmt(stats.totalAiCrawls)}
            subvalue={aiEarnedGbp
              ? `${aiEarnedGbp} earned from AI micro-fees`
              : 'Micro-fees accumulate with each crawl'}
            accent="hsl(160, 65%, 50%)"
            fillPct={Math.min((stats.totalAiCrawls / 1000) * 100, 100)}
          />

          <MetricCard
            icon={<Coins className="h-5 w-5" style={{ color: 'hsl(38, 90%, 58%)' }} />}
            label="Royalties Paid Out"
            sublabel="80% of every unlock → uploader"
            value={royaltiesGbp}
            subvalue={`${stats.totalRoyaltiesBsv.toFixed(6)} BSV · Gorilla Pool: ${stats.gorillaPoolBsv.toFixed(6)} BSV`}
            accent="hsl(38, 90%, 58%)"
            fillPct={Math.min(stats.totalRoyaltiesBsv * 100, 100)}
            badge="80/10/10"
          />
        </div>

        {/* Platform Treasury — full width */}
        <div
          className="relative rounded-sm p-6 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(20,14,8,0.97) 0%, rgba(38,26,10,0.92) 100%)',
            border: '1px solid rgba(218,165,32,0.28)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(218,165,32,0.12)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(218,165,32,0.07) 0%, transparent 55%)' }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 28%) 100%)',
                  boxShadow: '0 6px 20px rgba(139,90,0,0.45)',
                }}
              >
                <Globe className="h-7 w-7" style={{ color: 'hsl(30 25% 10%)' }} />
              </div>
              <div>
                <p className="text-xs font-bold font-display uppercase tracking-widest mb-0.5"
                   style={{ color: 'hsl(42 88% 50%)' }}>
                  Platform Treasury
                </p>
                <p className="text-4xl font-bold font-display" style={{ color: 'hsl(42 88% 65%)' }}>
                  {treasuryGbp}
                </p>
                <p className="text-sm text-muted-foreground font-body mt-0.5">
                  {stats.treasuryBsv.toFixed(6)} BSV · Funds inscriptions & operations
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-muted-foreground font-body">Live · polls every 30s</span>
              </div>
              <div className="flex gap-6">
                {[
                  { pct: '80%', label: 'Uploaders',   color: 'hsl(38 90% 58%)' },
                  { pct: '10%', label: 'Trove',        color: 'hsl(42 88% 55%)' },
                  { pct: '10%', label: 'Gorilla Pool', color: 'hsl(160 65% 50%)' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold font-display" style={{ color: s.color }}>{s.pct}</p>
                    <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity feed */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold font-display" style={{ color: 'hsl(38 60% 50%)' }}>
              Recent Activity
            </h2>
            <span className="text-xs text-muted-foreground font-body">Last 10 events · live</span>
          </div>

          <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(139,90,0,0.18)' }}>
            {activity.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-body text-sm">
                No activity yet — be the first to inscribe a curiosity
              </div>
            ) : (
              activity.map((item, i) => {
                const isUnlock = item.type === 'unlock';
                const accent   = isUnlock ? 'hsl(42 88% 55%)' : 'hsl(200 75% 60%)';
                const Icon     = isUnlock ? Unlock : FileText;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 gap-3"
                    style={{
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent',
                      borderBottom: i < activity.length - 1 ? '1px solid rgba(139,90,0,0.08)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-sm flex-shrink-0"
                           style={{ background: `${accent}1a`, border: `1px solid ${accent}30` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
                      </div>
                      <span className="text-sm font-body text-foreground/75 truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.amount && item.amount > 0 && gbpPrice > 0 && (
                        <span className="text-sm font-bold font-display" style={{ color: accent }}>
                          +{satsToGbp(item.amount * 1e8, gbpPrice)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-body whitespace-nowrap">
                        {timeAgo(item.created_at)}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground/30" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Economics summary */}
        <div
          className="rounded-sm p-5"
          style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(139,90,0,0.12)' }}
        >
          <h3 className="text-xs font-bold font-display uppercase tracking-wider mb-3"
              style={{ color: 'hsl(38 60% 45%)' }}>
            How The Economics Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
            {[
              '£3.99 one-time entry → 5 inscription credits',
              '£0.79 per additional credit — top-up anytime',
              '80% of every unlock paid directly to the uploader',
              '10% to Trove treasury · 10% to Gorilla Pool indexing',
              'Fiat-fixed pricing — BSV volatility absorbed by platform',
              'AI agents pay micro-fees to crawl the archive',
              'All splits settle on-chain, fully transparent & auditable',
              'Uploader royalties continue forever — even after death',
            ].map((line, i) => (
              <p key={i} className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
                <span style={{ color: 'hsl(42 88% 55%)' }} className="mt-0.5 flex-shrink-0">·</span>
                {line}
              </p>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Treasury;
