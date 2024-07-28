import { validateWebhookSignature, WebhookPayload } from '@remotion/lambda/client';
import { withAxiom } from 'next-axiom';

export const POST = withAxiom(async (req) => {
	req.log.with({
		path: '/api/render-webhook',
		method: req.method
	});
	let headers = {};

	if (process.env.NODE_ENV !== 'production') {
		const testingheaders = {
			'Access-Control-Allow-Origin': 'https://www.remotion.dev',
			'Access-Control-Allow-Headers':
				'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Remotion-Status, X-Remotion-Signature, X-Remotion-Mode',
			'Access-Control-Allow-Methods': 'OPTIONS,POST'
		};
		headers = { ...headers, ...testingheaders };
	}

	if (req.method === 'OPTIONS') {
		return new Response(null, {
			headers
		});
	}

	const body = await req.json();

	validateWebhookSignature({
		secret: process.env.REMOTION_WEBHOOK_SECRET!,
		body: body,
		signatureHeader: req.headers.get('X-Remotion-Signature') as string
	});

	const payload = body as WebhookPayload;

	switch (payload.type) {
		case 'error':
			req.log.error('Render error', {
				renderId: payload.renderId,
				errors: payload.errors
			});
			break;
		case 'success':
			req.log.info('Render success', {
				renderId: payload.renderId,
				outputUrl: payload.outputUrl,
				timeToFinish: payload.timeToFinish,
				estimatedCost: payload.costs.estimatedCost
			});
			break;
		case 'timeout':
			req.log.error('Render timeout', {
				renderId: payload.renderId
			});
	}

	return new Response(JSON.stringify({ success: true }));
});

export const OPTIONS = POST;
