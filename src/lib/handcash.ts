// Business treasury paymail - dedicated Trove commercial HandCash account
// TODO: Replace '$trove-business' with the actual HandCash business wallet paymail once created
export const TREASURY_PAYMAIL = '$trove-business';

// Gorilla Pool paymail for indexing service fee share
// TODO: Replace with actual Gorilla Pool paymail once partnership is confirmed
export const GORILLA_POOL_PAYMAIL = '$gorilla-pool';

// Fee split constants (percentages as decimals)
export const OWNER_SHARE = 0.80;      // 80% to document owner — their history, their reward
export const PLATFORM_SHARE = 0.10;   // 10% to Trove business treasury
export const GORILLA_POOL_SHARE = 0.10; // 10% to Gorilla Pool for indexing

// Entry fee in GBP (one-time, splits 50/50: £2 to platform, £2 → BSV sats for user)
export const ENTRY_FEE_GBP = 3.99;

// Top-up price per additional inscription credit
export const TOPUP_FEE_GBP = 0.79;

// Inscription credits granted on entry fee purchase (placeholder until Stripe + BSV wallet live)
export const ENTRY_CREDITS = 5;

/**
 * All HandCash operations are handled server-side via Edge Functions
 * to protect app secrets and ensure secure payment processing.
 *
 * Available Edge Functions:
 * - process-payment: Handle document unlock payments with 80/10/10 splits
 * - sponsor-inscription: Credit-based inscriptions from treasury
 * - get-treasury-balance: Fetch current treasury balance
 * - purchase-credits: Handle £3.99 entry fee and credit top-ups
 */

export function getTreasuryPaymail(): string {
  return TREASURY_PAYMAIL;
}
