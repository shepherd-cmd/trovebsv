import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Wallet, QrCode } from 'lucide-react';
import { TREASURY_PAYMAIL } from '@/lib/handcash';

interface HandCashConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export const HandCashConnectModal = ({ isOpen, onClose }: HandCashConnectModalProps) => {
  const [showQR] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md parchment-card border-2"
        style={{ borderColor: 'hsl(42 88% 55% / 0.3)' }}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div 
              className="p-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(42 88% 55% / 0.2) 0%, hsl(38 60% 45% / 0.1) 100%)',
              }}
            >
              <Wallet className="h-12 w-12" style={{ color: 'hsl(42 88% 55%)' }} />
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold font-display text-center" style={{ color: 'hsl(38 60% 45%)' }}>
            Connect Your Attic Vault
          </DialogTitle>
          <DialogDescription className="text-center font-body text-muted-foreground">
            HandCash integration coming soon for instant payments and royalties
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {!showQR ? (
            <>
              {/* Primary HandCash Connect - Coming Soon */}
              <Button
                disabled
                className="w-full py-6 text-lg brass-button opacity-50 cursor-not-allowed"
              >
                <Coins className="mr-2 h-5 w-5" />
                Connect with HandCash (Coming Soon)
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div 
                className="p-6 rounded-lg text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                {/* QR Code Placeholder */}
                <div 
                  className="w-48 h-48 mx-auto mb-4 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'white',
                  }}
                >
                  <QrCode className="h-40 w-40" style={{ color: 'hsl(30 25% 10%)' }} />
                </div>
                
                <p className="text-sm font-body text-muted-foreground mb-2">
                  Send BSV to:
                </p>
                <code 
                  className="text-xs font-mono px-3 py-2 rounded"
                  style={{
                    background: 'rgba(139, 90, 0, 0.1)',
                    color: 'hsl(42 88% 55%)',
                  }}
                >
                  {TREASURY_PAYMAIL}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div 
          className="mt-6 p-4 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 90, 0, 0.05) 0%, transparent 100%)',
          }}
        >
          <h4 className="font-semibold font-display mb-2 text-sm" style={{ color: 'hsl(38 60% 45%)' }}>
            Why Connect HandCash?
          </h4>
          <ul className="space-y-1 text-xs text-muted-foreground font-body">
            <li>✓ Instant royalty payments</li>
            <li>✓ Zero-conf transactions</li>
            <li>✓ Fraud protection built-in</li>
            <li>✓ Track earnings in real-time</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
