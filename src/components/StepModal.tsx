import { X } from 'lucide-react';
import { useEffect } from 'react';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
}

const stepContent = {
  1: {
    title: "Step 1 – Discover What's Been Waiting",
    body: "Search attics, drawers, and forgotten boxes. Every family has hidden letters, photographs, medals, diaries — pieces of history only you still hold.",
    bgClass: "onboarding-step-1",
  },
  2: {
    title: "Step 2 – Capture Forever",
    body: "One tap preserves it perfectly on the Bitcoin SV blockchain — immutable, timeless, and provably yours.",
    bgClass: "onboarding-step-2",
  },
  3: {
    title: "Step 3 – Let It Pay Your Bloodline",
    body: "Every time someone views your treasure, tiny royalties flow to you and your descendants — forever.",
    bgClass: "onboarding-step-3",
  },
};

export const StepModal = ({ isOpen, onClose, step }: StepModalProps) => {
  const content = stepContent[step as keyof typeof stepContent];

  useEffect(() => {
    if (isOpen) {
      // Play soft parchment sound on open
      try {
        const audio = new Audio();
        audio.volume = 0.15;
        audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        audio.play().catch(() => {});
      } catch (e) {
        // Silently fail
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Play soft parchment sound on close
    try {
      const audio = new Audio();
      audio.volume = 0.15;
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      audio.play().catch(() => {});
    } catch (e) {
      // Silently fail
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
      
      {/* Modal Content */}
      <div 
        className={`
          relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden
          ${content.bgClass}
          parchment-card border-4
          min-h-[500px] md:min-h-[600px]
          flex flex-col items-center justify-center
          p-8 md:p-16
          animate-scale-in
        `}
        style={{
          borderColor: 'hsl(42 88% 55% / 0.5)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 2px 8px rgba(255, 215, 100, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <X className="w-6 h-6" style={{ color: 'hsl(42 88% 55%)' }} />
        </button>

        {/* Vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl space-y-8">
          <h2 
            className="text-4xl md:text-6xl font-display font-bold tracking-wide"
            style={{ 
              color: 'hsl(42 88% 55%)',
              textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(218, 165, 32, 0.4)',
            }}
          >
            {content.title}
          </h2>
          
          <p 
            className="text-xl md:text-3xl font-body leading-relaxed"
            style={{ 
              color: 'hsl(38 60% 85%)',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {content.body}
          </p>
        </div>

        {/* Floating dust motes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full dust-mote"
              style={{
                backgroundColor: 'hsl(42 88% 55% / 0.4)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
