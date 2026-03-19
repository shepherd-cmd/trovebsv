import { useEffect, useRef } from "react";
import libraryBg from "@/assets/hero-library-bg.jpg";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityDelta: number;
}

function spawnParticle(w: number, h: number): Particle {
  return {
    // concentrate particles in the light-beam column (centre of image)
    x: w * (0.32 + Math.random() * 0.38),
    y: h * (0.25 + Math.random() * 0.75),
    size: 0.4 + Math.random() * 1.6,
    speedX: (Math.random() - 0.5) * 0.25,
    speedY: -(0.12 + Math.random() * 0.35),
    opacity: 0,
    opacityDelta: 0.002 + Math.random() * 0.004,
  };
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed 140 particles spread across the full height so the effect is
    // visible immediately rather than needing to drift in from the bottom.
    for (let i = 0; i < 140; i++) {
      const p = spawnParticle(canvas.width, canvas.height);
      p.y = Math.random() * canvas.height;
      p.opacity = Math.random() * 0.55;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacityDelta;

        // Reverse fade once bright enough, then respawn when invisible
        if (p.opacity >= 0.65) p.opacityDelta = -Math.abs(p.opacityDelta);
        if (p.opacity <= 0 || p.y < -4) {
          particles[i] = spawnParticle(canvas.width, canvas.height);
          return;
        }

        // Warm golden-white dust — matches the library's light beam colour
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 228, 150, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

      {/* ── Library photograph ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${libraryBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          // Lift brightness slightly, pull contrast up, keep the warm tones
          filter: "brightness(0.82) contrast(1.08) saturate(0.88)",
        }}
      />

      {/* ── Gradient overlays for text legibility ── */}
      {/* Top band — darkens sky/ceiling so nav text is readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(10,7,4,0.60) 0%, rgba(10,7,4,0.08) 28%, rgba(10,7,4,0.08) 68%, rgba(10,7,4,0.78) 100%)",
        }}
      />

      {/* ── Animated dust particle canvas ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* ── Subtle golden warmth over the light-beam column ── */}
      <div
        style={{
          position: "absolute",
          width: "32vw",
          height: "65vh",
          top: 0,
          left: "50%",
          transform: "translateX(-42%)",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,200,80,0.07) 0%, transparent 72%)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Edge vignette — pulls focus to the centre ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 88% 88% at 50% 42%, transparent 30%, rgba(8,5,3,0.72) 100%)",
        }}
      />
    </div>
  );
}
