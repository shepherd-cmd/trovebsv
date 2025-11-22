import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TREASURY_PAYMAIL = '$trove-treasury@handcash.io';
const INSCRIPTION_COST = 250; // sats
const LOW_TREASURY_THRESHOLD = 100; // BSV (100 * 100,000,000 sats)

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

    console.log('Sponsor inscription request:', { userId: user.id, documentId });

    // Check user's free inscription slots
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('free_inscriptions_remaining, username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    if (profile.free_inscriptions_remaining <= 0) {
      return new Response(JSON.stringify({ 
        error: 'No free inscriptions remaining',
        treasurySponsored: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check treasury balance
    const { data: treasuryData, error: treasuryError } = await supabase.functions.invoke('get-treasury-balance');
    const treasuryBalanceSats = treasuryData?.balance || 0;
    const treasuryBalanceBSV = treasuryBalanceSats / 100000000;

    console.log('Treasury balance:', treasuryBalanceBSV, 'BSV');

    if (treasuryBalanceBSV < LOW_TREASURY_THRESHOLD) {
      return new Response(JSON.stringify({ 
        error: 'Treasury balance too low for sponsorship',
        treasuryLow: true,
        treasuryBalance: treasuryBalanceBSV
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TODO: Pull 250 sats from treasury via HandCash
    // For now, simulate the inscription
    const mockTxId = `${crypto.randomUUID().slice(0, 8)}${Date.now()}`;
    const payableLink = `https://1satordinals.com/inscription/${mockTxId}`;

    // Simulate inscription delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Decrement user's free inscriptions
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        free_inscriptions_remaining: profile.free_inscriptions_remaining - 1 
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to decrement free inscriptions:', updateError);
    }

    // Log treasury transaction
    const { error: txLogError } = await supabase
      .from('treasury_transactions')
      .insert({
        user_id: user.id,
        username: profile.username || 'anonymous',
        amount: -0.00000250, // 250 sats in BSV
        transaction_type: 'sponsored_inscription',
        txid: mockTxId
      });

    if (txLogError) {
      console.error('Failed to log treasury transaction:', txLogError);
    }

    console.log('Sponsored inscription successful:', { txid: mockTxId, userId: user.id });

    return new Response(JSON.stringify({ 
      success: true,
      txid: mockTxId,
      payableLink,
      treasurySponsored: true,
      remainingFreeInscriptions: profile.free_inscriptions_remaining - 1
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