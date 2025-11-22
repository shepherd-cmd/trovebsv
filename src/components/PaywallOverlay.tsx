import { X, Lock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaywallOverlayProps {
  document: {
    id: string;
    title: string;
    image_url: string;
    category: string;
    user_id: string;
  };
  onClose: () => void;
  onUnlocked: () => void;
}

export const PaywallOverlay = ({ document, onClose, onUnlocked }: PaywallOverlayProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const unlockPrice = 300; // satoshis (~$0.10-$0.20)
  const bsvPrice = unlockPrice / 100000000; // Convert sats to BSV

  const handleUnlock = async () => {
    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to unlock documents");
        return;
      }

      // Calculate royalty split (80% owner, 20% platform)
      const ownerShare = bsvPrice * 0.8;
      const platformShare = bsvPrice * 0.2;

      // Create unlock record
      const { error: unlockError } = await supabase
        .from('document_unlocks')
        .insert({
          document_id: document.id,
          user_id: user.id,
          amount_paid: bsvPrice,
          owner_share: ownerShare,
          platform_share: platformShare,
        });

      if (unlockError) {
        if (unlockError.code === '23505') {
          toast.error("You've already unlocked this document!");
          onUnlocked();
          return;
        }
        throw unlockError;
      }

      // Update document total_earnings
      const { error: updateError } = await supabase.rpc(
        'increment_document_earnings',
        { 
          doc_id: document.id,
          amount: ownerShare 
        }
      );

      if (updateError) {
        console.error("Error updating earnings:", updateError);
      }

      toast.success("Document unlocked! Full resolution now available.");
      onUnlocked();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
      style={{
        background: 'rgba(20, 15, 10, 0.85)',
      }}
    >
      {/* Aged Parchment Modal */}
      <div 
        className="relative max-w-lg w-full parchment-card p-8 shadow-glow-strong animate-in zoom-in-95 duration-300"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120, 80, 40, 0.02) 2px, rgba(120, 80, 40, 0.02) 4px),
            radial-gradient(circle at 30% 40%, rgba(139, 90, 0, 0.03) 0%, transparent 50%)
          `,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/50 transition-all brass-glow"
        >
          <X className="h-5 w-5" style={{ color: 'hsl(38 60% 45%)' }} />
        </button>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="p-6 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139, 90, 0, 0.15) 0%, transparent 70%)',
            }}
          >
            <Lock 
              className="h-16 w-16 brass-glow" 
              style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)' }}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-display font-bold text-center mb-2 text-primary brass-glow">
          Unlock This Treasure
        </h2>
        
        <p className="text-center text-muted-foreground font-body mb-6">
          Gain permanent access to the full-resolution artifact
        </p>

        {/* Preview Thumbnail */}
        <div 
          className="relative aspect-[4/3] rounded-sm overflow-hidden mb-6 border-2"
          style={{ 
            borderColor: 'hsl(38 35% 35%)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <img
            src={document.image_url}
            alt={document.title}
            className="w-full h-full object-cover"
            style={{
              filter: 'blur(8px) brightness(0.7) sepia(0.3)',
            }}
          />
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
            }}
          >
            <Lock 
              className="h-12 w-12" 
              style={{ color: 'hsl(38 60% 65%)', stroke: 'hsl(38 60% 65%)' }}
            />
          </div>
        </div>

        {/* Document Info */}
        <div className="mb-6 text-center">
          <h3 className="font-handwriting text-2xl text-card-foreground mb-2">
            {document.title}
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            {document.category}
          </p>
        </div>

        {/* Price Display */}
        <div 
          className="mb-6 p-4 rounded-sm text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 90, 0, 0.1) 0%, rgba(218, 165, 32, 0.05) 100%)',
            border: '1px solid hsl(38 35% 35% / 0.3)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins 
              className="h-5 w-5" 
              style={{ color: 'hsl(42 88% 55%)' }}
            />
            <span className="text-2xl font-bold font-display" style={{ color: 'hsl(42 88% 55%)' }}>
              {unlockPrice} satoshis
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            ≈ ${(unlockPrice * 0.0004).toFixed(2)} USD • {bsvPrice.toFixed(8)} BSV
          </p>
          <p className="text-xs text-muted-foreground font-body mt-2">
            80% to creator, 20% to platform treasury
          </p>
        </div>

        {/* Unlock Button */}
        <Button
          onClick={handleUnlock}
          disabled={isProcessing}
          className="w-full py-6 text-lg font-display font-bold"
          style={{
            background: 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
            boxShadow: '0 4px 12px rgba(139, 90, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
          }}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" />
              Unlock Forever
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground font-body mt-4">
          One-time payment • Permanent access • Stored in your vault
        </p>
      </div>
    </div>
  );
};
