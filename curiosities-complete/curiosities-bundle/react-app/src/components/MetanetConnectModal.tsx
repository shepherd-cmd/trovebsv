/**
 * MetanetConnectModal — Three-path identity & wallet selection
 *
 * curIosities uses a progressive Web3 model so nobody gets left behind:
 *
 *   Path 1 — Web2 (email / Google / Apple)
 *     Zero crypto knowledge needed. Earnings accumulate in a platform-held
 *     custodial wallet. Claim them any time by upgrading to Path 2 or 3.
 *
 *   Path 2 — Sigma ID
 *     Pseudonymous BSV identity. No real name required. Payments go direct
 *     to your Sigma wallet. The natural step up from Web2.
 *
 *   Path 3 — Metanet Client
 *     Full self-custody via the Babbage SDK. Keys never leave your device.
 *     For the BSV native.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Mail, ExternalLink, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useMetanet } from '@/contexts/MetanetContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetanetConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Screen = 'choose' | 'web2' | 'sigma' | 'metanet';

export const MetanetConnectModal = ({ isOpen, onClose }: MetanetConnectModalProps) => {
  const { connect, isLoading } = useMetanet();
  const { toast } = useToast();
  const [screen, setScreen] = useState<Screen>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setScreen('choose');
    setEmail('');
    setPassword('');
    onClose();
  };

  // ── Web2: email auth ────────────────────────────────────────────────────────
  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      toast({
        title: isSignUp ? 'Account created' : 'Welcome back',
        description: 'Your earnings will be held safely until you connect a BSV wallet.',
      });
      handleClose();
    } catch (err) {
      toast({
        title: 'Authentication failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Web2: OAuth (Google / Apple) ─────────────────────────────────────────
  const handleOAuth = async (provider: 'google' | 'apple') => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      toast({
        title: 'Sign-in failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  // ── Sigma ID ─────────────────────────────────────────────────────────────
  const handleSigmaConnect = async () => {
    try {
      /**
       * TODO: Implement Sigma ID OAuth flow.
       *
       * Sigma uses an OAuth2-compatible flow. When the SDK/redirect URI is ready:
       *
       *   1. Redirect user to Sigma authorisation endpoint
       *   2. Receive callback with sigma_id and BSV address
       *   3. Call supabase.rpc('claim_pending_balance', { new_wallet_type: 'sigma', new_identity: sigmaId })
       *   4. Future earnings go direct to their Sigma wallet
       *
       * Sigma developer portal: https://sigma.id
       */
      toast({
        title: 'Sigma ID coming soon',
        description: 'Sigma integration is being finalised. Use email for now — your earnings transfer over when it launches.',
      });
    } catch (err) {
      toast({ title: 'Connection failed', variant: 'destructive' });
    }
  };

  // ── Metanet Client ────────────────────────────────────────────────────────
  const handleMetanetConnect = async () => {
    await connect();
    handleClose();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Screens
  // ─────────────────────────────────────────────────────────────────────────

  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(20,14,8,0.97), rgba(30,20,8,0.93))',
    border: '1px solid hsl(42 88% 55% / 0.2)',
    borderRadius: '10px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md parchment-card border-2"
        style={{ borderColor: 'hsl(42 88% 55% / 0.25)' }}
      >
        {/* ── CHOOSE PATH ── */}
        {screen === 'choose' && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full"
                  style={{ background: 'radial-gradient(circle, hsl(42 88% 55% / 0.15) 0%, transparent 75%)' }}>
                  <Wallet className="h-10 w-10" style={{ color: 'hsl(42 88% 55%)' }} />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold font-display text-center"
                style={{ color: 'hsl(38 60% 48%)' }}>
                Join the Cabinet
              </DialogTitle>
              <DialogDescription className="text-center font-body text-muted-foreground text-sm">
                Choose how you want to connect. You can always upgrade later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">

              {/* Path 1 — Web2 */}
              <div
                style={cardStyle}
                className="hover:border-gold group"
                onClick={() => setScreen('web2')}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(42 88% 55% / 0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(42 88% 55% / 0.2)')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📧</div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: 'hsl(40 20% 85%)' }}>
                        Email, Google or Apple
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No crypto needed. Earnings held safely until you're ready.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'hsl(120 50% 35% / 0.2)', color: 'hsl(120 50% 60%)', border: '1px solid hsl(120 50% 35% / 0.3)' }}>
                    ✓ Recommended for most people
                  </span>
                </div>
              </div>

              {/* Path 2 — Sigma ID */}
              <div
                style={cardStyle}
                onClick={() => setScreen('sigma')}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(42 88% 55% / 0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(42 88% 55% / 0.2)')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🪪</div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: 'hsl(40 20% 85%)' }}>
                        Sigma ID
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pseudonymous BSV identity. No real name. Payments go direct to your wallet.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'hsl(195 75% 45% / 0.15)', color: 'hsl(195 75% 60%)', border: '1px solid hsl(195 75% 45% / 0.3)' }}>
                    ◎ BSV identity · pseudonymous
                  </span>
                </div>
              </div>

              {/* Path 3 — Metanet Client */}
              <div
                style={cardStyle}
                onClick={() => setScreen('metanet')}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(42 88% 55% / 0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(42 88% 55% / 0.2)')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔐</div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: 'hsl(40 20% 85%)' }}>
                        Metanet Client
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Full self-custody. Your keys never leave your device. BSV native.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'hsl(42 88% 55% / 0.1)', color: 'hsl(42 88% 65%)', border: '1px solid hsl(42 88% 55% / 0.25)' }}>
                    ⛓ Full self-sovereignty
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4" style={{ lineHeight: 1.6 }}>
              Start with email — your earnings accumulate safely. When you see a balance worth claiming, connect a BSV wallet and it sweeps straight to you.
            </p>
          </>
        )}

        {/* ── WEB2: EMAIL / OAUTH ── */}
        {screen === 'web2' && (
          <>
            <DialogHeader>
              <button onClick={() => setScreen('choose')} className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 hover:text-gold transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <DialogTitle className="text-xl font-bold font-display" style={{ color: 'hsl(38 60% 48%)' }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Your earnings are held safely until you connect a BSV wallet.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOAuth('google')}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid hsl(222 14% 22%)', color: 'hsl(40 20% 80%)' }}
                >
                  <span>G</span> Google
                </button>
                <button
                  onClick={() => handleOAuth('apple')}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid hsl(222 14% 22%)', color: 'hsl(40 20% 80%)' }}
                >
                  <span>🍎</span> Apple
                </button>
              </div>

              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px" style={{ background: 'hsl(222 14% 18%)' }} />
                <span className="text-xs text-muted-foreground">or email</span>
                <div className="flex-1 h-px" style={{ background: 'hsl(222 14% 18%)' }} />
              </div>

              {/* Email + password */}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm bg-transparent outline-none"
                style={{ border: '1px solid hsl(222 14% 22%)', color: 'hsl(40 20% 85%)' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                className="w-full px-4 py-3 rounded-lg text-sm bg-transparent outline-none"
                style={{ border: '1px solid hsl(222 14% 22%)', color: 'hsl(40 20% 85%)' }}
              />

              <Button
                onClick={handleEmailAuth}
                disabled={submitting || !email || !password}
                className="w-full py-5 font-display font-bold brass-button"
              >
                <Mail className="mr-2 h-4 w-4" />
                {submitting ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-xs text-center text-muted-foreground hover:text-gold transition-colors py-1"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        )}

        {/* ── SIGMA ID ── */}
        {screen === 'sigma' && (
          <>
            <DialogHeader>
              <button onClick={() => setScreen('choose')} className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 hover:text-gold transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <DialogTitle className="text-xl font-bold font-display" style={{ color: 'hsl(38 60% 48%)' }}>
                Connect with Sigma ID
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Pseudonymous BSV identity. Your name stays yours.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="rounded-lg p-4 space-y-2" style={{ background: 'rgba(20,14,8,0.8)', border: '1px solid hsl(195 75% 45% / 0.2)' }}>
                {[
                  'No real name required — choose a pseudonym',
                  'Payments go directly to your Sigma BSV wallet',
                  'One identity across the entire BSV Metanet',
                  'Your existing custodial earnings transfer over automatically',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(195 75% 55%)' }} />
                    <p className="text-xs text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>

              <Button onClick={handleSigmaConnect} disabled={isLoading} className="w-full py-5 font-display font-bold brass-button">
                <span className="mr-2">🪪</span>
                Connect Sigma ID
              </Button>

              <a
                href="https://sigma.id"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> Don't have Sigma ID yet? Get one free →
              </a>
            </div>
          </>
        )}

        {/* ── METANET CLIENT ── */}
        {screen === 'metanet' && (
          <>
            <DialogHeader>
              <button onClick={() => setScreen('choose')} className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 hover:text-gold transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <DialogTitle className="text-xl font-bold font-display" style={{ color: 'hsl(38 60% 48%)' }}>
                Connect Metanet Client
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Full self-custody. Your keys, your coins, your identity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {[
                { n: '1', title: 'Download Metanet Client', desc: 'The free desktop app that holds your BSV keys securely on your device.', link: 'https://projectbabbage.com/metanet-client', linkText: 'Download free →' },
                { n: '2', title: 'Create your identity', desc: 'Open the app and set up your Metanet identity. Takes about 60 seconds.', link: null, linkText: null },
                { n: '3', title: 'Click Connect below', desc: 'With the Client running in the background, curIosities links to it automatically.', link: null, linkText: null },
              ].map(step => (
                <div key={step.n} className="flex gap-3 p-3 rounded-lg"
                  style={{ background: 'rgba(20,14,8,0.7)', border: '1px solid hsl(42 88% 55% / 0.12)' }}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-display mt-0.5"
                    style={{ background: 'hsl(42 88% 55% / 0.15)', color: 'hsl(42 88% 55%)' }}>
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-display font-semibold" style={{ color: 'hsl(40 20% 82%)' }}>{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    {step.link && (
                      <a href={step.link} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: 'hsl(42 88% 55%)' }}>
                        <ExternalLink className="h-3 w-3" />{step.linkText}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <Button onClick={handleMetanetConnect} disabled={isLoading} className="w-full py-5 font-display font-bold brass-button">
                <Wallet className="mr-2 h-4 w-4" />
                {isLoading ? 'Connecting…' : 'Connect Metanet Client'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
