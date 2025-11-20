import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Upload, Trophy } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
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
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDocuments(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  BSV Archive
                </h1>
                <p className="text-xs text-muted-foreground">Preserve history, earn forever</p>
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
            <DocumentUpload />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rarity</p>
                <p className="text-2xl font-bold">
                  {documents.length > 0
                    ? Math.round(documents.reduce((acc, d) => acc + d.rarity_score, 0) / documents.length)
                    : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {documents.reduce((acc, d) => acc + (d.price_per_page * d.total_pages || 0), 0).toFixed(4)} BSV
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Documents</h2>
          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gradient-card border border-border/50 rounded-lg">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-6">
                Start preserving history by uploading your first document
              </p>
              <Button onClick={() => setShowUpload(true)} className="bg-gradient-primary hover:opacity-90">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
