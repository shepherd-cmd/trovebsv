import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink } from 'lucide-react';

interface PaymentDeepLinkProps {
  amount: number;
  recipient: string;
  description: string;
  onSuccess?: () => void;
  onFallback?: () => void;
}

export const PaymentDeepLink = ({ 
  amount, 
  recipient, 
  description,
  onSuccess,
  onFallback 
}: PaymentDeepLinkProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [deepLinkAttempted, setDeepLinkAttempted] = useState(false);

  useEffect(() => {
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  const handlePayment = () => {
    if (!isMobile) {
      // Desktop: Open HandCash web app
      const handcashWebUrl = `https://app.handcash.io/pay?to=${encodeURIComponent(recipient)}&amount=${amount}&currency=SAT&note=${encodeURIComponent(description)}`;
      window.open(handcashWebUrl, '_blank');
      return;
    }

    // Mobile: Try deep link first
    const deepLink = `handcash://pay?to=${encodeURIComponent(recipient)}&amount=${amount}&currency=SAT&note=${encodeURIComponent(description)}`;
    
    setDeepLinkAttempted(true);
    
    // Create an iframe to trigger deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    // Set a timeout to detect if deep link failed
    const timeout = setTimeout(() => {
      document.body.removeChild(iframe);
      
      // If still on page after 2 seconds, deep link probably failed
      if (onFallback) {
        onFallback();
      }
      
      // Fallback to web app
      const handcashWebUrl = `https://app.handcash.io/pay?to=${encodeURIComponent(recipient)}&amount=${amount}&currency=SAT&note=${encodeURIComponent(description)}`;
      window.location.href = handcashWebUrl;
    }, 2000);

    // Clean up if user returns (app opened successfully)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        if (onSuccess) {
          // Simulate success - in production, verify via webhook
          setTimeout(onSuccess, 3000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full brass-button"
    >
      {isMobile ? (
        <>
          <Smartphone className="mr-2 h-4 w-4" />
          Pay {amount} sats with HandCash
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          Pay {amount} sats with HandCash
        </>
      )}
    </Button>
  );
};