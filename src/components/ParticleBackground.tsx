// Modern Web3 background — gradient orbs + subtle grid mesh

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Gold orb — top left */}
      <div
        style={{
          position: 'absolute',
          width: '55vw',
          height: '55vw',
          top: '-18vw',
          left: '-12vw',
          background: 'radial-gradient(circle, hsl(42 95% 60% / 0.08) 0%, transparent 68%)',
          filter: 'blur(40px)',
          animation: 'orb-float-1 22s ease-in-out infinite',
        }}
      />

      {/* Teal orb — bottom right */}
      <div
        style={{
          position: 'absolute',
          width: '45vw',
          height: '45vw',
          bottom: '-14vw',
          right: '-8vw',
          background: 'radial-gradient(circle, hsl(195 75% 52% / 0.06) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'orb-float-2 28s ease-in-out infinite',
        }}
      />

      {/* Gold orb — centre, very faint */}
      <div
        style={{
          position: 'absolute',
          width: '28vw',
          height: '28vw',
          top: '38%',
          right: '8%',
          background: 'radial-gradient(circle, hsl(42 95% 60% / 0.04) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'orb-float-1 19s ease-in-out infinite reverse',
        }}
      />

      {/* Subtle grid mesh */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(hsl(222 15% 22% / 0.2) 1px, transparent 1px),
            linear-gradient(90deg, hsl(222 15% 22% / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, black 15%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, black 15%, transparent 100%)',
        }}
      />

      {/* Edge vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, hsl(222 18% 5% / 0.65) 100%)',
        }}
      />
    </div>
  );
}
