import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Business wallet - TODO: replace with actual HandCash business wallet paymail once created
const TREASURY_PAYMAIL = '$trove-business';
const GORILLA_POOL_PAYMAIL = '$gorilla-pool'; // TODO: replace with actual Gorilla Pool paymail

// Fee split: 80% owner / 10% platform / 10% Gorilla Pool
const OWNER_SHARE = 0.80;
const PLATFORM_SHARE = 0.10;
const GORILLA_POOL_SHARE = 0.10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, ownerPaymail, description, payerPaymail } = await req.json();

    console.log('Processing payment:', { amount, ownerPaymail, payerPaymail, description });

    // TODO: Implement HandCash payment splitting via HandCash SDK
    // When implemented, send three separate payments:
    //   1. ownerPaymail       ← amount * 0.80
    //   2. TREASURY_PAYMAIL   ← amount * 0.10
    //   3. GORILLA_POOL_PAYMAIL ← amount * 0.10

    const ownerShare = Math.floor(amount * OWNER_SHARE);
    const platformShare = Math.floor(amount * PLATFORM_SHARE);
    const gorillaPoolShare = amount - ownerShare - platformShare; // remainder avoids rounding loss

    console.log('Payment split:', { ownerShare, platformShare, gorillaPoolShare });

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify({
      success: true,
      ownerShare,
      platformShare,
      gorillaPoolShare,
      treasuryPaymail: TREASURY_PAYMAIL,
      gorillaPoolPaymail: GORILLA_POOL_PAYMAIL,
      txid: `mock-tx-${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-payment:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Payment failed',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
