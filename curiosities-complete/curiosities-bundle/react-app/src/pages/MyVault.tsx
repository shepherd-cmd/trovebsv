import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTroveStore } from "@/store/useTroveStore";
import { Book, LogOut, Vault, Sparkles, Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultPolaroid } from "@/components/VaultPolaroid";
import { DocumentViewer } from "@/components/DocumentViewer";
import { INSCRIPTION_FEE_GBP } from "@/lib/metanet";
import { TaxAwarenessPanel } from "@/components/TaxAwarenessPanel";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  image_url: string;
  total_earnings: number;
  created_at: string;
  inscription_txid: string | null;
  category: string;
  rarity_score: number;
  price_per_page: number;
  total_pages: number;
}

const CREDIT_PACKAGES = [
  { id: 'topup',  credits: 10, priceGbp: 3.99, label: '10 Credits',  badge: 'Most Popular' },
  { id: 'bundle', credits: 25, priceGbp: 7.99, label: '25 Credits',  badge: 'Best Value'   },
];

const MyVault = () => {
  const {
    user, session, setUser, setSession,
    documents, setDocuments,
    selectedDocument, setSelectedDocument,
    inscriptionCredits, setInscriptionCredits,
  } = useTroveStore();
  const navigate = useNavigate();
  const [showTopUp, setShowTopUp] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate("/");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate, setUser, setSession]);

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadCredits();
    }
  }, [user]);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'inscribed')
      .order('created_at', { ascending: false });
    if (data) setDocuments(data);
  };

  const loadCredits = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('inscription_credits')
      .eq('id', user!.id)
      .single();
    if (data?.inscription_credits != null) {
      setInscriptionCredits(data.inscription_credits);
    }
  };

  const handlePurchase = async (pkgId: string) => {
    setPurchasing(pkgId);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-credits', {
        body: { packageId: pkgId, userId: user!.id },
      });
      if (error) throw error;
      setInscriptionCredits(data.newTotal);
      toast.success(`${data.creditsAdded} inscription credits added!`, {
        description: `You now have ${data.newTotal} credits ready to use.`,
      });
      setShowTopUp(false);
    } catch (err) {
      toast.error('Purchase failed', { description: 'Please try again or contact support.' });
    } finally {
      setPurchasing(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-brass-border/50 leather-card backdrop-blur-sm sticky top-0 z-10 shadow-glow"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vault
                className="h-10 w-10 brass-glow"
                style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)' }}
              />
              <div>
                <h1 className="text-3xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent">
                  My Vault
                </h1>
                <p className="text-xs text-muted-foreground font-body">
                  {documents.length} treasures preserved forever
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Book className="mr-2 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">

        {/* ── Credits Panel ── */}
        <div
          className="mb-6 p-4 rounded-sm flex items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 90, 0, 0.12) 0%, rgba(218, 165, 32, 0.06) 100%)',
            border: '1px solid hsl(38 60% 45% / 0.35)',
            boxShadow: '0 2px 12px rgba(139, 90, 0, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 flex-shrink-0" style={{ color: 'hsl(42 88% 55%)' }} />
            <div>
              <p className="text-sm font-bold font-display" style={{ color: 'hsl(42 88% 65%)' }}>
                {inscriptionCredits} Inscription {inscriptionCredits === 1 ? 'Credit' : 'Credits'} remaining
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Each credit inscribes one curiosity to the BSV blockchain · £{INSCRIPTION_FEE_GBP} each
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowTopUp(!showTopUp)}
            style={{
              background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
              color: 'hsl(30 25% 10%)',
              boxShadow: '0 2px 8px rgba(139, 90, 0, 0.4)',
              flexShrink: 0,
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Top Up
          </Button>
        </div>

        {/* ── Top-Up Packages ── */}
        {showTopUp && (
          <div
            className="mb-6 p-4 rounded-sm"
            style={{
              background: 'rgba(20, 14, 8, 0.85)',
              border: '1px solid hsl(38 60% 45% / 0.4)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 className="text-lg font-bold font-display mb-1" style={{ color: 'hsl(42 88% 60%)' }}>
              Buy Inscription Credits
            </h3>
            <p className="text-xs text-muted-foreground font-body mb-4">
              Credits never expire · Price is fixed in £ regardless of BSV price · Platform buys BSV on your behalf
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CREDIT_PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className="relative text-left p-4 rounded-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 90, 0, 0.15) 0%, rgba(218, 165, 32, 0.08) 100%)',
                    border: '1px solid hsl(38 60% 45% / 0.5)',
                    boxShadow: '0 4px 12px rgba(139, 90, 0, 0.2)',
                  }}
                >
                  {pkg.badge && (
                    <span
                      className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-sm"
                      style={{
                        background: 'hsl(42 88% 55%)',
                        color: 'hsl(30 25% 10%)',
                      }}
                    >
                      {pkg.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4" style={{ color: 'hsl(42 88% 55%)' }} />
                    <span className="font-bold font-display" style={{ color: 'hsl(42 88% 65%)' }}>
                      {pkg.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-display" style={{ color: 'hsl(30 25% 85%)' }}>
                    £{pkg.priceGbp}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    £{(pkg.priceGbp / pkg.credits).toFixed(2)} per inscription
                  </p>
                  {purchasing === pkg.id && (
                    <p className="text-xs mt-2" style={{ color: 'hsl(42 88% 55%)' }}>Processing…</p>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-body mt-3 text-center">
              Payment via Stripe · No subscription · Cancel anytime
            </p>
          </div>
        )}

        {/* ── Tax Awareness ── */}
        <TaxAwarenessPanel userId={user.id} />

        {/* ── Document Grid ── */}
        {documents.length === 0 ? (
          <div className="text-center py-16 parchment-card shadow-glow-strong">
            <Vault
              className="h-20 w-20 mx-auto mb-4 opacity-40"
              style={{ color: 'hsl(38 35% 45%)', stroke: 'hsl(38 35% 45%)' }}
            />
            <h3 className="text-2xl font-semibold font-display mb-2">Your vault is empty</h3>
            <p className="text-muted-foreground mb-6 text-lg font-body">
              Start capturing treasures to fill your collection
            </p>
            <Button onClick={() => navigate("/")} size="lg">
              Start Scanning
            </Button>
          </div>
        ) : (
          <div
            className="relative min-h-[600px] py-12"
            style={{
              background: 'linear-gradient(180deg, rgba(30, 20, 10, 0.4) 0%, rgba(40, 30, 20, 0.3) 100%)',
              backgroundImage: `
                repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(139, 90, 0, 0.03) 80px, rgba(139, 90, 0, 0.03) 160px),
                repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(139, 90, 0, 0.03) 80px, rgba(139, 90, 0, 0.03) 160px)
              `,
            }}
          >
            <div className="max-w-7xl mx-auto">
              {documents.map((doc, index) => (
                <VaultPolaroid
                  key={doc.id}
                  document={doc}
                  index={index}
                  onClick={() => setSelectedDocument(doc)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Full-screen viewer */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default MyVault;
