import { validateWebhookSignature, WebhookPayload } from '@remotion/lambda/client';

// Enable testing through the tool below
// You may disable it in production
const ENABLE_TESTING = true;

export const POST = async (req: Request) => {
	let headers = {};

	if (ENABLE_TESTING) {
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

	// Parse the body properly
	const body = await req.json();

	validateWebhookSignature({
		secret: 'test',
		body: body,
		signatureHeader: req.headers.get('X-Remotion-Signature') as string
	});

	const payload = body as WebhookPayload;

	if (payload.type === 'success') {
		console.log(body);
	} else if (payload.type === 'timeout') {
		console.log(body);
	}

	return new Response(JSON.stringify({ success: true }));
};

export const OPTIONS = POST;
