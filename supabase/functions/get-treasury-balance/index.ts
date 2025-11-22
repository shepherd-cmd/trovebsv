import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // TODO: Query HandCash API for treasury balance
    // For now, return mock balance
    const mockBalanceSats = 15000000000; // 150 BSV in satoshis
    
    console.log('Treasury balance requested:', mockBalanceSats, 'sats');

    return new Response(JSON.stringify({ 
      success: true,
      balance: mockBalanceSats,
      balanceBSV: mockBalanceSats / 100000000
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-treasury-balance:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        balance: 0
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});