// Business treasury paymail - dedicated Trove commercial HandCash account
// TODO: Replace '$trove-business' with the actual HandCash business wallet paymail once created
export const TREASURY_PAYMAIL = '$trove-business';

// Gorilla Pool paymail for indexing service fee share
// TODO: Replace with actual Gorilla Pool paymail once partnership is confirmed
export const GORILLA_POOL_PAYMAIL = '$gorilla-pool';

// Fee split constants (percentages as decimals)
export const OWNER_SHARE = 0.65;      // 65% to document owner
export const PLATFORM_SHARE = 0.20;   // 20% to Trove business treasury
export const GORILLA_POOL_SHARE = 0.15; // 15% to Gorilla Pool for indexing

// Entry fee in GBP
export const ENTRY_FEE_GBP = 3.99;

// Inscription cost per upload in GBP (fiat-fixed, platform converts to sats internally)
export const INSCRIPTION_FEE_GBP = 0.79;

// Credits granted on entry fee purchase
export const ENTRY_CREDITS = 5;

/**
 * All HandCash operations are handled server-side via Edge Functions
 * to protect app secrets and ensure secure payment processing.
 *
 * Available Edge Functions:
 * - process-payment: Handle document unlock payments with 65/20/15 splits
 * - sponsor-inscription: Credit-based inscriptions from treasury
 * - get-treasury-balance: Fetch current treasury balance
 * - purchase-credits: Handle £3.99 entry fee and credit top-ups
 */

export function getTreasuryPaymail(): string {
  return TREASURY_PAYMAIL;
}
