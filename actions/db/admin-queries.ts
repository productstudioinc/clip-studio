import { db } from '@/db';
import {
	customers,
	planLimits,
	prices,
	products,
	subscriptions,
	users,
	userUsage
} from '@/db/schema';
import { stripe } from '@/utils/stripe/config';
import { and, eq } from 'drizzle-orm';
import Stripe from 'stripe';

const upsertProductRecord = async (product: Stripe.Product) => {
	const productData = {
		id: product.id,
		active: product.active,
		name: product.name,
		description: product.description ?? null,
		image: product.images?.[0] ?? null,
		metadata: product.metadata
	};

	try {
		await db.insert(products).values(productData).onConflictDoUpdate({
			target: products.id,
			set: productData
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}
};

const upsertPriceRecord = async (price: Stripe.Price) => {
	const priceData = {
		id: price.id,
		productId: typeof price.product === 'string' ? price.product : '',
		active: price.active,
		currency: price.currency,
		type: price.type,
		unitAmount: price.unit_amount ?? null,
		interval: price.recurring?.interval ?? null,
		intervalCount: price.recurring?.interval_count ?? null
	};

	try {
		await db.insert(prices).values(priceData).onConflictDoUpdate({
			target: prices.id,
			set: priceData
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
	}
};

const deleteProductRecord = async (product: Stripe.Product) => {
	try {
		await db.delete(products).where(eq(products.id, product.id));
		console.log(`Product deleted: ${product.id}`);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Product deletion failed: ${error.message}`);
		}
	}
};

const deletePriceRecord = async (price: Stripe.Price) => {
	try {
		await db.delete(prices).where(eq(prices.id, price.id));
		console.log(`Price deleted: ${price.id}`);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Price deletion failed: ${error.message}`);
		}
	}
};

const upsertCustomerToDb = async (uuid: string, customerId: string) => {
	try {
		await db
			.insert(customers)
			.values({ id: uuid, stripeCustomerId: customerId })
			.onConflictDoUpdate({
				target: customers.id,
				set: { stripeCustomerId: customerId }
			});
		return customerId;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`DB customer record creation failed: ${error.message}`);
		}
	}
};

const createCustomerInStripe = async (uuid: string, email: string) => {
	const customerData = { metadata: { supabaseUUID: uuid }, email: email };
	const newCustomer = await stripe.customers.create(customerData);
	if (!newCustomer) throw new Error('Stripe customer creation failed.');
	return newCustomer.id;
};

const createOrRetrieveCustomer = async ({ email, uuid }: { email: string; uuid: string }) => {
	try {
		const existingCustomer = await db
			.select()
			.from(customers)
			.where(eq(customers.id, uuid))
			.limit(1);

		let stripeCustomerId: string | undefined;
		if (existingCustomer[0]?.stripeCustomerId) {
			const existingStripeCustomer = await stripe.customers.retrieve(
				existingCustomer[0].stripeCustomerId
			);
			stripeCustomerId = existingStripeCustomer.id;
		} else {
			const stripeCustomers = await stripe.customers.list({ email: email });
			stripeCustomerId = stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
		}

		const stripeIdToInsert = stripeCustomerId ?? (await createCustomerInStripe(uuid, email));
		if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

		if (existingCustomer[0] && stripeCustomerId) {
			if (existingCustomer[0].stripeCustomerId !== stripeCustomerId) {
				await db
					.update(customers)
					.set({ stripeCustomerId: stripeCustomerId })
					.where(eq(customers.id, uuid));
				console.warn(`DB customer record mismatched Stripe ID. DB record updated.`);
			}
			return stripeCustomerId;
		} else {
			console.warn(`DB customer record was missing. A new record was created.`);
			return await upsertCustomerToDb(uuid, stripeIdToInsert);
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Customer lookup/creation failed: ${error.message}`);
		}
	}
};

const copyBillingDetailsToCustomer = async (uuid: string, paymentMethod: Stripe.PaymentMethod) => {
	const customer = paymentMethod.customer as string;
	const { name, phone, address } = paymentMethod.billing_details;
	if (!name || !phone || !address) return;
	//@ts-ignore
	await stripe.customers.update(customer, { name, phone, address });
	try {
		await db
			.update(users)
			.set({
				billingAddress: { ...address },
				paymentMethod: { ...paymentMethod[paymentMethod.type] }
			})
			.where(eq(users.id, uuid));
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Customer update failed: ${error.message}`);
		}
	}
};

const manageSubscriptionStatusChange = async (
	subscriptionId: string,
	customerId: string,
	createAction = false
) => {
	try {
		const customerData = await db
			.select({ id: customers.id })
			.from(customers)
			.where(eq(customers.stripeCustomerId, customerId))
			.limit(1);
		if (!customerData[0]) throw new Error('Customer not found');
		const { id: uuid } = customerData[0];
		const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
			expand: ['default_payment_method']
		});
		const subscriptionData = {
			id: subscription.id,
			userId: uuid,
			metadata: JSON.stringify(subscription.metadata),
			status: subscription.status,
			priceId: subscription.items.data[0].price.id,
			//@ts-ignore
			quantity: subscription.quantity,
			cancelAtPeriodEnd: subscription.cancel_at_period_end,
			cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
			canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
			currentPeriodStart: new Date(subscription.current_period_start * 1000),
			currentPeriodEnd: new Date(subscription.current_period_end * 1000),
			created: new Date(subscription.created * 1000),
			endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null
		};
		await db.insert(subscriptions).values(subscriptionData).onConflictDoUpdate({
			target: subscriptions.id,
			set: subscriptionData
		});
		console.log(`Inserted/updated subscription [${subscription.id}] for user [${uuid}]`);
		if (createAction && subscription.default_payment_method && uuid) {
			await copyBillingDetailsToCustomer(
				uuid,
				subscription.default_payment_method as Stripe.PaymentMethod
			);
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Subscription insert/update failed: ${error.message}`);
		}
		throw error; // Re-throw other errors
	}
};

const updateUserUsageLimits = async (subscription: Stripe.Subscription) => {
	try {
		const subscriptionDetails = await db
			.select({
				userId: subscriptions.userId,
				subscriptionId: subscriptions.id,
				exportSecondsLeft: planLimits.exportSeconds,
				voiceoverCharacters: planLimits.voiceoverCharacters,
				transcriptionMinutes: planLimits.transcriptionMinutes,
				connectedAccounts: planLimits.connectedAccounts
			})
			.from(subscriptions)
			.innerJoin(prices, eq(subscriptions.priceId, prices.id))
			.innerJoin(products, eq(prices.productId, products.id))
			.innerJoin(planLimits, eq(products.id, planLimits.productId))
			.where(and(eq(subscriptions.status, 'active'), eq(subscriptions.id, subscription.id)))
			.limit(1);
		if (!subscriptionDetails[0]) {
			throw new Error('No active subscription found');
		}

		await db
			.insert(userUsage)
			.values({
				userId: subscriptionDetails[0].userId,
				subscriptionId: subscriptionDetails[0].subscriptionId,
				exportSecondsLeft: subscriptionDetails[0].exportSecondsLeft,
				voiceoverCharactersLeft: subscriptionDetails[0].voiceoverCharacters,
				transcriptionMinutesLeft: subscriptionDetails[0].transcriptionMinutes,
				connectedAccountsLeft: subscriptionDetails[0].connectedAccounts,
				lastResetDate: new Date()
			})
			.onConflictDoUpdate({
				target: userUsage.userId,
				set: {
					voiceoverCharactersLeft: subscriptionDetails[0].voiceoverCharacters,
					exportSecondsLeft: subscriptionDetails[0].exportSecondsLeft,
					transcriptionMinutesLeft: subscriptionDetails[0].transcriptionMinutes,
					connectedAccountsLeft: subscriptionDetails[0].connectedAccounts,
					lastResetDate: new Date()
				}
			});
		console.log(`Updated usage limits for user ${subscriptionDetails[0].userId}`);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Subscription insert/update failed: ${error.message}`);
		}
	}
};

export {
	createOrRetrieveCustomer,
	deletePriceRecord,
	deleteProductRecord,
	manageSubscriptionStatusChange,
	updateUserUsageLimits,
	upsertPriceRecord,
	upsertProductRecord
};
