import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

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
  const getRarityLabel = (score: number) => {
    if (score >= 90) return { label: "Exceptional", color: "bg-purple-500" };
    if (score >= 70) return { label: "Rare", color: "bg-blue-500" };
    if (score >= 50) return { label: "Uncommon", color: "bg-green-500" };
    return { label: "Common", color: "bg-gray-500" };
  };

  const rarity = getRarityLabel(rarityScore);

  return (
    <div className="glass-card-strong overflow-hidden hover-glow group">
      <div className="aspect-video overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-xl text-foreground group-hover:neon-glow transition-all">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{category}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${rarity.color} text-white neon-border`}>
            {rarity.label}
          </Badge>
          <Badge variant="outline" className="glass-card">
            <TrendingUp className="mr-1 h-3 w-3" />
            Usefulness: {usefulnessScore}
          </Badge>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Price/page:</span>
              <span className="ml-2 font-semibold neon-glow">
                {pricePerPage.toFixed(8)} BSV
              </span>
            </div>
            <div className="text-muted-foreground">
              {totalPages} pages
            </div>
          </div>
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
