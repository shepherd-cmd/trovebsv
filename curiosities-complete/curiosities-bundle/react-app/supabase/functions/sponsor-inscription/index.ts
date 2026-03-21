import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// On-chain inscription cost in sats.
// This is paid from the user's pre-purchased sats pool (50% of their entry fee
// or top-up purchase was converted to BSV at time of purchase).
// The treasury is NEVER debited for individual inscriptions.
const INSCRIPTION_COST_SATS = 500; // covers on-chain fee ~200 + Gorilla Pool indexing ~300

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { documentId, documentPhotos, provenancePhotos, metadata } = await req.json();

    console.log('Inscription request:', { userId: user.id, documentId });

    // Check user's inscription credit balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('inscription_credits, username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    if (profile.inscription_credits <= 0) {
      return new Response(JSON.stringify({
        error: 'No inscription credits remaining. Top up your sats to continue uploading.',
        needsTopUp: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TODO: Use the user's pre-purchased sats to pay the on-chain inscription fee
    // via the Babbage SDK / direct BSV broadcast (@bsv/sdk + WhatsOnChain).
    // The user already paid for these sats at point of purchase (entry fee or top-up).
    // Flow:
    //   1. Send INSCRIPTION_COST_SATS from user's sats pool to miner + Gorilla Pool
    //   2. Receive inscription txid back
    //   3. Decrement credit count

    // For now, simulate the inscription
    const mockTxId = `${crypto.randomUUID().slice(0, 8)}${Date.now()}`;
    const payableLink = `https://1satordinals.com/inscription/${mockTxId}`;

    // Simulate inscription delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Decrement user's inscription credits (they've used one of their pre-paid credits)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        inscription_credits: profile.inscription_credits - 1
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to decrement inscription credits:', updateError);
    }

    // Log the inscription event (not a treasury debit — the user funded this themselves)
    const { error: txLogError } = await supabase
      .from('treasury_transactions')
      .insert({
        user_id: user.id,
        username: profile.username || 'anonymous',
        amount: 0, // no treasury cost — user's own pre-purchased sats
        transaction_type: 'user_inscription',
        txid: mockTxId
      });

    if (txLogError) {
      console.error('Failed to log transaction:', txLogError);
    }

    console.log('Inscription successful:', {
      txid: mockTxId,
      userId: user.id,
      remainingCredits: profile.inscription_credits - 1,
    });

    return new Response(JSON.stringify({
      success: true,
      txid: mockTxId,
      payableLink,
      remainingCredits: profile.inscription_credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sponsor-inscription:', error);
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
