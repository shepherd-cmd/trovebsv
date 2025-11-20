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
    const { documentId, documentPhotos, provenancePhotos, metadata, walletType, walletData } = await req.json();
    
    console.log('Inscribing document:', { documentId, walletType });

    // For now, return a mock inscription response
    // In production, this would integrate with HandCash/RelayX API and 1Sat Ordinals
    const mockTxId = `${crypto.randomUUID().slice(0, 8)}${Date.now()}`;
    const payableLink = `https://1satordinals.com/inscription/${mockTxId}`;

    // Simulate inscription delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(JSON.stringify({ 
      success: true,
      txid: mockTxId,
      payableLink,
      walletAddress: walletData?.address || 'mock-wallet-address'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in inscribe-document:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
