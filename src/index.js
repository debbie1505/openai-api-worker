import OpenAI from 'openai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env, ctx) {
    // Handle preflight request for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: `${request.method} method not allowed.` }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Initialize OpenAI with your Cloudflare AI Gateway base URL
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: 'https://gateway.ai.cloudflare.com/v1/31e92bf93b47d8a4c150e63abad5ff7e/ai-project/openai',
    });

    try {
      const messages = await request.json();

      // Debug log (optional, remove in production)
      console.log("Messages received:", messages);

      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0613',
        messages,
        temperature: 1.1,
        presence_penalty: 0,
        frequency_penalty: 0,
      });

      const response = chatCompletion.choices[0].message;

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });

    } catch (e) {
      console.error("Worker Error:", e);

      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  },
};
