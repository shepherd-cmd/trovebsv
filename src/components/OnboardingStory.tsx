import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStoryProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Step 1 – Discover What's Been Waiting",
    body: "Search attics, drawers, and forgotten boxes. Every family has hidden letters, photographs, medals, diaries—pieces of history only you still hold.",
    bgClass: "onboarding-step-1",
  },
  {
    id: 2,
    title: "Step 2 – Capture Forever",
    body: "One tap preserves it perfectly on the Bitcoin SV blockchain—immutable, timeless, and provably yours.",
    bgClass: "onboarding-step-2",
  },
  {
    id: 3,
    title: "Step 3 – Let It Pay Your Bloodline",
    body: "Every time someone views your treasure, tiny royalties flow to you and your descendants—forever.",
    bgClass: "onboarding-step-3",
  },
];

export const OnboardingStory = ({ onComplete }: OnboardingStoryProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Auto-advance after 8 seconds
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        handleNext();
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleSkip = () => {
    onComplete();
  };

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Play subtle page turn sound
    try {
      const audio = new Audio();
      audio.volume = 0.2;
      // Subtle parchment rustle sound (can be replaced with actual sound file)
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      audio.play().catch(() => {});
    } catch (e) {
      // Silently fail if audio not supported
    }

    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
      setIsTransitioning(false);
    }, 600);
  };

  const step = steps[currentStep];

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center px-4 py-12">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 z-20 text-sm font-body px-4 py-2 rounded-lg transition-all hover:scale-105"
        style={{
          color: 'hsl(38 60% 65%)',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        Skip
      </button>

      <div className="w-full max-w-6xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentStep 
                  ? 'hsl(42 88% 55%)' 
                  : 'hsl(38 60% 45% / 0.3)',
              }}
            />
          ))}
        </div>

        {/* Main card */}
        <div
          onClick={handleNext}
          className={`
            relative cursor-pointer overflow-hidden rounded-lg
            transition-all duration-600 ease-out
            ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            ${step.bgClass}
            parchment-card border-2
            hover:shadow-elegant
            min-h-[500px] md:min-h-[600px]
            flex flex-col items-center justify-center
            p-8 md:p-16
          `}
          style={{
            borderColor: 'hsl(42 88% 55% / 0.3)',
          }}
        >
        {/* Vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl space-y-6">
          <h2 
            className="text-3xl md:text-5xl font-display font-bold tracking-wide"
            style={{ 
              color: 'hsl(42 88% 55%)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {step.title}
          </h2>
          
          <p 
            className="text-lg md:text-2xl font-body leading-relaxed"
            style={{ 
              color: 'hsl(38 60% 85%)',
              textShadow: '0 1px 5px rgba(0,0,0,0.5)',
            }}
          >
            {step.body}
          </p>

          {/* Next indicator */}
          {currentStep < steps.length - 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 animate-pulse">
              <span 
                className="text-sm font-body uppercase tracking-wider"
                style={{ color: 'hsl(42 88% 55% / 0.7)' }}
              >
                Tap to continue
              </span>
              <ChevronRight 
                className="w-5 h-5"
                style={{ color: 'hsl(42 88% 55%)' }}
              />
            </div>
          )}

          {/* Final CTA */}
          {currentStep === steps.length - 1 && (
            <div className="pt-12">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="brass-button text-xl py-8 px-12 animate-pulse-soft"
              >
                Begin Your Discovery – Free
              </Button>
            </div>
          )}
        </div>

        {/* Floating dust motes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full dust-mote"
              style={{
                backgroundColor: 'hsl(42 88% 55% / 0.3)',
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
    </div>
  );
};
