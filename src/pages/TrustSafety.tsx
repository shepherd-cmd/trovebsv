import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Check, Camera, Clock, Brain, Flag, Lock } from "lucide-react";

const TrustSafety = () => {
  const navigate = useNavigate();

  const safetyMeasures = [
    {
      icon: Camera,
      title: "Mandatory provenance photos",
      description: [
        "Every upload requires 4 real-time photos:",
        "• Open document next to today's newspaper (date visible)",
        "• Close-ups of paper texture, binding, ageing signs",
        "• Ruler or coin for scale",
        "These are stored forever on-chain with the file."
      ]
    },
    {
      icon: Clock,
      title: "On-chain timestamp & wallet age",
      description: [
        "A \"1943 diary\" uploaded by a brand-new wallet raises instant red flags."
      ]
    },
    {
      icon: Brain,
      title: "AI forgery detection",
      description: [
        "Scans every page and photo for modern ink, laser printing, perfect fonts – suspicious uploads are flagged or blocked."
      ]
    },
    {
      icon: Flag,
      title: "Community + expert flagging",
      description: [
        "Anyone can flag. Three flags from high-reputation users hides the file. Proven fakers lose reputation and pay 10× fees."
      ]
    },
    {
      icon: Lock,
      title: "Staking on high-value items",
      description: [
        "Price something sky-high? You stake BSV. If it's fake, stake gets slashed and paid to reporters."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with back button */}
      <div className="border-b-2 border-brass-border/50 leather-card">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-semibold"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-6 shadow-glow embossed-border">
            <Shield 
              className="w-12 h-12" 
              style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)' }}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 text-foreground brass-glow">
            We stop 99% of fakes before they even appear
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
            Here's exactly how Trove keeps the archive genuine
          </p>
        </div>

        {/* Safety Measures */}
        <div className="space-y-6 mb-16">
          {safetyMeasures.map((measure, index) => (
            <div
              key={index}
              className="parchment-card p-8 hover-brass transition-all duration-300"
            >
              <div className="flex gap-6 items-start">
                {/* Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shadow-inset embossed-border">
                    <span className="text-2xl font-bold font-display text-primary">{index + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <measure.icon 
                      className="w-8 h-8 flex-shrink-0 mt-1" 
                      style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)' }}
                    />
                    <h3 className="text-2xl font-bold font-display text-card-foreground">{measure.title}</h3>
                  </div>
                  <div className="space-y-2 text-lg text-card-foreground/80">
                    {measure.description.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                {/* Check Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center embossed-border">
                    <Check 
                      className="w-6 h-6" 
                      style={{ color: 'hsl(42 88% 55%)', stroke: 'hsl(42 88% 55%)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Statement */}
        <div className="leather-card p-8 md:p-12 text-center mb-12 shadow-glow-strong">
          <p className="text-xl md:text-3xl font-bold font-display text-foreground leading-relaxed brass-glow">
            Casual fakes = impossible. Serious fraud = financial suicide. Real family history = protected and rewarded forever.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="text-lg px-12 py-6"
          >
            Got it – back to scanning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrustSafety;
