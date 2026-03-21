/**
 * PaymentDeepLink — Babbage SDK payment trigger
 *
 * Replaces the HandCash deep-link approach. With the Metanet Client running
 * locally, @babbage/sdk-ts createAction() handles everything in-process —
 * no deep links, no redirects, no app-switching.
 *
 * TODO: Once @babbage/sdk-ts is installed, uncomment the SDK import and
 * replace the stub handlePayment body with the real createAction call.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// TODO: import { createAction } from '@babbage/sdk-ts';

interface PaymentDeepLinkProps {
  /** Total satoshis for the unlock (before split) */
  totalSats: number;
  /** Metanet identity / paymail of the document owner (receives 80%) */
  ownerIdentity: string;
  /** Human-readable description shown in the Metanet Client approval dialog */
  description: string;
  onSuccess?: (txid: string) => void;
  onError?: (err: Error) => void;
}

export const PaymentDeepLink = ({
  totalSats,
  ownerIdentity,
  description,
  onSuccess,
  onError,
}: PaymentDeepLinkProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      /**
       * TODO: Replace this stub with the real Babbage SDK call:
       *
       * import { TREASURY_IDENTITY, GORILLA_POOL_IDENTITY, OWNER_SHARE, PLATFORM_SHARE, GORILLA_POOL_SHARE } from '@/lib/metanet';
       *
       * const { txid } = await createAction({
       *   description,
       *   outputs: [
       *     { to: ownerIdentity,         satoshis: Math.floor(totalSats * OWNER_SHARE) },
       *     { to: TREASURY_IDENTITY,     satoshis: Math.floor(totalSats * PLATFORM_SHARE) },
       *     { to: GORILLA_POOL_IDENTITY, satoshis: Math.floor(totalSats * GORILLA_POOL_SHARE) },
       *   ],
       * });
       *
       * The Metanet Client will show an approval dialog to the user,
       * then broadcast the transaction. txid is returned on approval.
       */

      throw new Error('Metanet payment integration coming soon. Install @babbage/sdk-ts to enable.');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed');
      toast({
        title: 'Payment unavailable',
        description: 'Metanet Client integration is coming soon.',
        variant: 'destructive',
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full brass-button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Awaiting Metanet approval…
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Pay {totalSats.toLocaleString()} sats via Metanet
        </>
      )}
    </Button>
  );
};
