import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Credit packages available for purchase
const CREDIT_PACKAGES = {
  starter: { credits: 5,  priceGbp: 3.99, label: 'Starter' },
  topup:   { credits: 10, priceGbp: 3.99, label: 'Top-Up'  },
  bundle:  { credits: 25, priceGbp: 7.99, label: 'Bundle'  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { packageId, userId } = await req.json();

    const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
    if (!pkg) {
      return new Response(JSON.stringify({ error: 'Invalid package' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // TODO: Integrate Stripe fiat gateway here before crediting.
    // For now, simulate a successful payment and credit the user.
    // Flow:
    //   1. Initiate payment via Stripe (£pkg.priceGbp)
    //   2. On payment confirmed webhook → credit user below
    //   3. 50% of payment → platform revenue (funds the app)
    //   4. 50% → converted to BSV sats at live rate, held for user's inscriptions
    //
    // The user's inscription credits represent pre-purchased sats.
    // When they inscribe, those sats pay the on-chain fee directly.
    // The platform treasury is NEVER debited for individual user inscriptions.

    // Credit the user's inscription credits
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('inscription_credits')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentCredits = profile?.inscription_credits ?? 0;
    const newCredits = currentCredits + pkg.credits;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        inscription_credits: newCredits,
        has_paid_entry_fee: true,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log(`Credited ${pkg.credits} inscriptions to user ${userId}. New total: ${newCredits}`);

    return new Response(JSON.stringify({
      success: true,
      creditsAdded: pkg.credits,
      newTotal: newCredits,
      packageLabel: pkg.label,
      priceGbp: pkg.priceGbp,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in purchase-credits:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Purchase failed',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
