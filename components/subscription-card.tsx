import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createClient } from '@/supabase/client';
import { getBillingPortal } from '@/utils/stripe/server';
import { Info, Loader2, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

type Usage = {
	currentUsage: {
		creditsLeft: number | null;
		connectedAccountsLeft: number | null;
	};
	totalLimits: {
		credits: number | null;
		connectedAccounts: number | null;
	};
};

export default function SubscriptionCard({
	subscriptionName,
	usage,
	userId
}: {
	subscriptionName: string | null;
	usage: Usage;
	userId: string;
}) {
	const { isPending, execute } = useServerAction(getBillingPortal);
	const manageSubscription = async () => {
		const [data, err] = await execute();
		if (err) {
			toast.error(err.message);
		} else {
			window.open(data.url, '_blank');
		}
	};

	return (
		<Card>
			<CardHeader className="p-2 pt-0 md:p-4">
				<CardTitle>Your Usage</CardTitle>
				<CardDescription>{subscriptionName || 'Free Plan'}</CardDescription>
			</CardHeader>
			<CardContent className={`p-2 pt-0 md:p-4 md:pt-0 ${!subscriptionName ? 'pb-0 md:pb-0' : ''}`}>
				<UsageDisplay usage={usage} userId={userId} showConnectedAccounts={!!subscriptionName} />
				{subscriptionName && (
					<Button
						size={'sm'}
						className="w-full mt-6"
						onClick={manageSubscription}
						disabled={isPending}
					>
						{isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Settings className="h-4 w-4 mr-2" />
						)}
						Manage
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

const UsageDisplay = ({
	usage: initialUsage,
	userId,
	showConnectedAccounts
}: {
	usage: Usage;
	userId: string;
	showConnectedAccounts: boolean;
}) => {
	const [realtimeUsage, setRealtimeUsage] = useState<Usage>(initialUsage);
	const supabase = createClient();

	useEffect(() => {
		const channel = supabase
			.channel('realtime_usage')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'user_usage',
					filter: `user_id=eq.${userId}`
				},
				({ new: newUsage }) => {
					setRealtimeUsage((prevUsage) => ({
						...prevUsage,
						currentUsage: {
							creditsLeft: newUsage.credits_left ?? prevUsage.currentUsage.creditsLeft,
							connectedAccountsLeft:
								newUsage.connected_accounts_left ?? prevUsage.currentUsage.connectedAccountsLeft
						}
					}));
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [realtimeUsage, supabase, userId]);

	const { currentUsage, totalLimits } = realtimeUsage;

	const calculateUsed = (total: number | null, left: number | null) =>
		total !== null && left !== null ? total - left : null;
	const calculatePercentage = (used: number | null, total: number | null) =>
		used !== null && total !== null && total !== 0 ? (used / total) * 100 : 0;

	const usageItems = [
		{
			label: 'Credits Used',
			current: calculateUsed(totalLimits.credits, currentUsage.creditsLeft),
			total: totalLimits.credits,
			unit: '',
			percentage: calculatePercentage(
				calculateUsed(totalLimits.credits, currentUsage.creditsLeft),
				totalLimits.credits
			)
		},
		...(showConnectedAccounts
			? [
					{
						label: 'Connected Accounts',
						current: calculateUsed(
							totalLimits.connectedAccounts,
							currentUsage.connectedAccountsLeft
						),
						total: totalLimits.connectedAccounts,
						unit: '',
						percentage: calculatePercentage(
							calculateUsed(totalLimits.connectedAccounts, currentUsage.connectedAccountsLeft),
							totalLimits.connectedAccounts
						)
					}
				]
			: [])
	];

	return (
		<TooltipProvider>
			<div className="flex flex-col gap-3 pb-6">
				{usageItems.map((item, index) => (
					<div key={index} className="flex flex-col gap-1">
						<div className="flex justify-between items-center text-xs">
							<span className="flex-grow">{item.label}</span>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon" className="h-4 w-4 p-0">
										<Info className="h-3 w-3" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>{`${item.current ?? 'N/A'} / ${item.total ?? 'N/A'} ${item.unit}`}</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<Progress value={item.percentage} className="h-2" />
					</div>
				))}
			</div>
		</TooltipProvider>
	);
};
