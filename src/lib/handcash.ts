// Treasury paymail - founder's existing HandCash account
export const TREASURY_PAYMAIL = '$sebc';

/**
 * All HandCash operations are handled server-side via Edge Functions
 * to protect app secrets and ensure secure payment processing.
 * 
 * Available Edge Functions:
 * - process-payment: Handle document unlock payments with 80/20 splits
 * - sponsor-inscription: Treasury-sponsored free inscriptions
 * - get-treasury-balance: Fetch current treasury balance
 */

export function getTreasuryPaymail(): string {
  return TREASURY_PAYMAIL;
}
