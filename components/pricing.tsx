'use client';

import { GetProductsResult } from '@/actions/db/user-queries';
import { CreditCalculator } from '@/components/credit-calculator-simple';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { CheckIcon } from '@radix-ui/react-icons';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Interval = 'month' | 'year';

const toHumanPrice = (price: number | null, decimals: number = 2) => {
	if (price === null) return 'N/A';
	return Number(price / 100).toFixed(decimals);
};

export default function Pricing({
	products,
	user,
	subscription
}: {
	products: GetProductsResult;
	user: User | null;
	subscription: string | null;
}) {
	const router = useRouter();
	const [interval, setInterval] = useState<Interval>('month');
	const [isLoading, setIsLoading] = useState(false);
	const [id, setId] = useState<string | null>(null);
	const [toltReferralId, setToltReferralId] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined' && (window as any).tolt_referral) {
			setToltReferralId((window as any).tolt_referral);
		}
	}, []);

	const onSubscribeClick = async (priceId: string) => {
		setIsLoading(true);
		setId(priceId);
		if (!user) {
			setIsLoading(false);
			return router.push('/login');
		}
		const [data, err] = await checkoutWithStripe({
			priceId,
			referralId: toltReferralId || undefined
		});
		if (err) {
			toast.error(err.message);
			setIsLoading(false);
			return;
		}
		if (!data?.sessionId) {
			toast.error('Error creating checkout session ' + data?.errorRedirect);
			setIsLoading(false);
			return;
		}

		const stripe = await getStripe();
		stripe?.redirectToCheckout({ sessionId: data?.sessionId });
		setIsLoading(false);
	};

	return (
		<section id="pricing" aria-labelledby="pricing-heading">
			<div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
				<div className="mx-auto max-w-5xl text-center">
					<h4 className="text-xl font-bold tracking-tight text-black dark:text-white">Pricing</h4>
					<h2 className="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
						Simple pricing for everyone.
					</h2>
					<p className="mt-6 text-xl leading-8 text-black/80 dark:text-white">
						Choose an <strong>affordable plan</strong> that&apos;s packed with the best features for
						engaging your audience, creating customer loyalty, and driving sales.
					</p>
				</div>

				<div className="flex w-full items-center justify-center space-x-2">
					<span className="text-sm text-black dark:text-white">Monthly</span>
					<Switch
						id="interval"
						onCheckedChange={(checked) => {
							setInterval(checked ? 'year' : 'month');
						}}
					/>
					<span className="text-sm text-black dark:text-white">Annual</span>
					<span className="inline-block whitespace-nowrap rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold uppercase leading-5 tracking-wide text-white">
						4 MONTHS FREE ✨
					</span>
				</div>

				<div className="mx-auto grid w-full justify-center gap-8 sm:grid-cols-1 lg:grid-cols-4">
					{/* Free Plan Card */}
					<div className="relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border p-6 text-black dark:text-white mx-auto">
						<div className="flex flex-col items-start mb-2">
							<h2 className="text-xl font-semibold leading-7">Free Plan</h2>
							<p className="mt-1 h-10 text-sm leading-5 text-black/70 dark:text-white/70">
								Get started with basic features
							</p>
						</div>

						<motion.div
							key="free-plan"
							initial="initial"
							animate="animate"
							variants={{
								initial: { opacity: 0, y: 12 },
								animate: { opacity: 1, y: 0 }
							}}
							transition={{
								duration: 0.4,
								delay: 0.1,
								ease: [0.21, 0.47, 0.32, 0.98]
							}}
							className="flex flex-col gap-1 mb-4"
						>
							<span className="text-4xl font-bold text-black dark:text-white">
								$0
								<span className="ml-2 text-sm font-normal text-gray-500">/ month</span>
							</span>
							<span className="block h-5 text-sm font-normal text-gray-500">Free forever</span>
						</motion.div>

						<Button
							className={cn(
								'group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter mb-4',
								'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2'
							)}
							onClick={() => router.push('/login')}
						>
							<span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
							<p>Register</p>
						</Button>

						<hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0 mb-4" />

						<ul className="flex flex-col gap-2 font-normal">
							<li className="flex items-center gap-3 text-sm font-medium text-black dark:text-white">
								<CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-600 p-[2px] text-white dark:text-white" />
								<span className="flex">15 credits</span>
							</li>
							<li className="flex items-center gap-3 text-sm font-medium text-black dark:text-white">
								<div className="h-5 w-5 shrink-0 rounded-full bg-red-600 p-[2px] flex items-center justify-center">
									<span className="text-white font-bold">×</span>
								</div>
								<span className="flex">No connected accounts</span>
							</li>
						</ul>
					</div>

					{products
						.sort((a, b) => {
							// Sort by product.metadata.order if it exists
							const orderA = (a.metadata as any)?.order
								? Number((a.metadata as any).order)
								: Infinity;
							const orderB = (b.metadata as any)?.order
								? Number((b.metadata as any).order)
								: Infinity;
							return orderA - orderB;
						})
						.map((product, idx) => {
							const monthlyPrice = product.prices.find((p) => p.interval === 'month');
							const yearlyPrice = product.prices.find((p) => p.interval === 'year');
							const currentPrice = interval === 'month' ? monthlyPrice : yearlyPrice;
							const isCurrentPlan = subscription === product.name;

							return (
								<div
									key={product.id}
									className={cn(
										'relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border p-6 text-black dark:text-white mx-auto',
										{
											'border-2 border-green-600 shadow-lg':
												product.metadata && (product.metadata as any).isMostPopular === 'true'
										}
									)}
								>
									{product.metadata && (product.metadata as any).isMostPopular === 'true' && (
										<div className="absolute top-0 right-0 bg-green-600 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
											<span className="text-white ml-1 font-sans font-semibold text-sm">
												Recommended
											</span>
										</div>
									)}

									<div className="flex flex-col items-start mb-2">
										<h2 className="text-xl font-semibold leading-7">{product.name}</h2>
										<p className="mt-1 h-10 text-sm leading-5 text-black/70 dark:text-white/70">
											{product.description}
										</p>
									</div>

									<motion.div
										key={`${product.id}-${interval}`}
										initial="initial"
										animate="animate"
										variants={{
											initial: {
												opacity: 0,
												y: 12
											},
											animate: {
												opacity: 1,
												y: 0
											}
										}}
										transition={{
											duration: 0.4,
											delay: 0.1 + idx * 0.05,
											ease: [0.21, 0.47, 0.32, 0.98]
										}}
										className="flex flex-col gap-1 mb-4"
									>
										<span className="text-4xl font-bold text-black dark:text-white">
											$
											{currentPrice
												? toHumanPrice(
														interval === 'year'
															? (currentPrice.unitAmount || 0) / 12
															: currentPrice.unitAmount,
														0
													)
												: 'N/A'}
											<span className="ml-2 text-sm font-normal text-gray-500">/ month</span>
										</span>
										<span className="block h-5 text-sm font-normal text-gray-500">
											{interval === 'year' && currentPrice && (
												<>${toHumanPrice(currentPrice.unitAmount, 0)} billed annually</>
											)}
										</span>
									</motion.div>

									<Button
										className={cn(
											'group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter mb-4',
											'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2'
										)}
										disabled={isLoading || !currentPrice || subscription !== null}
										onClick={() => currentPrice && onSubscribeClick(currentPrice.id)}
									>
										<span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-96 dark:bg-black" />
										{isCurrentPlan ? (
											<p>Your Plan</p>
										) : (
											<>
												{(!isLoading || (isLoading && id !== currentPrice?.id)) && <p>Upgrade</p>}
												{isLoading && id === currentPrice?.id && <p>Upgrading...</p>}
												{isLoading && id === currentPrice?.id && (
													<Loader className="mr-2 h-4 w-4 animate-spin" />
												)}
											</>
										)}
									</Button>

									<hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-500/30 to-neutral-200/0 mb-4" />

									{(product.metadata as any) && (
										<ul className="flex flex-col gap-2 font-normal">
											{Object.entries(product.marketingFeatures || {}).map(([_, feature], idx) => (
												<li
													key={idx}
													className="flex items-center gap-3 text-sm font-medium text-black dark:text-white"
												>
													<CheckIcon className="h-5 w-5 shrink-0 rounded-full bg-green-600 p-[2px] text-white dark:text-white" />
													<span className="flex">
														{typeof feature === 'string' ? feature : String(feature)}
													</span>
												</li>
											))}
										</ul>
									)}
								</div>
							);
						})}
				</div>

				<CreditCalculator />
			</div>
		</section>
	);
}
