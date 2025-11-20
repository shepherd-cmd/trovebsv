import { Card } from "@/components/ui/card";
import { Activity, Box, Database, Zap } from "lucide-react";

const BlockchainStats = () => {
  const stats = [
    {
      icon: Box,
      label: "Block Height",
      value: "823,456",
      color: "text-primary"
    },
    {
      icon: Zap,
      label: "Hash Rate",
      value: "2.1 EH/s",
      color: "text-accent"
    },
    {
      icon: Activity,
      label: "Transactions",
      value: "1,234,567",
      color: "text-info"
    },
    {
      icon: Database,
      label: "Avg Block Size",
      value: "1.2 MB",
      color: "text-warning"
    }
  ];

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Blockchain Stats</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BlockchainStats;
