import { useEffect, useState } from "react";

export const InscriptionLoadingAnimation = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center">
      {/* Floating dust motes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              animation: `float-dust ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Antique Pocket Watch */}
        <div className="mb-8 relative inline-block">
          {/* Outer ring */}
          <div
            className="w-32 h-32 rounded-full border-8 relative"
            style={{
              borderColor: 'hsl(38 60% 45%)',
              boxShadow: '0 0 40px rgba(218, 165, 32, 0.6), inset 0 2px 8px rgba(0, 0, 0, 0.5)',
              background: 'radial-gradient(circle, hsl(35 25% 18%) 0%, hsl(30 20% 12%) 100%)',
            }}
          >
            {/* Watch face numbers */}
            {[12, 3, 6, 9].map((num, idx) => {
              const angle = (idx * 90 - 90) * (Math.PI / 180);
              const x = Math.cos(angle) * 40;
              const y = Math.sin(angle) * 40;
              return (
                <div
                  key={num}
                  className="absolute text-xs font-bold font-display"
                  style={{
                    color: 'hsl(42 88% 55%)',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  {num}
                </div>
              );
            })}

            {/* Watch hands */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Hour hand */}
              <div
                className="absolute w-1 h-10 rounded-full origin-bottom"
                style={{
                  backgroundColor: 'hsl(38 60% 45%)',
                  transform: `rotate(${rotation}deg) translateY(-20px)`,
                }}
              />
              {/* Minute hand */}
              <div
                className="absolute w-1 h-14 rounded-full origin-bottom"
                style={{
                  backgroundColor: 'hsl(42 88% 55%)',
                  transform: `rotate(${rotation * 12}deg) translateY(-28px)`,
                }}
              />
              {/* Center dot */}
              <div
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: 'hsl(38 60% 45%)',
                  boxShadow: '0 0 8px rgba(218, 165, 32, 0.8)',
                }}
              />
            </div>

            {/* Watch crown */}
            <div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-t-md"
              style={{
                backgroundColor: 'hsl(38 60% 45%)',
                boxShadow: '0 0 8px rgba(218, 165, 32, 0.6)',
              }}
            />
          </div>

          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-brass opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Text */}
        <h2 className="text-4xl font-bold font-display mb-3 brass-glow text-primary animate-pulse">
          Inscribing…
        </h2>
        <p className="text-lg text-muted-foreground font-body">
          Your treasure is being etched into the blockchain
        </p>
        <p className="text-sm text-primary/60 mt-2">
          This will only take a moment...
        </p>
      </div>
    </div>
  );
};
