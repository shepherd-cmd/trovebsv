import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DocumentUploadFlow from "@/components/DocumentUploadFlow";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { Book, LogOut, Upload, Trophy, Coins, FileText } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    // Only load user's own documents with full details including wallet_address and total_earnings
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setDocuments(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-brass-border/50 leather-card backdrop-blur-sm sticky top-0 z-10 shadow-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="h-10 w-10 text-primary brass-glow" />
              <div>
                <h1 className="text-3xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent">
                  Trove
                </h1>
                <p className="text-xs text-muted-foreground font-body">Preserve history, earn forever</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showUpload && (
          <div className="mb-8 max-w-2xl mx-auto">
            <DocumentUploadFlow onComplete={() => { setShowUpload(false); loadDocuments(); }} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="parchment-card p-6 hover-brass">
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-primary brass-glow" />
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Documents</p>
                <p className="text-3xl font-bold font-display text-primary">{documents.length}</p>
              </div>
            </div>
          </div>
          <div className="parchment-card p-6 hover-brass">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10 text-secondary brass-glow" />
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Avg Rarity</p>
                <p className="text-3xl font-bold font-display text-secondary">
                  {documents.length > 0
                    ? Math.round(documents.reduce((acc, d) => acc + d.rarity_score, 0) / documents.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="parchment-card p-6 hover-brass">
            <div className="flex items-center gap-3">
              <Coins className="h-10 w-10 text-accent brass-glow" />
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Total Value</p>
                <p className="text-3xl font-bold font-display text-accent">
                  {documents.reduce((acc, d) => acc + (d.price_per_page * d.total_pages || 0), 0).toFixed(4)} BSV
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div>
          <h2 className="text-3xl font-bold font-display mb-8 text-foreground brass-glow text-center">Your Collection</h2>
          {documents.length === 0 ? (
            <div className="text-center py-16 parchment-card shadow-glow-strong">
              <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-2xl font-semibold font-display mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-6 text-lg font-body">
                Start preserving history by uploading your first document
              </p>
              <Button onClick={() => setShowUpload(true)} size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 py-8 px-4"
              style={{
                background: 'linear-gradient(180deg, rgba(30, 20, 10, 0.3) 0%, rgba(40, 30, 20, 0.2) 100%)',
                backgroundImage: `
                  repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(139, 90, 0, 0.02) 50px, rgba(139, 90, 0, 0.02) 100px),
                  repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(139, 90, 0, 0.02) 50px, rgba(139, 90, 0, 0.02) 100px)
                `,
              }}
            >
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  category={doc.category}
                  imageUrl={doc.image_url}
                  rarityScore={doc.rarity_score}
                  usefulnessScore={doc.usefulness_score}
                  pricePerPage={doc.price_per_page}
                  totalPages={doc.total_pages}
                  createdAt={doc.created_at}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
