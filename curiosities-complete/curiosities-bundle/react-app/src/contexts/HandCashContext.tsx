import { createContext, useContext, ReactNode } from 'react';
import { useTroveStore } from '@/store/useTroveStore';
import { useToast } from '@/hooks/use-toast';

interface HandCashContextType {
  isConnected: boolean;
  userPaymail: string | null;
  connect: () => void;
  disconnect: () => void;
  splitPayment: (amount: number, ownerPaymail: string, description: string) => Promise<void>;
  getTreasuryBalance: () => Promise<number>;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  isLoading: boolean;
}

const HandCashContext = createContext<HandCashContextType | undefined>(undefined);

export function HandCashProvider({ children }: { children: ReactNode }) {
  const { paymail, activeTab, setActiveTab } = useTroveStore();
  const { toast } = useToast();
  
  const isConnected = !!paymail;

  const connect = () => {
    toast({
      title: 'Coming Soon',
      description: 'HandCash integration will be available soon',
    });
    setActiveTab('connect');
  };

  const disconnect = () => {
    toast({
      title: 'Disconnected',
      description: 'HandCash has been disconnected',
    });
  };

  const splitPayment = async (
    _amount: number,
    _ownerPaymail: string,
    _description: string
  ): Promise<void> => {
    // Server-side implementation via edge functions
    throw new Error('HandCash payment integration coming soon');
  };

  const getTreasuryBalance = async (): Promise<number> => {
    // Server-side implementation via edge functions
    return 0;
  };

  const value = {
    isConnected,
    userPaymail: paymail,
    connect,
    disconnect,
    splitPayment,
    getTreasuryBalance,
    showConnectModal: activeTab === 'connect',
    setShowConnectModal: (show) => setActiveTab(show ? 'connect' : 'home'),
    isLoading: false,
  };

  return (
    <HandCashContext.Provider value={value}>
      {children}
    </HandCashContext.Provider>
  );
}

export function useHandCash() {
  const context = useContext(HandCashContext);
  if (context === undefined) {
    throw new Error('useHandCash must be used within a HandCashProvider');
  }
  return context;
}
