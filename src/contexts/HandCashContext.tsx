import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HandCashContextType {
  isConnected: boolean;
  userPaymail: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  splitPayment: (amount: number, ownerPaymail: string, description: string) => Promise<void>;
  getTreasuryBalance: () => Promise<number>;
}

const HandCashContext = createContext<HandCashContextType | undefined>(undefined);

export function HandCashProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [userPaymail, setUserPaymail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already connected
    const storedPaymail = localStorage.getItem('handcash_paymail');
    if (storedPaymail) {
      setUserPaymail(storedPaymail);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      // TODO: Implement HandCash OAuth flow
      // For now, prompt for paymail
      const paymail = prompt('Enter your HandCash paymail:');
      if (paymail) {
        localStorage.setItem('handcash_paymail', paymail);
        setUserPaymail(paymail);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect to HandCash:', error);
      throw error;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('handcash_paymail');
    setIsConnected(false);
    setUserPaymail(null);
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
