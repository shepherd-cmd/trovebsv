import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Book, LogOut, Home, DoorOpen, TrendingUp, Users, Coins, Gift } from "lucide-react";

interface TreasuryStats {
  totalBsvInTreasury: number;
  totalTreasuresPreserved: number;
  totalRoyaltiesPaid: number;
  sponsoredInscriptionsLeft: number;
}

interface TreasuryTransaction {
  id: string;
  username: string;
  amount: number;
  transaction_type: string;
  created_at: string;
}

const Treasury = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<TreasuryStats>({
    totalBsvInTreasury: 0,
    totalTreasuresPreserved: 0,
    totalRoyaltiesPaid: 0,
    sponsoredInscriptionsLeft: 50,
  });
  const [recentTransactions, setRecentTransactions] = useState<TreasuryTransaction[]>([]);
  const [showDonationPrompt, setShowDonationPrompt] = useState(false);
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
      loadTreasuryStats();
    }
  }, [user]);

  const loadTreasuryStats = async () => {
    // Get treasury balance from HandCash
    const { data: balanceData } = await supabase.functions.invoke('get-treasury-balance');
    const treasuryBalanceBSV = balanceData?.balanceBSV || 0;

    // Get all document unlocks to calculate royalties
    const { data: unlocks } = await supabase
      .from('document_unlocks')
      .select('owner_share');

    // Get total number of documents
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    // Calculate total free inscriptions remaining across all Lifetime Archivists
    const { data: profiles } = await supabase
      .from('profiles')
      .select('free_inscriptions_remaining')
      .eq('lifetime_archivist', true);
    
    const totalFreeInscriptionsLeft = profiles?.reduce((sum, p) => sum + (p.free_inscriptions_remaining || 0), 0) || 0;

    // Get recent treasury transactions
    const { data: transactions } = await supabase
      .from('treasury_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactions) {
      setRecentTransactions(transactions);
    }

    // Show donation prompt if treasury is low
    if (treasuryBalanceBSV < 100) {
      setShowDonationPrompt(true);
    }

    if (unlocks) {
      const royaltiesTotal = unlocks.reduce((sum, unlock) => sum + Number(unlock.owner_share), 0);

      setStats({
        totalBsvInTreasury: treasuryBalanceBSV,
        totalTreasuresPreserved: documentsCount || 0,
        totalRoyaltiesPaid: royaltiesTotal,
        sponsoredInscriptionsLeft: totalFreeInscriptionsLeft,
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen text-foreground relative"
      style={{
        background: 'linear-gradient(180deg, hsl(25 30% 12%) 0%, hsl(25 25% 8%) 100%)',
      }}
    >
      {/* Ambient dust effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, rgba(218, 165, 32, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(139, 90, 0, 0.02) 0%, transparent 50%)
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
              <div className="relative">
                <Coins 
                  className="h-10 w-10 brass-glow" 
                  style={{ color: 'hsl(42 88% 55%)', stroke: 'hsl(42 88% 55%)' }}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                  }}
                >
                  <TrendingUp className="h-3 w-3" style={{ color: 'hsl(30 25% 10%)' }} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display bg-gradient-primary bg-clip-text text-transparent">
                  Treasury
                </h1>
                <p className="text-xs text-muted-foreground font-body">Platform vault & statistics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/the-vault")}
              >
                <DoorOpen className="mr-2 h-4 w-4" style={{ color: 'hsl(38 60% 45%)' }} />
                The Vault
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/app")}
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6 relative">
            <div 
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(218, 165, 32, 0.2) 0%, transparent 70%)',
              }}
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                  boxShadow: '0 8px 24px rgba(139, 90, 0, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.2)',
                }}
              >
                <Coins className="h-12 w-12" style={{ color: 'hsl(30 25% 10%)' }} />
              </div>
            </div>
          </div>
          <h2 className="text-5xl font-bold font-display mb-4 brass-glow" style={{ color: 'hsl(38 60% 55%)' }}>
            Platform Treasury
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
            Every treasure unlocked contributes to preserving history forever. 
            Watch as the vault grows with each discovery.
          </p>
        </div>

        {/* Stats Gauges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Total BSV in Treasury */}
          <div 
            className="parchment-card p-8 relative overflow-hidden group hover-brass"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 40%, rgba(139, 90, 0, 0.05) 0%, transparent 50%)
              `,
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, hsl(42 88% 55% / 0.2) 0%, hsl(42 88% 45% / 0.1) 100%)',
                    }}
                  >
                    <Coins className="h-8 w-8" style={{ color: 'hsl(42 88% 55%)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground font-display">Total BSV</h3>
                    <p className="text-xs text-muted-foreground/60 font-body">Platform Treasury</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <div 
                  className="text-6xl font-bold font-display mb-2"
                  style={{ color: 'hsl(42 88% 55%)' }}
                >
                  {stats.totalBsvInTreasury.toFixed(6)}
                </div>
                <div className="text-2xl font-display text-muted-foreground">BSV</div>
                <div className="text-sm text-muted-foreground/70 mt-2 font-body">
                  ≈ ${(stats.totalBsvInTreasury * 50).toFixed(2)} USD
                </div>
              </div>

              {/* Decorative gauge bars */}
              <div className="space-y-2">
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(139, 90, 0, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((stats.totalBsvInTreasury / 1) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, hsl(42 88% 55%) 0%, hsl(42 88% 45%) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Treasures Preserved */}
          <div 
            className="parchment-card p-8 relative overflow-hidden group hover-brass"
            style={{
              backgroundImage: `
                radial-gradient(circle at 70% 30%, rgba(139, 90, 0, 0.05) 0%, transparent 50%)
              `,
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, hsl(38 60% 45% / 0.2) 0%, hsl(38 50% 35% / 0.1) 100%)',
                    }}
                  >
                    <Book className="h-8 w-8" style={{ color: 'hsl(38 60% 45%)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground font-display">Treasures Preserved</h3>
                    <p className="text-xs text-muted-foreground/60 font-body">Forever on blockchain</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <div 
                  className="text-6xl font-bold font-display mb-2"
                  style={{ color: 'hsl(38 60% 45%)' }}
                >
                  {stats.totalTreasuresPreserved.toLocaleString()}
                </div>
                <div className="text-2xl font-display text-muted-foreground">Documents</div>
                <div className="text-sm text-muted-foreground/70 mt-2 font-body">
                  Inscribed as 1-sat ordinals
                </div>
              </div>

              <div className="space-y-2">
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(139, 90, 0, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((stats.totalTreasuresPreserved / 1000) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Royalties Paid */}
          <div 
            className="parchment-card p-8 relative overflow-hidden group hover-brass"
            style={{
              backgroundImage: `
                radial-gradient(circle at 40% 60%, rgba(139, 90, 0, 0.05) 0%, transparent 50%)
              `,
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, hsl(35 45% 35% / 0.2) 0%, hsl(35 35% 25% / 0.1) 100%)',
                    }}
                  >
                    <Users className="h-8 w-8" style={{ color: 'hsl(35 45% 35%)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground font-display">Royalties Paid</h3>
                    <p className="text-xs text-muted-foreground/60 font-body">To archivists</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <div 
                  className="text-6xl font-bold font-display mb-2"
                  style={{ color: 'hsl(35 45% 35%)' }}
                >
                  {stats.totalRoyaltiesPaid.toFixed(6)}
                </div>
                <div className="text-2xl font-display text-muted-foreground">BSV</div>
                <div className="text-sm text-muted-foreground/70 mt-2 font-body">
                  80% goes to creators
                </div>
              </div>

              <div className="space-y-2">
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(139, 90, 0, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((stats.totalRoyaltiesPaid / 1) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, hsl(35 45% 35%) 0%, hsl(35 35% 25%) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sponsored Inscriptions */}
          <div 
            className="parchment-card p-8 relative overflow-hidden group hover-brass"
            style={{
              backgroundImage: `
                radial-gradient(circle at 60% 50%, rgba(139, 90, 0, 0.05) 0%, transparent 50%)
              `,
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, hsl(42 88% 55% / 0.2) 0%, hsl(38 60% 45% / 0.1) 100%)',
                    }}
                  >
                    <Gift className="h-8 w-8" style={{ color: 'hsl(42 88% 55%)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground font-display">Free Inscriptions</h3>
                    <p className="text-xs text-muted-foreground/60 font-body">Treasury sponsored</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <div 
                  className="text-6xl font-bold font-display mb-2"
                  style={{ color: 'hsl(42 88% 55%)' }}
                >
                  {stats.sponsoredInscriptionsLeft}
                </div>
                <div className="text-2xl font-display text-muted-foreground">Remaining</div>
                <div className="text-sm text-muted-foreground/70 mt-2 font-body">
                  Next batch resets soon
                </div>
              </div>

              <div className="space-y-2">
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(139, 90, 0, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(stats.sponsoredInscriptionsLeft / 50) * 100}%`,
                      background: 'linear-gradient(90deg, hsl(42 88% 55%) 0%, hsl(42 88% 45%) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Prompt */}
        {showDonationPrompt && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div 
              className="parchment-card p-8 text-center relative overflow-hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(218, 165, 32, 0.08) 0%, transparent 60%)
                `,
                border: '2px solid hsl(42 88% 55% / 0.3)',
              }}
            >
              <TrendingUp className="h-12 w-12 mx-auto mb-4" style={{ color: 'hsl(42 88% 55%)' }} />
              <h3 className="text-2xl font-bold font-display mb-2" style={{ color: 'hsl(42 88% 55%)' }}>
                Help Grow The Vault
              </h3>
              <p className="text-muted-foreground font-body mb-6">
                The treasury is running low. Your donation helps sponsor free inscriptions for new archivists and preserves history for future generations.
              </p>
              <Button 
                className="brass-button"
                onClick={() => {
                  // TODO: Implement donation flow
                  console.log('Donate clicked');
                }}
              >
                <Coins className="mr-2 h-4 w-4" />
                Contribute to Treasury
              </Button>
            </div>
          </div>
        )}

        {/* Recent Sponsored Inscriptions */}
        {recentTransactions.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold font-display mb-6 text-center" style={{ color: 'hsl(38 60% 45%)' }}>
              Recent Treasury Activity
            </h3>
            <div className="parchment-card p-6">
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      background: 'linear-gradient(90deg, rgba(139, 90, 0, 0.05) 0%, transparent 100%)',
                      borderLeft: '3px solid hsl(42 88% 55% / 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5" style={{ color: 'hsl(42 88% 55%)' }} />
                      <div>
                        <p className="font-body text-foreground">
                          Gifted Inscription to <span className="font-semibold">@{tx.username}</span>
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold font-body" style={{ color: 'hsl(42 88% 55%)' }}>
                        {Math.abs(tx.amount).toFixed(8)} BSV
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        ≈ ${(Math.abs(tx.amount) * 50).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="parchment-card p-8">
            <h3 className="text-2xl font-bold font-display mb-4" style={{ color: 'hsl(38 60% 45%)' }}>
              How The Treasury Works
            </h3>
            <div className="space-y-3 text-left text-muted-foreground font-body">
              <p>• 20% of every treasure unlock goes to the platform treasury</p>
              <p>• 80% goes directly to the archivist who preserved it</p>
              <p>• Treasury funds sponsor free inscriptions for new users</p>
              <p>• All funds remain on-chain, transparent and auditable</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Treasury;
