import { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTroveStore } from '@/store/useTroveStore';
import { useToast } from '@/hooks/use-toast';

interface HandCashContextType {
  isConnected: boolean;
  userPaymail: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  splitPayment: (amount: number, ownerPaymail: string, description: string) => Promise<void>;
  getTreasuryBalance: () => Promise<number>;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
}

const HandCashContext = createContext<HandCashContextType | undefined>(undefined);

export function HandCashProvider({ children }: { children: ReactNode }) {
  const { paymail, setPaymail, activeTab, setActiveTab } = useTroveStore();
  const isConnected = !!paymail;
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('authToken');
      const paymailParam = params.get('paymail');
      
      if (authToken && paymailParam) {
        setPaymail(paymailParam);
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: 'HandCash Connected',
          description: `Connected as ${paymailParam}`,
        });
      }
    };

    handleOAuthCallback();
  }, [setPaymail, toast]);

  const connect = async () => {
    try {
      setActiveTab('connect');
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to HandCash',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disconnect = () => {
    setPaymail(null);
    toast({
      title: 'Disconnected',
      description: 'HandCash has been disconnected',
    });
  };

  const splitPayment = async (
    amount: number,
    ownerPaymail: string,
    description: string
  ): Promise<void> => {
    if (!isConnected || !paymail) {
      throw new Error('HandCash not connected');
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount,
          ownerPaymail,
          description,
          payerPaymail: paymail,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Payment failed');
    } catch (error) {
      throw error;
    }
  };

  const getTreasuryBalance = async (): Promise<number> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-treasury-balance');
      if (error) throw error;
      return data?.balance || 0;
    } catch (error) {
      return 0;
    }
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
