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
    <div className="glass-card-strong p-8 mb-6 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl glass-card neon-border">
            <Wallet className="w-6 h-6 neon-glow" />
          </div>
          <h2 className="text-2xl font-bold neon-glow">Wallet</h2>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-2">Balance</p>
            <h3 className="text-5xl font-bold neon-glow mb-2">{balance.toFixed(8)} BSV</h3>
            <p className="text-sm text-muted-foreground">≈ ${(balance * 42.58).toFixed(2)} USD</p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-3">Address</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 glass-card rounded-xl text-sm font-mono truncate neon-glow">
                {walletAddress}
              </code>
              <Button variant="outline" size="icon" onClick={copyAddress} className="neon-border">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1 h-14 text-lg">
              <Send className="w-5 h-5 mr-2" />
              Send
            </Button>
            <Button variant="outline" className="flex-1 h-14 text-lg">
              <Download className="w-5 h-5 mr-2" />
              Receive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;
