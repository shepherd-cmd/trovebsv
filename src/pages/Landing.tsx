import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Shield, Zap, TrendingUp, Search, Book } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

const Landing = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(0);

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
      <div className="fixed top-0 left-0 right-0 z-50 leather-card border-b-2 border-brass-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end">
          <Link
            to="/trust-safety"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold font-display">Trust & Safety</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        {/* Vintage Background with Wood Texture */}
        <div className="absolute inset-0 z-0">
          {/* Faint god rays */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
                style={{
                  height: '100%',
                  left: `${20 + i * 10}%`,
                  transform: `rotate(${-10 + i * 3}deg)`,
                  transformOrigin: 'top',
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>

        {/* Pulsing Amber Glow */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-primary/10 animate-pulse-brass blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto py-12 md:py-0">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[8rem] xl:text-[10rem] font-bold font-display mb-6 md:mb-8 leading-[1.1] bg-gradient-to-r from-foreground via-primary to-primary-light bg-clip-text text-transparent animate-fade-in drop-shadow-[0_0_30px_rgba(218,165,32,0.5)]">
            Turn your collection into perpetual Bitcoin royalties
          </h1>
          <p className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl mb-8 md:mb-12 text-foreground/90 font-normal max-w-5xl mx-auto animate-fade-in leading-relaxed px-2" style={{ animationDelay: '0.2s' }}>
            Scan anything rare hiding in your house<br className="hidden sm:block" />
            <span className="text-accent block mt-2 sm:inline sm:mt-0">→ Old maps, war letters, diaries, manuscripts, photographs, postcards, certificates, ledgers, family bibles, out-of-print books, hand-drawn plans, vintage sheet music…</span>
            <br /><br className="hidden sm:block" />
            One tap inscribes it forever on BSV<br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">You earn royalties every single time researchers, historians, documentary makers, or AI companies read a page.</span>
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/app")}
            className="text-lg md:text-xl lg:text-2xl px-8 md:px-12 py-6 md:py-8 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <Book className="mr-2 w-6 h-6" />
            Start Scanning – Free
          </Button>
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
                <item.icon className="w-20 h-20 brass-glow mx-auto mb-6 group-hover:scale-110 transition-transform text-primary" />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
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
                  <Search className="inline w-4 h-4 mr-2 text-primary" />
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

      {/* Sticky Bottom Bar (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 leather-card border-t-2 border-brass-border/50 backdrop-blur-md p-4 z-50">
        <Button
          size="lg"
          onClick={() => navigate("/app")}
          className="w-full text-lg py-6"
        >
          Start Scanning – Free
        </Button>
      </div>
    </div>
  );
};

export default Landing;
