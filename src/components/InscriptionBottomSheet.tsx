import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface InscriptionBottomSheetProps {
  onClose: () => void;
  onInscribe: (title: string) => void;
  feeSats?: number;
  feeGbp?: string;
}

export const InscriptionBottomSheet = ({ onClose, onInscribe, feeSats, feeGbp }: InscriptionBottomSheetProps) => {
  const [title, setTitle] = useState("");

  const handleInscribe = () => {
    if (!title.trim()) {
      toast.error("Please give your treasure a name");
      return;
    }
    onInscribe(title);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[91] animate-slide-up"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div className="parchment-card rounded-t-3xl shadow-glow-strong max-w-2xl mx-auto">
          {/* Handle bar */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 rounded-full opacity-40" style={{ backgroundColor: 'hsl(38 60% 45%)' }} />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'hsl(38 60% 45%)' }} />
          </button>

          <div className="px-6 pb-8">
            {/* Title */}
            <h2 className="text-3xl font-bold font-display mb-2 text-center brass-glow text-primary">
              Give Your Treasure a Name
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              This name will be inscribed forever on the blockchain
            </p>

            {/* Title Input */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Grandma's 1943 Love Letter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg py-6 bg-background/80 border-2 border-brass-border focus:border-primary transition-colors font-body"
                maxLength={100}
              />
            </div>

            {/* Split info */}
            <div
              className="mb-6 p-4 rounded-sm text-center text-xs font-body text-muted-foreground space-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 90, 0, 0.08) 0%, rgba(218, 165, 32, 0.04) 100%)',
                border: '1px solid hsl(38 35% 35% / 0.25)',
              }}
            >
              <p className="font-semibold font-display text-sm" style={{ color: 'hsl(38 60% 45%)' }}>
                Every 3p unlock is split on-chain — forever
              </p>
              <p>80% to you · 10% to curIosities · 10% to Gorilla Pool</p>
              <p className="opacity-70">This split is immutable. No one can change it.</p>
            </div>

            {/* Inscribe Button */}
            <button
              onClick={handleInscribe}
              className="w-full py-5 rounded-lg font-display font-bold text-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(145deg, hsl(38 60% 50%), hsl(38 60% 35%))',
                boxShadow: '0 6px 24px rgba(218, 165, 32, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 0 40px rgba(218, 165, 32, 0.3)',
                border: '3px solid hsl(38 70% 40%)',
                color: 'hsl(30 25% 10%)',
              }}
            >
              {feeSats
                ? `Inscribe Forever — ${feeSats.toLocaleString()} sats${feeGbp ? ` (${feeGbp})` : ''}`
                : 'Inscribe Forever'}
            </button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Fee scales with document size · Paid from your inscription balance
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
