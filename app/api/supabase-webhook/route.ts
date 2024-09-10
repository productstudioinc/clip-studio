import posthog from '@/lib/posthog';
import axios from 'axios';
import { withAxiom } from 'next-axiom';

export const POST = withAxiom(async (req) => {
	const logger = req.log.with({
		path: '/api/supabase-webhook',
		method: 'POST'
	});

	try {
		const payload = await req.json();

		if (payload.type === 'INSERT' && payload.table === 'auth.users') {
			const newUser = payload.record;

			// Track user signup event in PostHog
			posthog().capture({
				distinctId: newUser.id,
				event: 'user_signed_up',
				properties: {
					email: newUser.email
				}
			});

			// Send Discord webhook
			const discordWebhookUrl = process.env.DISCORD_SIGNUP_WEBHOOK;
			if (discordWebhookUrl) {
				const message = {
					content: 'New user signed up!',
					embeds: [
						{
							title: 'User Details',
							fields: [
								{ name: 'User ID', value: newUser.id },
								{ name: 'Email', value: newUser.email },
								{ name: 'Signup Date', value: new Date().toISOString() }
							],
							color: 5814783
						}
					]
				};
				logger.info('Sending Discord webhook', { message });
				await axios.post(discordWebhookUrl, message);
			}

			logger.info('New user created and usage record initialized', { userId: newUser.id });
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		logger.info('Webhook received but no action taken', {
			type: payload.type,
			table: payload.table
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		logger.error('Error processing webhook', {
			error: error instanceof Error ? error.message : String(error)
		});
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
});
