import { useEffect, useState } from "react";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InscriptionSuccessAnimationProps {
  onClose: () => void;
  documentTitle: string;
  txid?: string;
  treasurySponsored?: boolean;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

export const InscriptionSuccessAnimation = ({ 
  onClose, 
  documentTitle,
  txid,
  treasurySponsored = false
}: InscriptionSuccessAnimationProps) => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    // Generate gold coin confetti
    const newCoins = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 + Math.random() * 10,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
    }));
    setCoins(newCoins);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center overflow-hidden">
      {/* Gold coin confetti */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute pointer-events-none"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            animation: `fall-coin 3s ease-in forwards, spin-coin 1s linear infinite`,
            animationDelay: `${coin.delay}s`,
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, hsl(42 88% 65%), hsl(38 60% 45%))',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.2)',
            }}
          />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Success Icon */}
        <div className="mb-6 relative inline-block">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center animate-scale-in"
            style={{
              background: 'radial-gradient(circle, hsl(38 60% 50%), hsl(38 60% 35%))',
              boxShadow: '0 0 60px rgba(218, 165, 32, 0.8), 0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            <CheckCircle className="w-14 h-14" style={{ color: 'hsl(30 25% 10%)' }} />
          </div>
          
          {/* Glow pulse */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-brass"
            style={{
              background: 'radial-gradient(circle, rgba(218, 165, 32, 0.6) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Success Message */}
        <h2 className="text-5xl font-bold font-display mb-4 brass-glow text-primary animate-fade-in">
          Your treasure is now immortal
        </h2>
        
        <p className="text-xl text-foreground/90 mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="font-semibold">"{documentTitle}"</span>
        </p>
        
        <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          has been inscribed forever on the Bitcoin SV blockchain
        </p>

        {/* Treasury Sponsorship Badge */}
        {treasurySponsored && (
          <div 
            className="relative parchment-card p-6 mb-6 animate-fade-in border-2"
            style={{ 
              animationDelay: '0.25s',
              borderColor: 'hsl(0 70% 45%)',
              background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.05) 0%, rgba(180, 0, 0, 0.03) 100%)',
            }}
          >
            {/* Wax Seal Stamp */}
            <div 
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, hsl(0 70% 45%) 0%, hsl(0 60% 35%) 100%)',
                boxShadow: '0 4px 12px rgba(139, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="text-center">
                <div 
                  className="text-xs font-bold font-display"
                  style={{ color: 'hsl(0 10% 90%)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  TROVE
                </div>
                <div 
                  className="text-[8px] font-display"
                  style={{ color: 'hsl(0 10% 80%)' }}
                >
                  TREASURY
                </div>
              </div>
            </div>

            <div className="text-center pt-6">
              <p 
                className="text-base font-bold font-display mb-2"
                style={{ color: 'hsl(0 70% 45%)' }}
              >
                Treasury Sponsored
              </p>
              <p className="text-sm text-muted-foreground font-body">
                This inscription was gifted by the Lifetime Archivists treasury
              </p>
            </div>
          </div>
        )}

        {/* Transaction ID */}
        {txid && (
          <div className="parchment-card p-4 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-xs text-muted-foreground mb-1 font-semibold">Transaction ID</p>
            <div className="flex items-center gap-2 justify-center">
              <code className="text-xs font-mono text-primary break-all">
                {txid.slice(0, 16)}...{txid.slice(-16)}
              </code>
              <button className="p-1 hover:bg-background/50 rounded transition-colors">
                <ExternalLink className="w-4 h-4" style={{ color: 'hsl(38 60% 45%)' }} />
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="leather-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Inscription Cost</p>
            <p className="text-2xl font-bold font-display text-primary">
              {treasurySponsored ? 'FREE' : '< 1¢'}
            </p>
          </div>
          <div className="leather-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-2xl font-bold font-display text-secondary">Live</p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onClose}
          size="lg"
          className="w-full text-xl py-6 animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          View in Your Collection
        </Button>
      </div>

      <style>{`
        @keyframes fall-coin {
          from {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) translateX(${Math.random() * 40 - 20}vw);
            opacity: 0;
          }
        }
        
        @keyframes spin-coin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
