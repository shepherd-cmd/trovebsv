import PriceHeader from "@/components/PriceHeader";
import WalletOverview from "@/components/WalletOverview";
import BlockchainStats from "@/components/BlockchainStats";
import TransactionList from "@/components/TransactionList";
import { Coins } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
            <Coins className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BSV Dashboard
            </h1>
            <p className="text-muted-foreground">Bitcoin Satoshi Vision</p>
          </div>
        </div>

        {/* Price Overview */}
        <PriceHeader />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet & Stats */}
          <div className="lg:col-span-1">
            <WalletOverview />
            <BlockchainStats />
          </div>

          {/* Right Column - Transactions */}
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
