import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create very subtle warm dust mote particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.15, // Slower, more subtle
        speedY: Math.random() * 0.15 - 0.25, // Gentle upward drift
        opacity: Math.random() * 0.25 + 0.05, // More subtle opacity
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position with gentle floating motion
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw warm dust mote with amber/gold glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Create warm golden gradient for god-ray effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 10
        );
        gradient.addColorStop(0, `rgba(218, 165, 32, ${particle.opacity * 0.8})`); // Gold
        gradient.addColorStop(0.5, `rgba(184, 134, 11, ${particle.opacity * 0.4})`); // Darker gold
        gradient.addColorStop(1, 'rgba(139, 90, 0, 0)'); // Fade to transparent
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw bright center with sepia/amber tone
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 100, ${particle.opacity * 1.2})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Main canvas with dust motes */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ 
          background: 'radial-gradient(ellipse at 50% 20%, hsl(35 25% 12%), hsl(28 25% 8%))',
        }}
      />
      
      {/* Parchment texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Soft vignette around edges */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(20, 15, 10, 0.3) 70%, rgba(20, 15, 10, 0.6) 100%)',
          boxShadow: 'inset 0 0 200px rgba(20, 15, 10, 0.4)',
        }}
      />
    </>
  );
}
