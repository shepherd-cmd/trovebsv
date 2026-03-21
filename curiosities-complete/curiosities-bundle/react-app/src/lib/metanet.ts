/**
 * curIosities — Metanet / Babbage SDK integration layer
 *
 * Wallet: Metanet Client (Project Babbage)
 * SDK:    @babbage/sdk-ts
 *
 * The Metanet Client is a locally-running desktop app that holds the user's keys.
 * The Babbage SDK communicates with it over localhost — no private keys ever
 * leave the user's machine.
 *
 * Install SDK in your project:
 *   npm install @babbage/sdk-ts
 *
 * Metanet Client download: https://projectbabbage.com/metanet-client
 */

// ── curIosities business wallet ───────────────────────────────────────────────
// TODO: Replace with the actual curIosities Metanet identity public key / paymail
// once the business Metanet Client identity is created.
export const TREASURY_IDENTITY = 'curiosities@metanet.id';

// ── Gorilla Pool indexing wallet ──────────────────────────────────────────────
// TODO: Replace with actual Gorilla Pool Metanet paymail once confirmed with Kurt
export const GORILLA_POOL_IDENTITY = 'gorilla-pool@metanet.id';

// ── Revenue split constants ───────────────────────────────────────────────────
export const OWNER_SHARE      = 0.80; // 80% — document uploader
export const PLATFORM_SHARE   = 0.10; // 10% — curIosities treasury
export const GORILLA_POOL_SHARE = 0.10; // 10% — Gorilla Pool indexing

// ── Entry fee & inscription pricing ──────────────────────────────────────────
export const ENTRY_FEE_GBP = 3.99;
// Per-upload cost in GBP (fiat-fixed; platform converts to sats at live rate)
export const INSCRIPTION_FEE_GBP = 0.79;
// 50% funds the platform, 50% converts to BSV sats for the user's inscription balance
// ENTRY_CREDITS is a legacy concept — the actual credit is a sats allowance derived
// from the BSV conversion at the live rate at purchase time. This constant is kept
// for backward-compatibility with profile.inscription_credits until the sats-balance
// column migration is deployed.
export const ENTRY_CREDITS = 5; // approximate starting uploads at ~£0.40/upload

// ── Babbage SDK — createAction payment shape ──────────────────────────────────
//
// When the Babbage SDK is wired in, use createAction() to build the 80/10/10
// split as a single BSV transaction with three outputs. Example:
//
//   import { createAction } from '@babbage/sdk-ts';
//
//   await createAction({
//     description: `Unlock: ${documentTitle}`,
//     outputs: [
//       { to: ownerPaymail, satoshis: Math.floor(totalSats * OWNER_SHARE)    },
//       { to: TREASURY_IDENTITY,     satoshis: Math.floor(totalSats * PLATFORM_SHARE)   },
//       { to: GORILLA_POOL_IDENTITY, satoshis: Math.floor(totalSats * GORILLA_POOL_SHARE) },
//     ],
//   });
//
// The Metanet Client handles signing, key management, and broadcast.
// No secrets are stored server-side.

// ── Babbage SDK — identity / wallet detection ─────────────────────────────────
//
//   import { getPublicKey, isAuthenticated } from '@babbage/sdk-ts';
//
//   const connected = await isAuthenticated();           // is Metanet Client running?
//   const pubKey    = await getPublicKey({ reason: 'Identify your curIosities account' });
//
// Use pubKey as the user's stable identity — no paymail required for identity.

export function getTreasuryIdentity(): string {
  return TREASURY_IDENTITY;
}
