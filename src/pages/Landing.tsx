import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Shield, Zap, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Top Bar with Shield Icon */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end">
          <Link
            to="/trust-safety"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Trust & Safety</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 bg-[#0B0B0F]">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/10 blur-xl animate-pulse"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 5 + 3}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

        {/* Pulsing BSV Logo Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-primary/5 animate-pulse blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-7xl md:text-[12rem] font-bold mb-8 leading-tight bg-gradient-to-r from-white via-primary/90 to-primary bg-clip-text text-transparent animate-fade-in drop-shadow-[0_0_30px_rgba(139,70,255,0.5)]">
            Turn your attic into perpetual Bitcoin royalties
          </h1>
          <p className="text-2xl md:text-[2.5rem] mb-12 text-white font-normal max-w-5xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Scan anything rare hiding in your house<br />
            <span className="text-primary/80">→ Old maps, war letters, diaries, manuscripts, photographs, postcards, certificates, ledgers, family bibles, out-of-print books, hand-drawn plans, vintage sheet music…</span>
            <br /><br />
            One tap inscribes it forever on BSV<br />
            You earn royalties every single time researchers, historians, documentary makers, or AI companies read a page.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/app")}
            className="text-xl md:text-2xl px-12 py-8 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow transform hover:scale-105 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            Start Scanning – Free
          </Button>
        </div>
      </section>

      {/* The Magic in 60 Seconds */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            The Magic in 60 Seconds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: 1, title: "Find", desc: "Dusty box in the loft", emoji: "📦" },
              { step: 2, title: "Scan", desc: "Phone captures every page", emoji: "📱" },
              { step: 3, title: "Own Forever", desc: "Inscribed on BSV #47291", emoji: "💎" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-glow">
                  <div className="text-7xl mb-4">{item.emoji}</div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">Step {item.step}: {item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary text-4xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Actually Matters */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="aspect-square bg-muted flex items-center justify-center">
                <FileText className="w-32 h-32 text-secondary opacity-50" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Why This Actually Matters
              </h2>
              <p className="text-2xl md:text-3xl leading-relaxed text-foreground/90">
                "95% of 20th-century personal records are still in British lofts.
              </p>
              <p className="text-2xl md:text-3xl leading-relaxed text-foreground/90">
                Most will be thrown away when the last grandparent dies.
              </p>
              <p className="text-2xl md:text-3xl leading-relaxed font-semibold text-primary">
                BSV Archive rescues them — and pays the family forever."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How You Earn */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            How You Earn
          </h2>
          <p className="text-3xl md:text-5xl font-bold mb-12 text-foreground/90">
            "Researchers & AI labs already pay $0.50–$10 per 1,000 rare pages"
          </p>
          
          <div className="bg-gradient-card border border-primary/30 rounded-3xl p-12 mb-12 shadow-glow">
            <p className="text-xl text-muted-foreground mb-4">Total earnings paid out:</p>
            <p className="text-6xl md:text-8xl font-bold text-primary mb-2">
              {earnings.toFixed(5)} BSV
            </p>
            <p className="text-lg text-secondary">and growing...</p>
          </div>

          <div className="bg-gradient-to-r from-card to-muted border border-border/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <TrendingUp className="w-12 h-12 text-secondary mb-4 mx-auto" />
            <p className="text-xl text-foreground/90">
              "One user earned 0.32 BSV this week from a 1916 trench diary"
            </p>
          </div>
        </div>
      </section>

      {/* Built on Bitcoin SV */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
              <div key={idx} className="bg-gradient-card border border-border/50 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                <item.icon className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-secondary">{item.title}</h3>
                <p className="text-lg text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-foreground">
            Ready to preserve history?
          </h2>
          <Button
            size="lg"
            onClick={() => navigate("/app")}
            className="text-xl md:text-2xl px-16 py-8 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow transform hover:scale-105 transition-all duration-300"
          >
            Open Attic → Start Earning
          </Button>
        </div>
      </section>

      {/* Sticky Bottom Bar (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        <Button
          size="lg"
          onClick={() => navigate("/app")}
          className="w-full text-lg py-6 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow"
        >
          Start Scanning – Free
        </Button>
      </div>
    </div>
  );
};

export default Landing;
