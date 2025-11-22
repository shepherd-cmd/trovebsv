import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [isConnected, setIsConnected] = useState(false);
  const [userPaymail, setUserPaymail] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already connected
    const storedPaymail = localStorage.getItem('handcash_paymail');
    const storedAuthToken = localStorage.getItem('handcash_auth_token');
    
    if (storedPaymail && storedAuthToken) {
      setUserPaymail(storedPaymail);
      setIsConnected(true);
    }

    // Check for OAuth callback
    const handleOAuthCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('authToken');
      const paymail = params.get('paymail');
      
      if (authToken && paymail) {
        localStorage.setItem('handcash_auth_token', authToken);
        localStorage.setItem('handcash_paymail', paymail);
        setUserPaymail(paymail);
        setIsConnected(true);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: 'HandCash Connected',
          description: `Connected as ${paymail}`,
        });
      }
    };

    handleOAuthCallback();
  }, [toast]);

  const connect = async () => {
    try {
      setShowConnectModal(true);
    } catch (error) {
      console.error('Failed to connect to HandCash:', error);
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to HandCash',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('handcash_paymail');
    localStorage.removeItem('handcash_auth_token');
    setIsConnected(false);
    setUserPaymail(null);
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
    if (!isConnected || !userPaymail) {
      throw new Error('HandCash not connected');
    }

    try {
      // Call edge function to handle payment via HandCash API
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount,
          ownerPaymail,
          description,
          payerPaymail: userPaymail,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Payment failed');
    } catch (error) {
      console.error('Split payment failed:', error);
      throw error;
    }
  };

  const getTreasuryBalance = async (): Promise<number> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-treasury-balance');
      if (error) throw error;
      return data?.balance || 0;
    } catch (error) {
      console.error('Failed to get treasury balance:', error);
      return 0;
    }
  };

  const value = {
    isConnected,
    userPaymail,
    connect,
    disconnect,
    splitPayment,
    getTreasuryBalance,
    showConnectModal,
    setShowConnectModal,
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
