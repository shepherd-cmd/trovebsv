import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

interface CoinRainAnimationProps {
  onComplete?: () => void;
}

export const CoinRainAnimation = ({ onComplete }: CoinRainAnimationProps) => {
  const [coins, setCoins] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate 30 random coins
    const generatedCoins = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (0-100%)
      delay: Math.random() * 0.5, // Random delay (0-0.5s)
      duration: 1 + Math.random() * 0.5, // Random duration (1-1.5s)
    }));
    
    setCoins(generatedCoins);

    // Complete animation after 2 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute -top-8 animate-fade-in"
          style={{
            left: `${coin.left}%`,
            animationDelay: `${coin.delay}s`,
            animationDuration: `${coin.duration}s`,
            animationName: 'coin-fall',
            animationTimingFunction: 'ease-in',
            animationFillMode: 'forwards',
          }}
        >
          <Coins
            className="w-8 h-8 animate-spin"
            style={{
              color: 'hsl(42 88% 55%)',
              fill: 'hsl(42 88% 55%)',
              filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.6))',
            }}
          />
        </div>
      ))}
      
      <style>{`
        @keyframes coin-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
