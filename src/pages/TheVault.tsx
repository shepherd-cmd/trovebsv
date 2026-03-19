import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTroveStore } from "@/store/useTroveStore";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Book, LogOut, Home, Search, Clock, Star, DoorOpen } from "lucide-react";
import { getBsvGbpPrice, satsToGbp } from "@/utils/bsvPrice";

interface Document {
  id: string;
  title: string;
  image_url: string;
  category: string;
  user_id: string;
  total_earnings: number;
  created_at: string;
  inscription_txid: string | null;
  rarity_score: number;
  price_per_page: number;
  total_pages: number;
}

const UNLOCK_PRICE_SATS = 300;

const TheVault = () => {
  const { user, setUser, setSession } = useTroveStore();
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [unlockedDocIds, setUnlockedDocIds] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockPriceGbp, setUnlockPriceGbp] = useState<string>("...");
  const navigate = useNavigate();

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
      loadAllDocuments();
      loadUnlockedDocuments();
    }
  }, [user]);

  useEffect(() => {
    getBsvGbpPrice().then(price => {
      setUnlockPriceGbp(satsToGbp(UNLOCK_PRICE_SATS, price));
    });
  }, []);

  const loadAllDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('delisted', false)
      .order('created_at', { ascending: false });

    if (data) setAllDocuments(data);
  };

  const loadUnlockedDocuments = async () => {
    const { data } = await supabase
      .from('document_unlocks')
      .select('document_id')
      .eq('user_id', user!.id);

    if (data) setUnlockedDocIds(new Set(data.map(u => u.document_id)));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/");
  };

  const handleDocumentClick = (doc: Document) => {
    const isUnlocked = unlockedDocIds.has(doc.id);
    if (isUnlocked || doc.user_id === user?.id) {
      setSelectedDocument(doc);
      setShowViewer(true);
    } else {
      setSelectedDocument(doc);
      setShowPaywall(true);
    }
  };

  const handleUnlocked = () => {
    setShowPaywall(false);
    setSelectedDocument(null);
    loadAllDocuments();
    loadUnlockedDocuments();
  };

  const getRotation = (index: number) => {
    const rotations = [-3, -2, -1, 0, 1, 2, 3];
    return rotations[index % rotations.length];
  };

  // Derived lists
  const recentDocuments = [...allDocuments].slice(0, 50); // already sorted by created_at DESC
  const topRatedDocuments = [...allDocuments].sort((a, b) => b.rarity_score - a.rarity_score);
  const searchResults = searchQuery.trim().length > 0
    ? allDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDocuments;

  if (!user) return null;

  const renderGrid = (docs: Document[]) => (
    docs.length === 0 ? (
      <div className="text-center py-16 parchment-card shadow-glow-strong max-w-lg mx-auto">
        <Book
          className="h-20 w-20 mx-auto mb-4 opacity-40"
          style={{ color: 'hsl(38 35% 45%)', stroke: 'hsl(38 35% 45%)' }}
        />
        <h3 className="text-2xl font-semibold font-display mb-2">Nothing Here Yet</h3>
        <p className="text-muted-foreground text-lg font-body">
          Be the first to inscribe a curiosity
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8">
        {docs.map((doc, index) => {
          const isUnlocked = unlockedDocIds.has(doc.id);
          const isOwner = doc.user_id === user?.id;
          const rotation = getRotation(index);

          return (
            <div
              key={doc.id}
              className="relative cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105"
              style={{ transform: `rotate(${rotation}deg)` }}
              onClick={() => handleDocumentClick(doc)}
            >
              <div
                className={`p-3 ${isUnlocked || isOwner ? 'bg-gradient-to-br from-amber-100 to-yellow-50' : 'bg-gradient-to-br from-gray-100 to-gray-50'} shadow-2xl`}
                style={{
                  boxShadow: isUnlocked || isOwner
                    ? '0 15px 40px rgba(139, 90, 0, 0.3), inset 0 0 20px rgba(218, 165, 32, 0.2)'
                    : '0 15px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="aspect-square overflow-hidden bg-gray-200 relative">
                  <img
                    src={doc.image_url}
                    alt={doc.title}
                    className="w-full h-full object-cover"
                    style={{
                      filter: isUnlocked || isOwner ? 'sepia(0.2)' : 'blur(4px) brightness(0.6) sepia(0.4)',
                    }}
                  />

                  {!isUnlocked && !isOwner && (
                    <div
                      className="absolute top-2 right-2 px-3 py-1 text-xs font-bold font-display"
                      style={{
                        background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                        color: 'hsl(30 25% 10%)',
                        boxShadow: '0 2px 8px rgba(139, 90, 0, 0.4)',
                        transform: 'rotate(3deg)',
                      }}
                    >
                      Unlock {unlockPriceGbp}
                    </div>
                  )}

                  {(isUnlocked || isOwner) && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        border: '3px solid hsl(42 88% 55%)',
                        boxShadow: 'inset 0 0 20px rgba(218, 165, 32, 0.3)',
                      }}
                    />
                  )}
                </div>

                <div className="mt-3 text-center">
                  <p className="font-handwriting text-sm" style={{ color: 'hsl(25 30% 20%)' }}>
                    {doc.title}
                  </p>
                  <p className="font-body text-xs mt-1" style={{ color: 'hsl(25 20% 40%)' }}>
                    {doc.category}
                  </p>
                  {isOwner && doc.total_earnings > 0 && (
                    <p className="font-display text-xs mt-1 font-bold" style={{ color: 'hsl(42 88% 45%)' }}>
                      Earned: {doc.total_earnings.toFixed(8)} BSV
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )
  );

  return (
    <div
      className="min-h-screen text-foreground relative"
      style={{ background: 'linear-gradient(180deg, hsl(25 30% 12%) 0%, hsl(25 25% 8%) 100%)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(218, 165, 32, 0.02) 0%, transparent 50%)
          `,
        }}
      />

      {/* Header */}
      <header
        className="border-b-2 border-brass-border/50 leather-card backdrop-blur-sm sticky top-0 z-10 shadow-glow"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DoorOpen
                className="h-10 w-10 brass-glow"
                style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)' }}
              />
              <div>
                <h1 className="text-3xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent">
                  The Vault
                </h1>
                <p className="text-xs text-muted-foreground font-body">Treasures from all explorers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
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

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="mb-8 w-full sm:w-auto">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Archive
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recently Added
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
          </TabsList>

          {/* Browse Archive — with search */}
          <TabsContent value="browse">
            <div className="mb-8 max-w-xl">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: 'hsl(38 45% 55%)' }}
                />
                <Input
                  type="text"
                  placeholder='Search curiosities… "love letters 1940", "Victorian map"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-body"
                  style={{
                    background: 'hsl(25 25% 10%)',
                    border: '1px solid hsl(38 35% 35% / 0.5)',
                    color: 'hsl(38 30% 80%)',
                  }}
                />
              </div>
              {searchQuery && (
                <p className="mt-2 text-xs text-muted-foreground font-body">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
            </div>
            {renderGrid(searchResults)}
          </TabsContent>

          {/* Recently Added */}
          <TabsContent value="recent">
            <h2 className="text-2xl font-display font-bold mb-6 brass-glow" style={{ color: 'hsl(38 60% 55%)' }}>
              Freshly Inscribed
            </h2>
            {renderGrid(recentDocuments)}
          </TabsContent>

          {/* Top Rated */}
          <TabsContent value="top">
            <h2 className="text-2xl font-display font-bold mb-6 brass-glow" style={{ color: 'hsl(38 60% 55%)' }}>
              Highest Provenance Score
            </h2>
            {renderGrid(topRatedDocuments)}
          </TabsContent>
        </Tabs>
      </main>

      {showPaywall && selectedDocument && (
        <PaywallOverlay
          document={selectedDocument}
          onClose={() => { setShowPaywall(false); setSelectedDocument(null); }}
          onUnlocked={handleUnlocked}
        />
      )}

      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => { setShowViewer(false); setSelectedDocument(null); }}
        />
      )}
    </div>
  );
};

export default TheVault;
