/**
 * process-payment — Edge function for 80/10/10 BSV payment split
 *
 * Wallet backend: Metanet Client / Babbage SDK
 *
 * NOTE: With the Babbage SDK, the payment split happens client-side via
 * createAction() — the Metanet Client builds a single transaction with three
 * outputs and the user approves it locally. This edge function therefore acts
 * as a record-keeper and webhook handler rather than initiating payments itself.
 *
 * TODO: When wiring live payments via the Babbage overlay/server SDK:
 *   npm install @babbage/sdk-ts  (server-side variant if available)
 *   or use the Overlay Services REST API to broadcast pre-built transactions.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// curIosities business wallet — Metanet identity
// TODO: Replace with actual curIosities Metanet identity once created
const TREASURY_IDENTITY   = 'curiosities@metanet.id';
const GORILLA_POOL_IDENTITY = 'gorilla-pool@metanet.id'; // TODO: confirm with Kurt

// Revenue split
const OWNER_SHARE       = 0.80;
const PLATFORM_SHARE    = 0.10;
const GORILLA_POOL_SHARE = 0.10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { totalSats, ownerIdentity, description, txid } = await req.json();

    // Calculate the split for logging / DB recording purposes
    const ownerSats       = Math.floor(totalSats * OWNER_SHARE);
    const platformSats    = Math.floor(totalSats * PLATFORM_SHARE);
    const gorillaPoolSats = totalSats - ownerSats - platformSats;

    console.log('[process-payment] Recording payment split:', {
      txid,
      description,
      ownerIdentity, ownerSats,
      treasury: TREASURY_IDENTITY, platformSats,
      gorillaPool: GORILLA_POOL_IDENTITY, gorillaPoolSats,
    });

    /**
     * TODO: Live payment flow options —
     *
     * Option A (recommended): Client-side createAction via @babbage/sdk-ts
     *   The front-end builds the 3-output transaction; this function just
     *   receives the txid for DB recording and webhook confirmation.
     *
     * Option B: Server-side via Babbage Overlay Services
     *   POST to the overlay REST API with the pre-built transaction envelope.
     *   Useful if you want server-authorised payments without client SDK.
     *
     * Option C: Direct BSV node broadcast
     *   Build the tx manually (using bsv.js / @bsv/sdk) and broadcast via
     *   WhatsOnChain or JungleBus REST API.
     *
     * In all cases the split logic above stays the same.
     */

    return new Response(JSON.stringify({
      success: true,
      ownerSats,
      platformSats,
      gorillaPoolSats,
      treasuryIdentity: TREASURY_IDENTITY,
      gorillaPoolIdentity: GORILLA_POOL_IDENTITY,
      txid: txid ?? `pending-${Date.now()}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[process-payment] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Payment processing failed',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
