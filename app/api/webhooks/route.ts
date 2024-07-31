import {
	deletePriceRecord,
	deleteProductRecord,
	manageSubscriptionStatusChange,
	updateUserUsageLimits,
	upsertPriceRecord,
	upsertProductRecord
} from '@/actions/db/admin-queries';
import { stripe } from '@/utils/stripe/config';
import { AxiomRequest, withAxiom } from 'next-axiom';
import Stripe from 'stripe';

const relevantEvents = new Set([
	'product.created',
	'product.updated',
	'product.deleted',
	'price.created',
	'price.updated',
	'price.deleted',
	'checkout.session.completed',
	'customer.subscription.created',
	'customer.subscription.updated',
	'customer.subscription.deleted'
]);

export const POST = withAxiom(async (req: AxiomRequest) => {
	const logger = req.log.with({
		path: '/api/webhooks/route',
		method: req.method
	});

	logger.info('Webhook received');

	const body = await req.text();
	const sig = req.headers.get('stripe-signature') as string;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	let event: Stripe.Event;

	try {
		if (!sig || !webhookSecret) {
			logger.error('Webhook secret not found');
			await logger.flush();
			return new Response('Webhook secret not found.', { status: 400 });
		}
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
		logger.info(`Webhook event constructed`, { eventType: event.type });
	} catch (err: any) {
		logger.error(`Error constructing webhook event`, { error: err.message });
		await logger.flush();
		return new Response(`Webhook Error: ${err.message}`, { status: 400 });
	}

	if (relevantEvents.has(event.type)) {
		try {
			switch (event.type) {
				case 'product.created':
				case 'product.updated':
					await upsertProductRecord(event.data.object as Stripe.Product);
					logger.info(`Product upserted`, { eventType: event.type });
					break;
				case 'price.created':
				case 'price.updated':
					await upsertPriceRecord(event.data.object as Stripe.Price);
					logger.info(`Price upserted`, { eventType: event.type });
					break;
				case 'price.deleted':
					await deletePriceRecord(event.data.object as Stripe.Price);
					logger.info(`Price deleted`, { eventType: event.type });
					break;
				case 'product.deleted':
					await deleteProductRecord(event.data.object as Stripe.Product);
					logger.info(`Product deleted`, { eventType: event.type });
					break;
				case 'customer.subscription.created':
				case 'customer.subscription.updated':
				case 'customer.subscription.deleted':
					const subscription = event.data.object as Stripe.Subscription;
					await manageSubscriptionStatusChange(
						subscription.id,
						subscription.customer as string,
						event.type === 'customer.subscription.created'
					);
					await updateUserUsageLimits(subscription);
					logger.info(`Subscription status changed`, {
						eventType: event.type,
						subscriptionId: subscription.id
					});
					break;
				case 'checkout.session.completed':
					const checkoutSession = event.data.object as Stripe.Checkout.Session;
					if (checkoutSession.mode === 'subscription') {
						const subscriptionId = checkoutSession.subscription;
						await manageSubscriptionStatusChange(
							subscriptionId as string,
							checkoutSession.customer as string,
							true
						);
						logger.info(`Checkout session completed`, { subscriptionId });
					}
					break;
				default:
					logger.warn(`Unhandled relevant event`, { eventType: event.type });
					throw new Error('Unhandled relevant event!');
			}
		} catch (error) {
			logger.error(`Webhook handler failed`, {
				error: error instanceof Error ? error.message : String(error)
			});
			await logger.flush();
			return new Response('Webhook handler failed. View your Next.js function logs.', {
				status: 400
			});
		}
	} else {
		logger.warn(`Unsupported event type`, { eventType: event.type });
		await logger.flush();
		return new Response(`Unsupported event type: ${event.type}`, {
			status: 400
		});
	}

	logger.info('Webhook processed successfully');
	await logger.flush();
	return new Response(JSON.stringify({ received: true }));
});
