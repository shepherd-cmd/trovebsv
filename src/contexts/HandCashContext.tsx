import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useTroveStore } from '@/store/useTroveStore';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateHandCashAuth, 
  handleHandCashCallback, 
  disconnectHandCash,
  isHandCashAuthenticated,
  getCurrentUserPaymail,
  sendPaymentWithSplit,
  getTreasuryBalance as getBalance,
} from '@/lib/handcash';

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
  const { paymail, setPaymail, activeTab, setActiveTab } = useTroveStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const isConnected = !!paymail && isHandCashAuthenticated();

  // Handle OAuth callback on mount
  useEffect(() => {
    const handleCallback = async () => {
      const { authToken, paymail: returnedPaymail } = handleHandCashCallback();
      
      if (authToken) {
        setIsLoading(true);
        try {
          // Get paymail if not in URL params
          const userPaymail = returnedPaymail || await getCurrentUserPaymail();
          
          if (userPaymail) {
            setPaymail(userPaymail);
            toast({
              title: 'HandCash Connected',
              description: `Connected as ${userPaymail}`,
            });
          }
        } catch (error) {
          console.error('Failed to get paymail:', error);
          toast({
            title: 'Connection Warning',
            description: 'Connected but could not retrieve paymail',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
  }, [setPaymail, toast]);

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isHandCashAuthenticated() && !paymail) {
        setIsLoading(true);
        try {
          const userPaymail = await getCurrentUserPaymail();
          if (userPaymail) {
            setPaymail(userPaymail);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [paymail, setPaymail]);

  const connect = () => {
    try {
      // Show modal first
      setActiveTab('connect');
      // OAuth redirect will be triggered by modal button
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to HandCash',
        variant: 'destructive',
      });
    }
  };

  const disconnect = () => {
    disconnectHandCash();
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
    if (!isConnected) {
      throw new Error('HandCash not connected');
    }

    setIsLoading(true);
    try {
      const result = await sendPaymentWithSplit(amount, ownerPaymail, description);
      
      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTreasuryBalance = async (): Promise<number> => {
    try {
      return await getBalance();
    } catch (error) {
      console.error('Failed to get treasury balance:', error);
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
    isLoading,
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
