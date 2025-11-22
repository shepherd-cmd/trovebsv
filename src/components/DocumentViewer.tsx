import { X, Share2, ExternalLink, Coins, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  image_url: string;
  total_earnings: number;
  created_at: string;
  inscription_txid: string | null;
  category: string;
  rarity_score: number;
  price_per_page: number;
  total_pages: number;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export const DocumentViewer = ({ document, onClose }: DocumentViewerProps) => {
  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: `Check out my treasure "${document.title}" preserved forever on Bitcoin SV`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-md overflow-y-auto"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-10 p-3 rounded-full leather-card hover:scale-110 transition-transform"
        style={{ 
          top: 'calc(1rem + env(safe-area-inset-top))',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <X className="w-6 h-6" style={{ color: 'hsl(38 60% 45%)' }} />
      </button>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Image */}
        <div className="relative mb-8 parchment-card p-8 shadow-glow-strong">
          <img
            src={document.image_url}
            alt={document.title}
            className="w-full rounded-lg shadow-lg"
            style={{
              filter: 'sepia(0.15) contrast(1.05)',
              maxHeight: '60vh',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title & Share */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold font-display text-primary brass-glow">
              {document.title}
            </h1>
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="flex-shrink-0"
            >
              <Share2 className="mr-2 h-5 w-5" style={{ color: 'hsl(38 60% 45%)' }} />
              Share
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="leather-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4" style={{ color: 'hsl(42 88% 55%)' }} />
                <p className="text-xs text-muted-foreground font-semibold">Total Earnings</p>
              </div>
              <p className="text-2xl font-bold font-display text-accent">
                {document.total_earnings?.toFixed(4) || '0.0000'} BSV
              </p>
            </div>

            <div className="leather-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" style={{ color: 'hsl(38 60% 45%)' }} />
                <p className="text-xs text-muted-foreground font-semibold">Inscribed</p>
              </div>
              <p className="text-lg font-bold font-display text-primary">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="leather-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4" style={{ color: 'hsl(35 45% 35%)' }} />
                <p className="text-xs text-muted-foreground font-semibold">Rarity</p>
              </div>
              <p className="text-2xl font-bold font-display text-secondary">
                {document.rarity_score}
              </p>
            </div>

            <div className="leather-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4" style={{ color: 'hsl(38 60% 45%)' }} />
                <p className="text-xs text-muted-foreground font-semibold">Per Page</p>
              </div>
              <p className="text-lg font-bold font-display text-primary">
                {(document.price_per_page * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Transaction ID */}
          {document.inscription_txid && (
            <div className="parchment-card p-6">
              <h3 className="text-sm font-semibold font-display mb-3 flex items-center gap-2"
                  style={{ color: 'hsl(38 60% 45%)' }}>
                <ExternalLink className="w-4 h-4" />
                Blockchain Transaction
              </h3>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-xs font-mono text-primary bg-background/50 p-3 rounded border border-brass-border/30 break-all">
                  {document.inscription_txid}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(document.inscription_txid!);
                    toast.success("Transaction ID copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-full text-sm font-semibold font-display"
                  style={{
                    backgroundColor: 'hsl(38 60% 45% / 0.2)',
                    color: 'hsl(38 60% 45%)',
                    border: '1px solid hsl(38 60% 45% / 0.3)',
                  }}>
              {document.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
