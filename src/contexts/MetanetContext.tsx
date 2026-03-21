/**
 * MetanetContext — Babbage SDK / Metanet Client wallet context
 *
 * Replaces HandCashContext. All payment and identity operations route through
 * the Metanet Client desktop app via @babbage/sdk-ts.
 *
 * TODO: Once @babbage/sdk-ts is installed, uncomment the SDK imports below
 * and remove the stub implementations.
 *
 *   import { createAction, getPublicKey, isAuthenticated } from '@babbage/sdk-ts';
 */

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useTroveStore } from '@/store/useTroveStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OWNER_SHARE, PLATFORM_SHARE, GORILLA_POOL_SHARE, TREASURY_IDENTITY, GORILLA_POOL_IDENTITY } from '@/lib/metanet';

/**
 * Progressive Web3 wallet type:
 *   custodial — Web2 user (email/Google/Apple). Earnings held by platform.
 *   sigma     — Sigma ID pseudonymous BSV wallet. Payments route direct.
 *   metanet   — Metanet Client full self-custody via Babbage SDK.
 */
export type WalletType = 'custodial' | 'sigma' | 'metanet';

interface MetanetContextType {
  isConnected: boolean;
  walletType: WalletType;
  userIdentity: string | null;
  pendingBalanceBsv: number;          // custodial earnings awaiting claim
  connect: () => Promise<void>;
  disconnect: () => void;
  upgradeToSigma: (sigmaId: string) => Promise<void>;
  splitPayment: (totalSats: number, ownerIdentity: string, description: string) => Promise<{ txid: string }>;
  getTreasuryBalance: () => Promise<number>;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  isLoading: boolean;
}

const MetanetContext = createContext<MetanetContextType | undefined>(undefined);

export function MetanetProvider({ children }: { children: ReactNode }) {
  const { paymail, activeTab, setActiveTab } = useTroveStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userIdentity, setUserIdentity] = useState<string | null>(paymail ?? null);
  const [walletType, setWalletType] = useState<WalletType>('custodial');
  const [pendingBalanceBsv, setPendingBalanceBsv] = useState(0);

  // On mount: restore session from Supabase auth + load wallet type from profile
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserIdentity(session.user.email ?? session.user.id);

      // Load wallet type and pending balance from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_type, pending_balance_bsv, sigma_id, metanet_identity')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setWalletType((profile.wallet_type as WalletType) ?? 'custodial');
        setPendingBalanceBsv(Number(profile.pending_balance_bsv ?? 0));
        // For Metanet users also check SDK
        if (profile.wallet_type === 'metanet') {
          // TODO: await isAuthenticated() from @babbage/sdk-ts
          console.log('[Metanet] Metanet user detected — SDK check pending @babbage/sdk-ts install');
        }
      }
    };

    restoreSession();

    // Keep in sync with auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserIdentity(session.user.email ?? session.user.id);
      } else {
        setUserIdentity(null);
        setWalletType('custodial');
        setPendingBalanceBsv(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const connect = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with Babbage SDK call:
      // const pubKey = await getPublicKey({ reason: 'Connect your curIosities identity' });
      // setUserIdentity(pubKey);
      // toast({ title: 'Metanet Connected', description: 'Your Metanet identity is linked.' });

      // Stub: prompt user to open Metanet Client
      toast({
        title: 'Open Metanet Client',
        description: 'Make sure the Metanet Client desktop app is running, then try again.',
      });
      setActiveTab('connect');
    } catch (err) {
      toast({
        title: 'Connection failed',
        description: 'Could not reach the Metanet Client. Is the desktop app running?',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setUserIdentity(null);
    toast({ title: 'Disconnected', description: 'Your identity has been unlinked from curIosities.' });
  };

  /**
   * splitPayment — sends a single BSV transaction with three outputs:
   *   80% → document owner
   *   10% → curIosities treasury (TREASURY_IDENTITY)
   *   10% → Gorilla Pool  (GORILLA_POOL_IDENTITY)
   *
   * TODO: Replace stub with Babbage SDK createAction:
   *
   *   const { txid } = await createAction({
   *     description,
   *     outputs: [
   *       { to: ownerIdentity,         satoshis: Math.floor(totalSats * OWNER_SHARE) },
   *       { to: TREASURY_IDENTITY,     satoshis: Math.floor(totalSats * PLATFORM_SHARE) },
   *       { to: GORILLA_POOL_IDENTITY, satoshis: Math.floor(totalSats * GORILLA_POOL_SHARE) },
   *     ],
   *   });
   *   return { txid };
   */
  const splitPayment = async (
    totalSats: number,
    ownerIdentity: string,
    description: string
  ): Promise<{ txid: string }> => {
    const ownerSats       = Math.floor(totalSats * OWNER_SHARE);
    const platformSats    = Math.floor(totalSats * PLATFORM_SHARE);
    const gorillaPoolSats = totalSats - ownerSats - platformSats;

    console.log('[Metanet] splitPayment (stub)', {
      description,
      ownerIdentity, ownerSats,
      treasury: TREASURY_IDENTITY, platformSats,
      gorillaPool: GORILLA_POOL_IDENTITY, gorillaPoolSats,
    });

    // Stub: return mock txid until SDK is wired
    throw new Error('Metanet payment integration coming soon. Install @babbage/sdk-ts to enable live payments.');
  };

  /**
   * upgradeToSigma — called when user connects their Sigma ID.
   * Transfers any custodial balance to their Sigma wallet,
   * then marks the account as sigma-type going forward.
   */
  const upgradeToSigma = async (sigmaId: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');

      const { data: claimedBalance, error } = await supabase.rpc('claim_pending_balance', {
        user_id: session.user.id,
        new_wallet_type: 'sigma',
        new_identity: sigmaId,
      });

      if (error) throw error;

      setWalletType('sigma');
      setUserIdentity(sigmaId);
      setPendingBalanceBsv(0);

      if (claimedBalance && claimedBalance > 0) {
        toast({
          title: 'Balance claimed',
          description: `${claimedBalance.toFixed(8)} BSV is being swept to your Sigma wallet.`,
        });
        // TODO: Trigger actual BSV payout to Sigma wallet via edge function
      }

      toast({ title: 'Sigma ID connected', description: `Welcome, ${sigmaId}` });
    } catch (err) {
      toast({
        title: 'Upgrade failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTreasuryBalance = async (): Promise<number> => {
    // TODO: Query treasury identity balance via Overlay Services or JungleBus
    return 0;
  };

  const value: MetanetContextType = {
    isConnected: !!userIdentity,
    walletType,
    userIdentity,
    pendingBalanceBsv,
    connect,
    disconnect,
    upgradeToSigma,
    splitPayment,
    getTreasuryBalance,
    showConnectModal: activeTab === 'connect',
    setShowConnectModal: (show) => setActiveTab(show ? 'connect' : 'home'),
    isLoading,
  };

  return (
    <MetanetContext.Provider value={value}>
      {children}
    </MetanetContext.Provider>
  );
}

export function useMetanet() {
  const context = useContext(MetanetContext);
  if (context === undefined) {
    throw new Error('useMetanet must be used within a MetanetProvider');
  }
  return context;
}
