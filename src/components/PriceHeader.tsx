import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

const PriceHeader = () => {
  // Mock data - in production this would come from an API
  const currentPrice = 42.58;
  const priceChange24h = 2.34;
  const priceChangePercent = 5.82;
  const isPositive = priceChange24h >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card className="p-6 bg-gradient-to-br from-primary to-accent border-primary/20">
        <div className="space-y-2">
          <p className="text-sm text-primary-foreground/80">BSV Price</p>
          <h2 className="text-3xl font-bold text-primary-foreground">${currentPrice.toFixed(2)}</h2>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Market Cap</p>
          <h3 className="text-2xl font-bold">$823.4M</h3>
          <p className="text-xs text-muted-foreground">Rank #78</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">24h Volume</p>
          <h3 className="text-2xl font-bold">$45.2M</h3>
          <p className="text-xs text-muted-foreground">Trading volume</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Circulating Supply</p>
          <h3 className="text-2xl font-bold">19.6M BSV</h3>
          <p className="text-xs text-muted-foreground">Total supply</p>
        </div>
      </Card>
    </div>
  );
};

export default PriceHeader;
