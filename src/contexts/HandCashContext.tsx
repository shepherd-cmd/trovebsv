import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HandCashConnect } from '@handcash/handcash-connect';

interface HandCashContextType {
  handCashAccount: any | null;
  isConnected: boolean;
  userPaymail: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  createPayment: (amount: number, destination: string, description: string) => Promise<string>;
  splitPayment: (amount: number, ownerPaymail: string, description: string) => Promise<void>;
  getTreasuryBalance: () => Promise<number>;
}

const HandCashContext = createContext<HandCashContextType | undefined>(undefined);

const TREASURY_PAYMAIL = '$trove-treasury@handcash.io';
// TODO: Replace with actual HandCash App Secret from developers.handcash.io
const HANDCASH_APP_ID = 'your_app_id_here';

export function HandCashProvider({ children }: { children: ReactNode }) {
  const [handCashAccount, setHandCashAccount] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userPaymail, setUserPaymail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already connected
    const storedPaymail = localStorage.getItem('handcash_paymail');
    if (storedPaymail) {
      setUserPaymail(storedPaymail);
      setIsConnected(true);
      initializeHandCash();
    }
  }, []);

  const initializeHandCash = () => {
    try {
      const handCashConnect = new HandCashConnect({
        appId: HANDCASH_APP_ID,
        appSecret: import.meta.env.VITE_HANDCASH_APP_SECRET || '',
      });
      
      const authToken = localStorage.getItem('handcash_token');
      if (authToken) {
        const account = handCashConnect.getAccountFromAuthToken(authToken);
        setHandCashAccount(account);
      }
    } catch (error) {
      console.error('Failed to initialize HandCash:', error);
    }
  };

  const connect = async () => {
    try {
      const handCashConnect = new HandCashConnect({
        appId: HANDCASH_APP_ID,
        appSecret: import.meta.env.VITE_HANDCASH_APP_SECRET || '',
      });

      const redirectUrl = `${window.location.origin}/auth/handcash`;
      const authUrl = handCashConnect.getRedirectionUrl();
      
      // Open HandCash auth in new window
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect to HandCash:', error);
      throw error;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('handcash_token');
    localStorage.removeItem('handcash_paymail');
    setHandCashAccount(null);
    setIsConnected(false);
    setUserPaymail(null);
  };

  const createPayment = async (
    amount: number,
    destination: string,
    description: string
  ): Promise<string> => {
    if (!handCashAccount) {
      throw new Error('HandCash not connected');
    }

    try {
      const payment = await handCashAccount.wallet.pay({
        payments: [
          {
            destination,
            currencyCode: 'SAT',
            sendAmount: amount,
          },
        ],
        description,
      });

      return payment.transactionId;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  const splitPayment = async (
    amount: number,
    ownerPaymail: string,
    description: string
  ): Promise<void> => {
    if (!handCashAccount) {
      throw new Error('HandCash not connected');
    }

    const ownerShare = Math.floor(amount * 0.8); // 80% to owner
    const treasuryShare = amount - ownerShare; // 20% to treasury

    try {
      await handCashAccount.wallet.pay({
        payments: [
          {
            destination: ownerPaymail,
            currencyCode: 'SAT',
            sendAmount: ownerShare,
          },
          {
            destination: TREASURY_PAYMAIL,
            currencyCode: 'SAT',
            sendAmount: treasuryShare,
          },
        ],
        description,
      });
    } catch (error) {
      console.error('Split payment failed:', error);
      throw error;
    }
  };

  const getTreasuryBalance = async (): Promise<number> => {
    // This would require a separate HandCash account for the treasury
    // For now, return 0 as placeholder
    return 0;
  };

  const value = {
    handCashAccount,
    isConnected,
    userPaymail,
    connect,
    disconnect,
    createPayment,
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
