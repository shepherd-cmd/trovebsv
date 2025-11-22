import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Shield, Zap, TrendingUp, Search, Book, Camera } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import libraryBg from "@/assets/hero-library-bg.jpg";
import { MobileCameraFlow } from "@/components/MobileCameraFlow";
import { AmbientSound } from "@/components/AmbientSound";

const Landing = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings(prev => prev + 0.00001);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <ParticleBackground />
      
      {/* Top Bar with Shield Icon */}
      <div className="fixed top-0 left-0 right-0 z-50 leather-card border-b-2 border-brass-border/50 backdrop-blur-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end">
          <Link
            to="/trust-safety"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform text-brass-bg" />
            <span className="text-sm font-semibold font-display">Trust & Safety</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-0" style={{ paddingTop: 'max(8rem, calc(5rem + env(safe-area-inset-top)))' }}>
        {/* Moody Antique Library Background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${libraryBg})`,
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
          {/* Extra vignette effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(28,25,20,0.8)_100%)]" />
        </div>

        {/* Ambient Golden Glow */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-[600px] h-[600px] rounded-full bg-primary/8 animate-pulse-brass blur-[120px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-12 md:py-0">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-display mb-6 md:mb-8 leading-[1.1] text-primary animate-fade-in" 
              style={{ 
                textShadow: '0 4px 20px rgba(218, 165, 32, 0.6), 0 2px 8px rgba(184, 134, 11, 0.4), 0 0 40px rgba(218, 165, 32, 0.3)',
                animationDelay: '0s'
              }}>
            Turn your collection into perpetual Bitcoin royalties
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 md:mb-12 text-foreground/95 font-normal max-w-5xl mx-auto animate-fade-in leading-relaxed px-2 drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
            Scan anything rare hiding in your house<br className="hidden sm:block" />
            <span className="text-accent/90 block mt-2 sm:inline sm:mt-0">→ Old maps, war letters, diaries, manuscripts, photographs, postcards, certificates, ledgers, family bibles, out-of-print books, hand-drawn plans, vintage sheet music…</span>
            <br /><br className="hidden sm:block" />
            One tap inscribes it forever on BSV<br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">You earn royalties every single time researchers, historians, documentary makers, or AI companies read a page.</span>
          </p>
          
          {/* Leather Book / Brass Plate CTA Button */}
          <button
            onClick={() => navigate("/app")}
            className="group relative inline-flex items-center justify-center px-12 md:px-16 py-6 md:py-8 text-xl md:text-2xl lg:text-3xl font-bold font-display text-foreground overflow-hidden rounded-lg animate-fade-in hover:scale-[1.02] transition-all duration-300"
            style={{ 
              animationDelay: '0.4s',
              background: 'linear-gradient(145deg, hsl(35 25% 18%), hsl(30 20% 12%))',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 215, 100, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.5), 0 0 40px rgba(218, 165, 32, 0.3)',
              border: '3px solid hsl(38 60% 35%)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(218, 165, 32, 0.4)',
            }}
          >
            {/* Leather texture overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" 
                 style={{
                   backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px),
                                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)`
                 }} 
            />
            
            {/* Brass corner decorations */}
            <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-primary/60" />
            <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-primary/60" />
            <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-primary/60" />
            <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-primary/60" />
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
            
            <Book className="mr-3 w-7 h-7 md:w-8 md:h-8 relative z-10 text-primary group-hover:scale-110 transition-transform" />
            <span className="relative z-10 brass-glow">Begin Your Discovery – Free</span>
          </button>
        </div>
      </section>

      {/* The Magic in 60 Seconds */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-display text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            The Magic in 60 Seconds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: 1, title: "Find", desc: "Dusty box in the loft", emoji: "📦" },
              { step: 2, title: "Scan", desc: "Phone captures every page", emoji: "📱" },
              { step: 3, title: "Own Forever", desc: "Inscribed on BSV #47291", emoji: "💎" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="parchment-card p-10 text-center hover-brass group">
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{item.emoji}</div>
                  <h3 className="text-2xl font-bold font-display mb-2 brass-glow text-primary">Step {item.step}: {item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary text-4xl brass-glow">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Actually Matters */}
      <section className="py-32 px-4 relative overflow-hidden bg-gradient-to-b from-background to-card">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold font-display mb-16 bg-gradient-to-r from-primary via-accent to-foreground bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(218,165,32,0.4)] leading-tight">
            This could rewrite history — and put Bitcoin in your family forever
          </h2>
          
          <div className="space-y-10 text-foreground/90">
            <p className="text-2xl md:text-4xl leading-relaxed font-medium">
              95% of the documents that shaped the 20th century are still in ordinary homes right now.
            </p>
            
            <p className="text-xl md:text-3xl leading-relaxed">
              The unknown D-Day maps. The lost Beatles lyrics. The resistance letters that never made the history books. The factory ledgers that explain whole towns. The only surviving photos of forgotten regiments. The hand-written accounts that contradict the official story.
            </p>
            
            <p className="text-2xl md:text-4xl leading-relaxed font-semibold text-accent">
              Most will be thrown in a skip the day the last grandparent dies.
            </p>
            
            <p className="text-3xl md:text-5xl leading-relaxed font-bold font-display text-primary mt-12 brass-glow">
              Trove changes that.
            </p>
            
            <p className="text-xl md:text-3xl leading-relaxed mt-12">
              Every scan you upload becomes immutably timestamped on Bitcoin SV — court-grade proof it existed.<br />
              Every time a historian, documentary maker, university, or AI lab reads a page, you get paid instantly and forever.
            </p>
            
            <p className="text-2xl md:text-4xl leading-relaxed font-semibold mt-12">
              You're not just digitising old paper.<br />
              You're rescuing lost truth and turning it into generational wealth.
            </p>
          </div>
          
          <Button
            size="lg"
            onClick={() => navigate("/app")}
            className="mt-16 text-xl md:text-2xl px-16 py-8"
          >
            Start Rescuing History – Free
          </Button>
        </div>
      </section>

      {/* How You Earn */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            How You Earn
          </h2>
          <p className="text-3xl md:text-5xl font-bold mb-12 text-foreground/90">
            "Researchers & AI labs already pay $0.50–$10 per 1,000 rare pages"
          </p>
          
          <div className="leather-card p-12 mb-12 animate-pulse-brass">
            <p className="text-xl text-muted-foreground mb-4">Total earnings paid out:</p>
            <p className="text-6xl md:text-8xl font-bold font-display brass-glow mb-2 text-primary">
              {earnings.toFixed(5)} BSV
            </p>
            <p className="text-lg text-primary-light">and growing...</p>
          </div>

          <div className="parchment-card p-8 max-w-2xl mx-auto">
            <TrendingUp className="w-12 h-12 text-secondary mb-4 mx-auto" />
            <p className="text-xl text-card-foreground">
              "One user earned 0.32 BSV this week from a 1916 trench diary"
            </p>
          </div>
        </div>
      </section>

      {/* Built on Bitcoin SV */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-display text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Built on Bitcoin SV
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Immutable provenance",
                desc: "Court-grade proof it's real"
              },
              {
                icon: Zap,
                title: "Micropayments",
                desc: "Fractions of a penny per page, paid instantly"
              },
              {
                icon: FileText,
                title: "Yours forever",
                desc: "No middleman, no rug-pull"
              }
            ].map((item, idx) => (
              <div key={idx} className="leather-card p-10 text-center hover-brass group">
                <item.icon 
                  className="w-20 h-20 brass-glow mx-auto mb-6 group-hover:scale-110 transition-transform" 
                  style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)', fill: 'none' }}
                />
                <h3 className="text-2xl font-bold font-display mb-4 text-primary">{item.title}</h3>
                <p className="text-lg text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discoverable by the World */}
      <section className="py-24 px-4 bg-gradient-to-b from-card to-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-display text-center mb-12 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Discoverable by the World – Instantly
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Every document is searchable the second it's uploaded
          </p>

          <div className="space-y-6 mb-12 max-w-3xl mx-auto">
            {[
              "Real-time indexing via JungleBus + GorillaPool",
              "Full-text OCR search (every handwritten word is findable)",
              "Public search at trove.sv/search – Google, historians, and AI companies crawl it daily"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 text-xl text-foreground/90">
                <span className="text-primary text-2xl brass-glow">•</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          {/* Search Box Mockup */}
          <div className="parchment-card p-8 mb-12 max-w-3xl mx-auto shadow-glow">
            <div className="relative mb-8">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6" 
                style={{ color: 'hsl(38 60% 45%)' }}
              />
              <input
                type="text"
                placeholder="Search millions of historical documents..."
                className="w-full bg-background/80 border-2 border-brass-border rounded-lg py-4 pl-14 pr-6 text-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                readOnly
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3 font-semibold">Try searching for:</p>
              {[
                "D-Day landing plans 1944",
                "Beatles handwritten lyrics 1965",
                "Sheffield factory ledger 1943",
                "Grandad's war diary Ypres"
              ].map((search, idx) => (
                <div
                  key={idx}
                  className="bg-background/50 border border-brass-border/50 rounded-lg px-4 py-3 text-card-foreground hover:border-primary hover:bg-background/70 transition-all cursor-pointer"
                >
                  <Search 
                    className="inline w-4 h-4 mr-2" 
                    style={{ color: 'hsl(42 88% 55%)' }}
                  />
                  {search}
                </div>
              ))}
            </div>
          </div>

          <p className="text-2xl md:text-3xl font-semibold text-center mb-8 text-foreground">
            The rarer your document, the faster buyers find it and pay you.
          </p>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/app")}
              className="text-xl md:text-2xl px-12 py-8"
            >
              Try the Live Search
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-8 text-foreground">
            Ready to preserve history?
          </h2>
          <Button
            size="lg"
            onClick={() => navigate("/app")}
            className="text-xl md:text-2xl px-16 py-8"
          >
            Open Trove → Start Earning
          </Button>
        </div>
      </section>

      {/* Fixed Bottom Camera Bar (Mobile-First) */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center py-6"
        style={{ 
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(28, 25, 20, 0.95) 0%, rgba(28, 25, 20, 0.8) 70%, transparent 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <button
          onClick={() => setShowCamera(true)}
          className="w-20 h-20 rounded-full relative group transition-transform active:scale-95"
          style={{
            background: 'radial-gradient(circle, hsl(38 60% 50%) 0%, hsl(38 60% 35%) 100%)',
            boxShadow: '0 0 40px rgba(218, 165, 32, 0.7), 0 8px 24px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(255, 255, 255, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.3)',
          }}
          aria-label="Open Camera"
        >
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full bg-background/90 flex items-center justify-center group-active:scale-90 transition-transform">
            <Camera className="w-8 h-8" style={{ color: 'hsl(38 60% 45%)' }} />
          </div>
          
          {/* Subtle glow animation */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse-brass opacity-60"
            style={{
              background: 'radial-gradient(circle, transparent 50%, rgba(218, 165, 32, 0.3) 100%)',
            }}
          />
        </button>
      </div>

      {/* Mobile Camera Flow */}
      {showCamera && <MobileCameraFlow onClose={() => setShowCamera(false)} />}

      {/* Ambient Sound Control */}
      <AmbientSound />
    </div>
  );
};

export default Landing;
