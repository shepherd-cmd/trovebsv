import { useEffect, useState } from "react";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InscriptionSuccessAnimationProps {
  onClose: () => void;
  documentTitle: string;
  txid?: string;
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
  txid 
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
            <p className="text-2xl font-bold font-display text-primary">FREE</p>
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
