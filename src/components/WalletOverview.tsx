import { Wallet, Send, Download, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WalletOverview = () => {
  const walletAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
  const balance = 12.45678;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard");
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Wallet</h2>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Balance</p>
          <h3 className="text-3xl font-bold text-primary">{balance.toFixed(8)} BSV</h3>
          <p className="text-sm text-muted-foreground mt-1">≈ ${(balance * 42.58).toFixed(2)} USD</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-secondary rounded-md text-sm font-mono truncate">
              {walletAddress}
            </code>
            <Button variant="outline" size="icon" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Receive
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WalletOverview;
