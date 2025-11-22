import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTroveStore } from "@/store/useTroveStore";
import { Book, LogOut, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultPolaroid } from "@/components/VaultPolaroid";
import { DocumentViewer } from "@/components/DocumentViewer";

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

const MyVault = () => {
  const { user, session, setUser, setSession, documents, setDocuments, selectedDocument, setSelectedDocument } = useTroveStore();
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
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'inscribed')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDocuments(data);
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
              >
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

      <main className="container mx-auto px-4 py-8">
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
            {/* Scattered Polaroids */}
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
