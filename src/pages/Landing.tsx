import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTroveStore } from "@/store/useTroveStore";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Search, Zap, FileText, Lock, Clock } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { StepModal } from "@/components/StepModal";
import { playStepSound } from "@/utils/stepSounds";
import { AmbientSound } from "@/components/AmbientSound";
import { EntryPaywall } from "@/components/EntryPaywall";
import { supabase } from "@/integrations/supabase/client";
import { getBsvGbpPrice, satsToGbp } from "@/utils/bsvPrice";
import { useHandCash } from "@/contexts/HandCashContext";

// ── Recently Uploaded ─────────────────────────────────────────────────────────

const UNLOCK_PRICE_SATS = 300;

interface RecentDoc {
  id: string;
  title: string;
  image_url: string;
  category: string;
  owner_paymail: string;
  rarity_score: number;
  created_at: string;
  ai_analysis?: { teaser?: string } | null;
}

const PLACEHOLDERS: RecentDoc[] = [
  {
    id: 'demo-1',
    title: 'Love letter home from the Western Front, 1917',
    category: 'WW1 Correspondence',
    image_url: 'https://picsum.photos/seed/ww1letter/600/600',
    owner_paymail: '$archive_demo',
    rarity_score: 87,
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    ai_analysis: { teaser: "He wrote it in a shell crater with borrowed ink, not knowing if he'd ever send it. She kept it in her apron pocket for 60 years." },
  },
  {
    id: 'demo-2',
    title: 'Victorian family portrait, Sheffield 1887',
    category: 'Victorian Photography',
    image_url: 'https://picsum.photos/seed/victorian1887/600/600',
    owner_paymail: '$archive_demo',
    rarity_score: 74,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    ai_analysis: { teaser: "Seven faces. Six survive the decade. The youngest child — not yet two — would go on to become one of Sheffield's most wanted men." },
  },
  {
    id: 'demo-3',
    title: 'WW2 ration book and identity card, Liverpool 1943',
    category: 'WW2 Home Front',
    image_url: 'https://picsum.photos/seed/rationbook43/600/600',
    owner_paymail: '$archive_demo',
    rarity_score: 91,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    ai_analysis: { teaser: "Margaret Doyle fed four children on coupons worth less than a modern supermarket receipt. Every counterfoil tells you exactly what survival tasted like." },
  },
];

function RecentlyUploaded() {
  const [docs, setDocs]             = useState<RecentDoc[]>([]);
  const [unlockGbp, setUnlockGbp]   = useState<string>('...');
  const [bsvPrice, setBsvPrice]     = useState(0);
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<RecentDoc | null>(null);
  const [paying, setPaying]         = useState(false);
  const [rotation]                  = useState(() =>
    Array.from({ length: 6 }, () => (Math.random() * 6 - 3).toFixed(1))
  );

  const { isConnected, splitPayment, userPaymail } = useHandCash();

  useEffect(() => {
    supabase
      .from('documents')
      .select('id, title, image_url, category, owner_paymail, rarity_score, created_at, ai_analysis')
      .eq('delisted', false)
      .eq('status', 'inscribed')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setDocs(data as RecentDoc[]); });

    getBsvGbpPrice().then(price => {
      setBsvPrice(price);
      setUnlockGbp(satsToGbp(UNLOCK_PRICE_SATS, price));
    });
  }, []);

  function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  const handleUncover = async () => {
    if (!selectedDoc) return;
    if (!isConnected) {
      // Not connected — open HandCash connect
      setSelectedDoc(null);
      return;
    }
    setPaying(true);
    try {
      const amountBsv = UNLOCK_PRICE_SATS / 1e8;
      await splitPayment(amountBsv, selectedDoc.owner_paymail || '$trove-business', `Unlock: ${selectedDoc.title}`);
      // Record the unlock in Supabase
      await supabase.from('document_unlocks').insert({
        document_id: selectedDoc.id,
        owner_share: amountBsv * 0.80,
        platform_share: amountBsv * 0.10,
        gorilla_pool_share: amountBsv * 0.10,
        amount_paid: amountBsv,
      });
      setSelectedDoc(null);
    } catch {
      // Payment failed — redirect to vault for full flow
    } finally {
      setPaying(false);
    }
  };

  const displayItems = docs.length > 0 ? docs : PLACEHOLDERS;

  return (
    <>
      <section className="pt-10 pb-4 px-0">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-1 px-1">
            <h2 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Recently Uploaded
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground font-body">Live</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6 px-1">
            Fresh curiosities from the archive — hover to peek, click to uncover
          </p>

          {/* Polaroid grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {displayItems.map((doc: any, i: number) => {
              const isReal    = !!doc.id;
              const isHovered = hoveredId === (doc.id ?? `ph-${i}`);
              return (
                <div
                  key={doc.id ?? `ph-${i}`}
                  className="relative"
                  style={{ transform: `rotate(${rotation[i]}deg)` }}
                  onMouseEnter={() => isReal && setHoveredId(doc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onTouchStart={() => isReal && setHoveredId(doc.id === hoveredId ? null : doc.id)}
                  onClick={() => {
                    if (!isReal) return;
                    if (hoveredId === doc.id) {
                      setSelectedDoc(doc);
                    } else {
                      setHoveredId(doc.id);
                    }
                  }}
                >
                  {/* Polaroid frame */}
                  <div
                    className="p-2.5 pb-9 relative transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'linear-gradient(145deg, #f5f0e8 0%, #ede8dc 100%)',
                      boxShadow: isHovered
                        ? '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(218,165,32,0.2)'
                        : '0 8px 24px rgba(0,0,0,0.4)',
                      transform: isHovered ? 'translateY(-6px) scale(1.03)' : undefined,
                    }}
                  >
                    {/* Image area */}
                    <div className="aspect-square overflow-hidden relative bg-stone-700">
                      {doc.image_url ? (
                        <img
                          src={doc.image_url}
                          alt={doc.title}
                          className="w-full h-full object-cover transition-all duration-500"
                          style={{
                            filter: 'blur(10px) brightness(0.45) sepia(0.4)',
                            transform: 'scale(1.12)',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-800">
                          <FileText className="h-8 w-8 text-stone-500" />
                        </div>
                      )}

                      {/* Default overlay — lock icon */}
                      {!isHovered && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="p-2.5 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(218,165,32,0.35)' }}
                          >
                            <Lock className="h-5 w-5" style={{ color: 'hsl(42 88% 60%)' }} />
                          </div>
                        </div>
                      )}

                      {/* Hover overlay — teaser + uncover prompt */}
                      {isHovered && isReal && (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center"
                          style={{ background: 'rgba(0,0,0,0.78)' }}
                        >
                          {doc.category && (
                            <p className="text-xs uppercase tracking-wider" style={{ color: 'hsl(42 88% 55%)' }}>
                              {doc.category}
                            </p>
                          )}
                          <p className="text-xs leading-snug italic" style={{ color: 'hsl(38 60% 88%)' }}>
                            {doc.ai_analysis?.teaser ?? doc.title}
                          </p>
                          <div
                            className="mt-1 px-3 py-1 text-xs font-bold font-display rounded-sm"
                            style={{
                              background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                              color: 'hsl(30 25% 10%)',
                              boxShadow: '0 2px 8px rgba(139,90,0,0.5)',
                            }}
                          >
                            Uncover {unlockGbp}
                          </div>
                        </div>
                      )}

                      {/* NEW badge */}
                      {isReal && (Date.now() - new Date(doc.created_at).getTime()) < 86400000 && (
                        <div
                          className="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-sm font-display"
                          style={{ background: 'hsl(42 88% 55%)', color: 'hsl(30 25% 10%)' }}
                        >
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Caption strip */}
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center">
                      <p
                        className="text-xs truncate"
                        style={{ color: 'hsl(25 30% 30%)', fontFamily: 'cursive' }}
                      >
                        {isReal ? (doc.title || 'Unknown') : doc.title}
                      </p>
                      {isReal && (
                        <p className="text-xs" style={{ color: 'hsl(25 20% 55%)' }}>
                          {timeAgo(doc.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {docs.length > 0 && (
            <div className="text-center mt-8">
              <Link
                to="/vault"
                className="text-sm font-semibold font-display"
                style={{ color: 'hsl(42 88% 55%)' }}
              >
                Browse the full archive →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Uncover modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
          onClick={() => !paying && setSelectedDoc(null)}
        >
          <div
            className="parchment-card p-6 max-w-xs w-full text-center"
            style={{
              border: '1px solid hsl(42 88% 55% / 0.4)',
              boxShadow: '0 0 40px rgba(218,165,32,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Blurred preview */}
            {selectedDoc.image_url && (
              <div className="w-full aspect-video overflow-hidden mb-4 rounded-sm relative">
                <img
                  src={selectedDoc.image_url}
                  className="w-full h-full object-cover"
                  style={{ filter: 'blur(12px) brightness(0.4)', transform: 'scale(1.1)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-8 w-8" style={{ color: 'hsl(42 88% 60%)' }} />
                </div>
              </div>
            )}

            <h3 className="text-base font-bold font-display text-primary mb-1">{selectedDoc.title}</h3>
            {selectedDoc.category && (
              <p className="text-xs text-muted-foreground mb-2">{selectedDoc.category}</p>
            )}
            {selectedDoc.ai_analysis?.teaser && (
              <p className="text-sm italic leading-snug mb-4 px-1" style={{ color: 'hsl(38 60% 78%)' }}>
                "{selectedDoc.ai_analysis.teaser}"
              </p>
            )}

            <div
              className="py-3 mb-4 rounded-sm"
              style={{ background: 'rgba(218,165,32,0.08)', border: '1px solid rgba(218,165,32,0.2)' }}
            >
              <p className="text-2xl font-bold font-display" style={{ color: 'hsl(42 88% 60%)' }}>
                {unlockGbp}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {UNLOCK_PRICE_SATS} sats · paid from your HandCash wallet
              </p>
              <p className="text-xs mt-1" style={{ color: 'hsl(42 88% 55%)' }}>
                80% goes directly to the uploader
              </p>
            </div>

            {isConnected ? (
              <button
                onClick={handleUncover}
                disabled={paying}
                className="w-full py-3 text-sm font-bold font-display rounded-sm transition-opacity disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                  color: 'hsl(30 25% 10%)',
                  boxShadow: '0 4px 12px rgba(139,90,0,0.4)',
                }}
              >
                {paying ? 'Processing…' : `Uncover for ${unlockGbp}`}
              </button>
            ) : (
              <Link
                to="/vault"
                onClick={() => setSelectedDoc(null)}
                className="block w-full py-3 text-sm font-bold font-display rounded-sm text-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                  color: 'hsl(30 25% 10%)',
                }}
              >
                Connect wallet to uncover
              </Link>
            )}

            <button
              onClick={() => setSelectedDoc(null)}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Feature Cards ─────────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    icon: Shield,
    title: "Immutable provenance",
    desc: "Court-grade proof, timestamped on BSV",
    synopsis: "The moment you upload something, Trove stamps it to the BSV blockchain — a public record that can never be altered, deleted, or faked. If someone ever asks \"is this genuine?\" — the blockchain answers for you. Permanently.",
  },
  {
    icon: Zap,
    title: "Instant micropayments",
    desc: "Fractions of a penny per page, paid in real time",
    synopsis: "Every time someone unlocks your upload — a historian, a documentary maker, a curious stranger — a small payment lands in your wallet automatically. No waiting, no invoices, no middleman. You upload once and earn forever.",
  },
  {
    icon: FileText,
    title: "Yours forever",
    desc: "No middleman, no rug-pull, no expiry",
    synopsis: "Your upload lives on the blockchain, not on Trove's servers. Even if Trove disappeared tomorrow, your document, your record, and your royalty rights would still exist. It's yours — and your family's — for as long as the internet exists.",
  },
];

function FeatureCards() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const activeCard = openIdx !== null ? FEATURE_CARDS[openIdx] : null;

  return (
    <>
      {/* Tiles — identical to original, just tappable */}
      <div className="grid md:grid-cols-3 gap-4">
        {FEATURE_CARDS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setOpenIdx(idx)}
            className="parchment-card p-6 text-center hover-brass group w-full tap-target flex flex-col items-center"
          >
            <item.icon
              className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform"
              style={{ color: 'hsl(42 95% 60%)' }}
            />
            <h3 className="text-base font-bold font-display mb-1 text-primary">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Modal overlay — appears when a tile is tapped */}
      {activeCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpenIdx(null)}
        >
          <div
            className="parchment-card p-7 max-w-sm w-full text-center"
            style={{
              border: '1px solid hsl(42 88% 55% / 0.5)',
              boxShadow: '0 0 40px rgba(218,165,32,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <activeCard.icon
              className="w-10 h-10 mx-auto mb-4"
              style={{ color: 'hsl(42 95% 60%)' }}
            />
            <h3 className="text-lg font-bold font-display mb-1 text-primary">{activeCard.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{activeCard.desc}</p>
            <div
              className="pt-4 text-sm leading-relaxed text-left"
              style={{
                borderTop: '1px solid hsl(42 88% 55% / 0.2)',
                color: 'hsl(30 20% 78%)',
              }}
            >
              {activeCard.synopsis}
            </div>
            <button
              onClick={() => setOpenIdx(null)}
              className="mt-5 text-xs font-display uppercase tracking-wider px-4 py-2 rounded-sm"
              style={{
                background: 'hsl(42 88% 55% / 0.15)',
                border: '1px solid hsl(42 88% 55% / 0.3)',
                color: 'hsl(42 88% 60%)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const Landing = () => {
  const navigate = useNavigate();
  const { hasPaidEntryFee } = useTroveStore();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showEntryPaywall, setShowEntryPaywall] = useState(false);
  const [royaltiesGbp, setRoyaltiesGbp] = useState<string | null>(null);

  // Fetch real total royalties paid to uploaders on mount
  useEffect(() => {
    Promise.all([
      supabase.from('document_unlocks').select('owner_share'),
      getBsvGbpPrice(),
    ]).then(([{ data }, price]) => {
      if (data) {
        const totalBsv = data.reduce((sum, row) => sum + Number(row.owner_share), 0);
        const gbp = totalBsv * price;
        setRoyaltiesGbp(gbp > 0 ? `£${gbp.toFixed(2)}` : null);
      }
    });
  }, []);

  const handleOpenCamera = () => {
    if (!hasPaidEntryFee) {
      setShowEntryPaywall(true);
      return;
    }
    navigate("/scan");
  };

  const handleStepClick = (step: number) => {
    playStepSound(step);
    setSelectedStep(step);
  };

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative" style={{ background: 'transparent' }}>
      {showEntryPaywall && (
        <EntryPaywall onComplete={() => { setShowEntryPaywall(false); navigate("/scan"); }} />
      )}
      <ParticleBackground />
      
      <div className="fixed top-0 left-0 right-0 z-50 leather-card border-b-2 border-brass-border/50 backdrop-blur-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end gap-6">
          <Link
            to="/legal"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform text-brass-bg" />
            <span className="text-sm font-semibold font-display">Legal</span>
          </Link>
          <Link
            to="/treasury"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform text-brass-bg" />
            <span className="text-sm font-semibold font-display">Treasury</span>
          </Link>
        </div>
      </div>


      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ paddingTop: 'max(5rem, calc(4rem + env(safe-area-inset-top)))' }}
      >
        {/* Hero glow orbs (supplement ParticleBackground) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full animate-pulse-brass"
            style={{ background: 'radial-gradient(circle, hsl(42 95% 60% / 0.06) 0%, transparent 65%)', filter: 'blur(60px)' }}
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16 flex flex-col items-center gap-8">
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{ background: 'hsl(42 95% 60% / 0.1)', border: '1px solid hsl(42 95% 60% / 0.25)', color: 'hsl(42 95% 65%)' }}>
            Bitcoin SV · Perpetual Royalties · AI-Indexed
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display leading-[1.08] text-foreground animate-fade-in"
            style={{ textShadow: '0 0 60px hsl(42 95% 60% / 0.2)', animationDelay: '0s' }}>
            Preserve history.<br />
            <span className="brass-glow">Earn forever.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed"
            style={{ animationDelay: '0.15s' }}>
            Scan rare documents, war letters, maps, and photographs from your collection.
            One tap inscribes them on the BSV blockchain — and you earn royalties every time
            researchers, historians, or AI companies access them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleOpenCamera}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl overflow-hidden hover:scale-[1.03] active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, hsl(42 95% 55%) 0%, hsl(38 90% 48%) 100%)',
                boxShadow: '0 0 32px hsl(42 95% 55% / 0.35), 0 4px 16px rgba(0,0,0,0.4)',
                color: 'hsl(222 18% 6%)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', backgroundSize: '200% 100%' }}
              />
              <span className="relative font-bold">Begin — £3.99</span>
            </button>

            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl transition-all duration-200 hover:bg-white/5"
              style={{ border: '1px solid hsl(222 14% 22%)', color: 'hsl(40 20% 75%)' }}
            >
              How it works
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-8 pt-4 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            {[
              { label: 'Indexed by', value: 'Gorilla Pool' },
              { label: 'Blockchain', value: 'BSV' },
              { label: 'Yours forever', value: '80%' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold" style={{ color: 'hsl(42 95% 65%)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-10 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            The Magic in 60 Seconds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              { step: 1, title: "Find", desc: "Dusty box in the loft", emoji: "📦" },
              { step: 2, title: "Scan", desc: "Phone captures every page", emoji: "📱" },
              { step: 3, title: "Own Forever", desc: "Inscribed on BSV #47291", emoji: "💎" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <button
                  onClick={() => handleStepClick(item.step)}
                  className="w-full parchment-card p-7 text-center group cursor-pointer transition-all hover:scale-[1.03] relative overflow-hidden"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Golden glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(218, 165, 32, 0.15) 0%, transparent 70%)',
                      boxShadow: 'inset 0 0 20px rgba(218, 165, 32, 0.3)',
                    }}
                  />
                  
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform relative z-10">{item.emoji}</div>
                  <h3 className="text-2xl font-bold font-display mb-2 brass-glow text-primary relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(218,165,32,0.6)] transition-all">
                    Step {item.step}: {item.title}
                  </h3>
                  <p className="text-muted-foreground text-lg relative z-10">{item.desc}</p>
                  
                  {/* Subtle golden underline on hover */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(90deg, transparent, hsl(42 88% 55%), transparent)',
                    }}
                  />
                </button>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary text-4xl brass-glow">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-8 leading-tight"
            style={{ background: 'linear-gradient(135deg, hsl(42 95% 65%), hsl(40 20% 85%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            95% of documents that shaped the 20th century are still in ordinary homes
          </h2>

          <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
            <p>D-Day maps. Resistance letters. Factory ledgers. Hand-drawn plans. The only surviving photos of forgotten regiments. Most will be thrown in a skip the day the last grandparent dies.</p>
            <p className="text-foreground/80 font-medium">Every scan you upload becomes immutably timestamped on BSV. Every time a historian, documentary maker, or AI lab reads a page — you get paid. Instantly. Forever.</p>
          </div>

          <p className="text-xl font-bold font-display brass-glow">Trove changes that.</p>
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            How You Earn
          </h2>

          <div className="leather-card p-8 mb-6 text-center animate-pulse-brass">
            <p className="text-sm text-muted-foreground mb-2 tracking-wide uppercase">Total royalties paid to uploaders</p>
            <p className="text-5xl md:text-6xl font-bold font-display brass-glow">
              {royaltiesGbp ?? '£0.00'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {royaltiesGbp ? 'and growing every unlock' : 'Be the first — upload a curiosity'}
            </p>
          </div>

          <FeatureCards />
        </div>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Discoverable the Second It's Uploaded
          </h2>
          <p className="text-center text-muted-foreground mb-8">Indexed by Gorilla Pool — searchable by historians, researchers, and AI</p>

          <div className="parchment-card p-6 mb-6 shadow-glow">
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(42 95% 60%)' }} />
              <input
                type="text"
                placeholder="Search the archive…"
                className="w-full rounded-lg py-3 pl-10 pr-4 text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                style={{ background: 'hsl(222 16% 7%)', border: '1px solid hsl(222 14% 20%)' }}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase">Popular searches</p>
              {["D-Day landing plans 1944", "Beatles handwritten lyrics 1965", "Sheffield factory ledger 1943", "Grandad's war diary Ypres"].map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-card-foreground hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ border: '1px solid hsl(222 14% 18%)' }}>
                  <Search className="w-3 h-3 shrink-0" style={{ color: 'hsl(42 95% 60%)' }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-5">Every rare scan = more discovery = more royalties</p>
            <button
              onClick={handleOpenCamera}
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, hsl(42 95% 55%) 0%, hsl(38 90% 48%) 100%)',
                color: 'hsl(222 18% 6%)',
                boxShadow: '0 0 24px hsl(42 95% 55% / 0.3)',
              }}
            >
              Start Scanning
            </button>
          </div>

          {/* Recently Uploaded — sits directly below search */}
          <RecentlyUploaded />

        </div>
      </section>

      <AmbientSound />

      {/* Step Modals */}
      <StepModal 
        isOpen={selectedStep !== null} 
        onClose={() => setSelectedStep(null)} 
        step={selectedStep || 1}
      />
    </div>
  );
};

export default Landing;
