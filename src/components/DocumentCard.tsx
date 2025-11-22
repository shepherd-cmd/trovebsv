import { Badge } from "@/components/ui/badge";
import { TrendingUp, Coins } from "lucide-react";
import { useState } from "react";

interface DocumentCardProps {
  title: string;
  category: string;
  imageUrl: string;
  rarityScore: number;
  usefulnessScore: number;
  pricePerPage: number;
  totalPages: number;
  createdAt: string;
}

export function DocumentCard({
  title,
  category,
  imageUrl,
  rarityScore,
  usefulnessScore,
  pricePerPage,
  totalPages,
  createdAt,
}: DocumentCardProps) {
  // Generate a consistent random rotation for each card based on title
  const getRotation = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return ((hash % 6) - 3); // Random between -3 and 3 degrees
  };

  const rotation = getRotation(title);
  const [isHovered, setIsHovered] = useState(false);
  
  const getRarityLabel = (score: number) => {
    if (score >= 90) return { label: "Exceptional", color: "text-amber-600", bg: "bg-amber-100/80" };
    if (score >= 70) return { label: "Rare", color: "text-amber-700", bg: "bg-amber-50/80" };
    if (score >= 50) return { label: "Uncommon", color: "text-amber-800", bg: "bg-amber-50/60" };
    return { label: "Common", color: "text-muted-foreground", bg: "bg-parchment-bg/40" };
  };

  const rarity = getRarityLabel(rarityScore);
  const totalEarnings = (pricePerPage * totalPages).toFixed(6);

  return (
    <div 
      className="group cursor-pointer perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Main Polaroid/Daguerreotype Container */}
      <div 
        className="relative"
        style={{
          transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Photo Plate with Aged Border */}
        <div 
          className="relative bg-parchment-bg p-3 pb-16 rounded-sm"
          style={{
            boxShadow: isHovered 
              ? '0 20px 50px rgba(0, 0, 0, 0.45), 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 60px rgba(218, 165, 32, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
              : '0 12px 30px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s ease',
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(120, 80, 40, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(100, 70, 40, 0.05) 0%, transparent 50%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px)
            `,
          }}
        >
          {/* Aged Photo Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-card rounded-sm">
            {/* Sepia overlay for aged effect */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(120,80,40,0.08) 0%, rgba(80,60,30,0.12) 100%)',
                mixBlendMode: 'multiply',
              }}
            />
            
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                filter: 'sepia(0.2) contrast(1.1)',
              }}
            />
            
            {/* Rarity Badge on Photo */}
            <div className="absolute top-2 right-2 z-20">
              <Badge className={`${rarity.bg} ${rarity.color} border border-brass-border/40 shadow-md font-semibold text-xs`}>
                {rarity.label}
              </Badge>
            </div>
            
            {/* Usefulness Score */}
            <div className="absolute top-2 left-2 z-20">
              <Badge className="bg-parchment-bg/90 text-card-foreground border border-brass-border/40 shadow-md text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                {usefulnessScore}
              </Badge>
            </div>
          </div>
          
          {/* Parchment Label Area (bottom of polaroid) */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 text-center">
            {/* Title in Handwriting */}
            <h3 
              className="font-handwriting text-xl md:text-2xl text-card-foreground mb-1 leading-tight"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {title.length > 40 ? `${title.substring(0, 40)}...` : title}
            </h3>
            
            {/* Category in smaller handwriting */}
            <p className="font-handwriting text-base text-muted-foreground/80">
              {category}
            </p>
          </div>
        </div>

        {/* Separate Parchment Label Underneath (like a museum tag) */}
        <div 
          className="mt-3 mx-auto w-11/12 parchment-card p-3 text-center"
          style={{
            boxShadow: isHovered
              ? '0 6px 20px rgba(0, 0, 0, 0.25)'
              : '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Royalty Counter in Handwriting */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-primary" />
            <span className="font-handwriting text-lg text-primary brass-glow">
              {totalEarnings} BSV
            </span>
          </div>
          
          {/* Additional Details */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
            <span>{totalPages} pages</span>
            <span>•</span>
            <span>{new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
