import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  address: string;
  timestamp: string;
  status: 'confirmed' | 'pending';
}

const TransactionList = () => {
  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "received",
      amount: 2.5,
      address: "1BvBM...xYz",
      timestamp: "2 hours ago",
      status: "confirmed"
    },
    {
      id: "2",
      type: "sent",
      amount: 1.2,
      address: "3FZbgi...pQR",
      timestamp: "5 hours ago",
      status: "confirmed"
    },
    {
      id: "3",
      type: "received",
      amount: 5.8,
      address: "bc1qxy...mno",
      timestamp: "1 day ago",
      status: "confirmed"
    },
    {
      id: "4",
      type: "sent",
      amount: 0.5,
      address: "1A1zP1...fNa",
      timestamp: "2 days ago",
      status: "confirmed"
    }
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div 
            key={tx.id}
            className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                tx.type === 'received' 
                  ? 'bg-success/20 text-success' 
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {tx.type === 'received' ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>
              
              <div>
                <p className="font-medium">
                  {tx.type === 'received' ? 'Received' : 'Sent'}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{tx.address}</span>
                  {tx.status === 'pending' && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-bold ${
                tx.type === 'received' ? 'text-success' : 'text-foreground'
              }`}>
                {tx.type === 'received' ? '+' : '-'}{tx.amount.toFixed(8)} BSV
              </p>
              <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TransactionList;
