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
      <div className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
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
              className="bg-gradient-card border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex gap-6 items-start">
                {/* Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <measure.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <h3 className="text-2xl font-bold text-foreground">{measure.title}</h3>
                  </div>
                  <div className="space-y-2 text-lg text-foreground/80">
                    {measure.description.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                {/* Check Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Statement */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-8 md:p-12 text-center mb-12">
          <p className="text-xl md:text-3xl font-bold text-foreground leading-relaxed">
            Casual fakes = impossible. Serious fraud = financial suicide. Real family history = protected and rewarded forever.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="text-lg px-12 py-6 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow transform hover:scale-105 transition-all duration-300"
          >
            Got it – back to scanning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrustSafety;
