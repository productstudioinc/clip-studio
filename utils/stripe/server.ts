'use server';

import { getUser } from '@/actions/auth/user';
import { createOrRetrieveCustomer } from '@/actions/db/admin-queries';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { z } from 'zod';
import { createServerAction } from 'zsa';
import { getURL } from '../helpers/helpers';
import { stripe } from './config';

type CheckoutResponse = {
	errorRedirect?: string;
	sessionId?: string;
};

export const getBillingPortal = createServerAction()
	.input(z.void())
	.handler(async () => {
		const { user } = await getUser();
		if (!user) {
			throw redirect('/login');
		}
		const customerId = await createOrRetrieveCustomer({
			uuid: user.id,
			email: user.email as string
		});
		const session = await stripe.billingPortal.sessions.create({
			customer: customerId as string,
			return_url: getURL('/account')
		});
		return { url: session.url };
	});

export const checkoutWithStripe = createServerAction()
	.input(z.object({ priceId: z.string(), redirectPath: z.string().default('/account') }))
	.output(z.object({ sessionId: z.string().optional(), errorRedirect: z.string().optional() }))
	.handler(async ({ input }): Promise<CheckoutResponse> => {
		const { user } = await getUser();
		if (!user) {
			throw redirect('/login');
		}

		try {
			const customer = await createOrRetrieveCustomer({
				uuid: user.id,
				email: user.email as string
			});

			const params: Stripe.Checkout.SessionCreateParams = {
				allow_promotion_codes: true,
				billing_address_collection: 'required',
				customer,
				customer_update: {
					address: 'auto'
				},
				line_items: [
					{
						price: input.priceId,
						quantity: 1
					}
				],
				cancel_url: getURL(),
				mode: 'subscription',
				success_url: getURL(input.redirectPath)
			};

			const session = await stripe.checkout.sessions.create(params);

			return { sessionId: session.id };
		} catch (error) {
			console.error('Error in checkoutWithStripe:', error);
			return { errorRedirect: getURL() };
		}
	});
