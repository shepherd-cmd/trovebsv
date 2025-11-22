import { HandCashConnect } from '@handcash/handcash-connect';

// Treasury paymail - founder's existing HandCash account
export const TREASURY_PAYMAIL = '$sebc';

// HandCash Connect singleton instance
let handCashInstance: HandCashConnect | null = null;

/**
 * Get or create HandCash Connect instance
 * Uses production environment and OAuth redirect flow
 */
export function getHandCashConnect(): HandCashConnect {
  if (!handCashInstance) {
    handCashInstance = new HandCashConnect({
      appId: window.location.hostname, // Use domain as app identifier
      appSecret: '', // Not used in OAuth flow (client-side only)
    });
  }
  return handCashInstance;
}

/**
 * Get authenticated HandCash account instance
 * Requires user to have completed OAuth flow
 */
export function getHandCashAccount() {
  const authToken = localStorage.getItem('handcash_auth_token');
  if (!authToken) {
    throw new Error('HandCash not authenticated. Please connect your wallet.');
  }

  const handcash = getHandCashConnect();
  return handcash.getAccountFromAuthToken(authToken);
}

/**
 * Initiate HandCash OAuth redirect flow
 * Redirects user to HandCash app or web for authentication
 */
export function initiateHandCashAuth() {
  const handcash = getHandCashConnect();
  const redirectUrl = window.location.origin + '/';
  
  // Get authorization URL from HandCash SDK
  const authUrl = handcash.getRedirectionUrl();
  
  // Detect mobile for deep-linking
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Try deep link first (opens HandCash app if installed)
    window.location.href = `handcash://connect?redirectUrl=${encodeURIComponent(redirectUrl)}`;
    
    // Fallback to web after 1.5s if app didn't open
    setTimeout(() => {
      window.location.href = authUrl;
    }, 1500);
  } else {
    // Desktop: redirect to HandCash web
    window.location.href = authUrl;
  }
}

/**
 * Handle OAuth callback and store auth token
 * Call this when user returns from HandCash OAuth flow
 */
export function handleHandCashCallback(): { authToken: string | null; paymail: string | null } {
  const params = new URLSearchParams(window.location.search);
  const authToken = params.get('authToken');
  
  if (authToken) {
    // Store token securely
    localStorage.setItem('handcash_auth_token', authToken);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return { authToken, paymail: null }; // Paymail will be fetched async
  }
  
  return { authToken: null, paymail: null };
}

/**
 * Disconnect HandCash (clear auth token)
 */
export function disconnectHandCash() {
  localStorage.removeItem('handcash_auth_token');
}

/**
 * Check if user is authenticated with HandCash
 */
export function isHandCashAuthenticated(): boolean {
  return !!localStorage.getItem('handcash_auth_token');
}

/**
 * Get current user's paymail (if authenticated)
 */
export async function getCurrentUserPaymail(): Promise<string | null> {
  try {
    const account = getHandCashAccount();
    const profile = await account.profile.getCurrentProfile();
    return (profile as any).paymail || profile.publicProfile?.paymail || null;
  } catch (error) {
    return null;
  }
}

/**
 * Send BSV payment with 80/20 split
 * 80% to document owner, 20% to treasury
 */
export async function sendPaymentWithSplit(
  amountSats: number,
  ownerPaymail: string,
  description: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const account = getHandCashAccount();
    
    // Calculate split amounts
    const ownerAmount = Math.floor(amountSats * 0.8);
    const treasuryAmount = amountSats - ownerAmount;
    
    // Create payment with multiple recipients
    const payment = await account.wallet.pay({
      description,
      payments: [
        {
          destination: ownerPaymail,
          currencyCode: 'SAT',
          sendAmount: ownerAmount,
        },
        {
          destination: TREASURY_PAYMAIL,
          currencyCode: 'SAT',
          sendAmount: treasuryAmount,
        },
      ],
    });
    
    return {
      success: true,
      transactionId: payment.transactionId,
    };
  } catch (error) {
    console.error('HandCash payment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Get treasury balance
 */
export async function getTreasuryBalance(): Promise<number> {
  try {
    const account = getHandCashAccount();
    const balance = await account.wallet.getSpendableBalance('SAT');
    return typeof balance === 'number' ? balance : (balance as any).spendableBalance || 0;
  } catch (error) {
    console.error('Failed to get treasury balance:', error);
    return 0;
  }
}
