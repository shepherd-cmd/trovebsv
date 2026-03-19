import { useState } from "react";
import { Coins, BookOpen, Shield, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTroveStore } from "@/store/useTroveStore";
import { ENTRY_FEE_GBP, ENTRY_CREDITS } from "@/lib/handcash";

interface EntryPaywallProps {
  onComplete: () => void;
}

export const EntryPaywall = ({ onComplete }: EntryPaywallProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setHasPaidEntryFee, setInscriptionCredits } = useTroveStore();

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      // TODO: Integrate Stripe or HandCash fiat gateway here.
      // On success from the payment provider:
      //   1. Call the 'purchase-credits' edge function to record payment + credit user
      //   2. Edge function sets profiles.has_paid_entry_fee = true and inscription_credits += ENTRY_CREDITS
      //   3. Also converts 50% of £3.99 to BSV and deposits into user's inscription credit pool

      // Simulated success for now — remove this block once payment gateway is integrated
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            has_paid_entry_fee: true,
            inscription_credits: ENTRY_CREDITS,
          })
          .eq('id', user.id);
      }

      setHasPaidEntryFee(true);
      setInscriptionCredits(ENTRY_CREDITS);

      toast.success(`Welcome to Trove! You have ${ENTRY_CREDITS} inscription credits ready.`);
      onComplete();
    } catch (error) {
      console.error('Entry fee error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(20, 15, 10, 0.92)' }}
    >
      <div
        className="relative max-w-md w-full parchment-card p-8 shadow-glow-strong animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div
            className="p-5 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139, 90, 0, 0.2) 0%, transparent 70%)' }}
          >
            <BookOpen className="h-14 w-14 brass-glow" style={{ color: 'hsl(38 60% 45%)' }} />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-center mb-2 text-primary brass-glow">
          Unlock the Archive
        </h2>
        <p className="text-center text-muted-foreground font-body mb-8">
          One-time access. Preserve history. Earn forever.
        </p>

        {/* What you get */}
        <div
          className="mb-6 p-4 rounded-sm space-y-3"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 90, 0, 0.08) 0%, rgba(218, 165, 32, 0.04) 100%)',
            border: '1px solid hsl(38 35% 35% / 0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <Archive className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'hsl(42 88% 55%)' }} />
            <p className="text-sm font-body text-card-foreground">
              <span className="font-bold">{ENTRY_CREDITS} inscription credits</span> — upload your first curiosities to the BSV blockchain
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Coins className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'hsl(42 88% 55%)' }} />
            <p className="text-sm font-body text-card-foreground">
              <span className="font-bold">Earn perpetual royalties</span> — 80% of every unlock goes to you, forever
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-0.5 shrink-0" style={{ color: 'hsl(42 88% 55%)' }} />
            <p className="text-sm font-body text-card-foreground">
              <span className="font-bold">AI-indexed by Gorilla Pool</span> — your uploads become a queryable dataset
            </p>
          </div>
        </div>

        {/* Price split explanation */}
        <div
          className="mb-6 p-3 rounded-sm text-center"
          style={{
            background: 'rgba(139, 90, 0, 0.06)',
            border: '1px solid hsl(38 35% 35% / 0.2)',
          }}
        >
          <p className="text-xs text-muted-foreground font-body">
            Your <span className="font-bold text-card-foreground">£{ENTRY_FEE_GBP}</span> splits 50/50:&nbsp;
            <span className="font-bold text-card-foreground">£{(ENTRY_FEE_GBP / 2).toFixed(2)}</span> funds the platform
            &nbsp;+&nbsp;
            <span className="font-bold text-card-foreground">£{(ENTRY_FEE_GBP / 2).toFixed(2)}</span> becomes your BSV upload credits
          </p>
        </div>

        {/* Purchase button */}
        <Button
          onClick={handlePurchase}
          disabled={isProcessing}
          className="w-full py-6 text-lg font-display font-bold"
          style={{
            background: isProcessing
              ? 'hsl(38 35% 30%)'
              : 'linear-gradient(135deg, hsl(38 60% 45%) 0%, hsl(38 50% 35%) 100%)',
            boxShadow: '0 4px 12px rgba(139, 90, 0, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          <Coins className="mr-2 h-5 w-5" />
          {isProcessing ? 'Processing...' : `Begin – £${ENTRY_FEE_GBP}`}
        </Button>

        <p className="text-center text-xs text-muted-foreground font-body mt-4">
          One-time fee · No subscription · Buy more credits anytime at £0.79 each
        </p>
      </div>
    </div>
  );
};
