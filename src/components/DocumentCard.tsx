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
    <Card className="overflow-hidden bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${rarity.color} text-white`}>
            {rarity.label}
          </Badge>
          <Badge variant="outline">
            <TrendingUp className="mr-1 h-3 w-3" />
            Usefulness: {usefulnessScore}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Price/page:</span>
            <span className="ml-2 font-semibold text-primary">
              {pricePerPage.toFixed(8)} BSV
            </span>
          </div>
          <div className="text-muted-foreground">
            {totalPages} pages
          </div>
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
