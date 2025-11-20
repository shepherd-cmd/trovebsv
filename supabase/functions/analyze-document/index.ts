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
    const { imageUrl, category, title, description } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing document:', { title, category });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert historian and archivist analyzing documents for historical significance and rarity. 
Evaluate documents based on:
- Historical importance and uniqueness (rarity score 1-100)
- Practical usefulness and educational value (usefulness score 1-100)
- Potential market value per page in BSV satoshis

Be objective but generous for genuinely rare or useful documents. Common items should score 20-40, uncommon 50-70, rare 80-90, exceptional 95-100.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this document:
Title: ${title}
Category: ${category}
Description: ${description || 'No description provided'}

Provide a detailed analysis with rarity score, usefulness score, and suggested price per page.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_document",
              description: "Return structured analysis of the document",
              parameters: {
                type: "object",
                properties: {
                  rarity_score: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100,
                    description: "How rare and unique this document is historically"
                  },
                  usefulness_score: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100,
                    description: "How useful and valuable this document is for research/education"
                  },
                  price_per_page: {
                    type: "number",
                    description: "Suggested price per page in BSV satoshis (0.00000001 to 1.0)"
                  },
                  analysis: {
                    type: "string",
                    description: "Detailed explanation of the scores and historical significance"
                  },
                  estimated_pages: {
                    type: "integer",
                    description: "Estimated number of pages in this document"
                  }
                },
                required: ["rarity_score", "usefulness_score", "price_per_page", "analysis", "estimated_pages"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_document" } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Analysis complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document:', error);
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
