import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTroveStore } from "@/store/useTroveStore";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Book, LogOut, DoorOpen, Home } from "lucide-react";

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

const TheVault = () => {
  const { user, session, setUser, setSession } = useTroveStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [unlockedDocIds, setUnlockedDocIds] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setUser, setSession]);

  useEffect(() => {
    if (user) {
      loadAllDocuments();
      loadUnlockedDocuments();
    }
  }, [user]);

  const loadAllDocuments = async () => {
    // Load ALL documents from ALL users, ordered by creation date
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDocuments(data);
    }
  };

  const loadUnlockedDocuments = async () => {
    // Get all documents the current user has unlocked
    const { data } = await supabase
      .from('document_unlocks')
      .select('document_id')
      .eq('user_id', user!.id);
    
    if (data) {
      setUnlockedDocIds(new Set(data.map(u => u.document_id)));
    }
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
      // Already unlocked or owns the document, show full view
      setSelectedDocument(doc);
      setShowViewer(true);
    } else {
      // Show paywall
      setSelectedDocument(doc);
      setShowPaywall(true);
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    setSelectedDocument(null);
  };

  const handleUnlocked = () => {
    setShowPaywall(false);
    setSelectedDocument(null);
    loadAllDocuments(); // Refresh to show updated earnings
    loadUnlockedDocuments(); // Refresh unlocked list
  };

  const handleViewerClose = () => {
    setShowViewer(false);
    setSelectedDocument(null);
  };

  // Generate random rotation between -3 and 3 degrees for each polaroid
  const getRotation = (index: number) => {
    const rotations = [-3, -2, -1, 0, 1, 2, 3];
    return rotations[index % rotations.length];
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen text-foreground relative"
      style={{
        background: 'linear-gradient(180deg, hsl(25 30% 12%) 0%, hsl(25 25% 8%) 100%)',
      }}
    >
      {/* Dust motes effect */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
              >
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

      <main className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold font-display mb-12 text-center brass-glow" style={{ color: 'hsl(38 60% 55%)' }}>
          Infinite Treasures Await
        </h2>

        {/* Polaroid Grid */}
        <div 
          className="relative min-h-screen"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(60, 40, 20, 0.1) 100px, rgba(60, 40, 20, 0.1) 101px),
              repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(60, 40, 20, 0.1) 100px, rgba(60, 40, 20, 0.1) 101px)
            `,
          }}
        >
          {documents.length === 0 ? (
            <div className="text-center py-16 parchment-card shadow-glow-strong max-w-lg mx-auto">
              <Book 
                className="h-20 w-20 mx-auto mb-4 opacity-40" 
                style={{ color: 'hsl(38 35% 45%)', stroke: 'hsl(38 35% 45%)' }}
              />
              <h3 className="text-2xl font-semibold font-display mb-2">The Vault is Empty</h3>
              <p className="text-muted-foreground text-lg font-body">
                No treasures have been inscribed yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-8">
              {documents.map((doc, index) => {
                const isUnlocked = unlockedDocIds.has(doc.id);
                const isOwner = doc.user_id === user?.id;
                const rotation = getRotation(index);

                return (
                  <div
                    key={doc.id}
                    className="relative cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                    }}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    {/* Polaroid Frame */}
                    <div 
                      className={`p-3 ${isUnlocked || isOwner ? 'bg-gradient-to-br from-amber-100 to-yellow-50' : 'bg-gradient-to-br from-gray-100 to-gray-50'} shadow-2xl`}
                      style={{
                        boxShadow: isUnlocked || isOwner 
                          ? '0 15px 40px rgba(139, 90, 0, 0.3), inset 0 0 20px rgba(218, 165, 32, 0.2)'
                          : '0 15px 40px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-gray-200 relative">
                        <img
                          src={doc.image_url}
                          alt={doc.title}
                          className="w-full h-full object-cover"
                          style={{
                            filter: isUnlocked || isOwner ? 'sepia(0.2)' : 'blur(4px) brightness(0.6) sepia(0.4)',
                          }}
                        />
                        
                        {/* Unlock Ribbon */}
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
                            Unlock 300 sats
                          </div>
                        )}

                        {/* Gold Frame Overlay for Unlocked */}
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

                      {/* Label */}
                      <div className="mt-3 text-center">
                        <p 
                          className="font-handwriting text-sm"
                          style={{ color: 'hsl(25 30% 20%)' }}
                        >
                          {doc.title}
                        </p>
                        <p 
                          className="font-body text-xs mt-1"
                          style={{ color: 'hsl(25 20% 40%)' }}
                        >
                          {doc.category}
                        </p>
                        {(isOwner && doc.total_earnings > 0) && (
                          <p 
                            className="font-display text-xs mt-1 font-bold"
                            style={{ color: 'hsl(42 88% 45%)' }}
                          >
                            Earned: {doc.total_earnings.toFixed(8)} BSV
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Paywall Overlay */}
      {showPaywall && selectedDocument && (
        <PaywallOverlay
          document={selectedDocument}
          onClose={handlePaywallClose}
          onUnlocked={handleUnlocked}
        />
      )}

      {/* Document Viewer */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={handleViewerClose}
        />
      )}
    </div>
  );
};

export default TheVault;
