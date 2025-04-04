/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import OpenAI from 'openai';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: 'https://gateway.ai.cloudflare.com/v1/your-id/your-project/openai', // keep this as you have it now
		});

		try {
			const messages = await request.json();

			const chatCompletion = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo', // or gpt-4 if you confirmed access
				messages,
				temperature: 1.1,
				presence_penalty: 0,
				frequency_penalty: 0,
			});

			const response = chatCompletion.choices[0].message;

			return new Response(JSON.stringify(response), {
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			});
		} catch (e) {
			return new Response(JSON.stringify({ error: e.message }), {
				status: 500,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			});
		}
	},
};
