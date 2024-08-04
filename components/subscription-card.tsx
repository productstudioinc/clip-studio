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
		exportSecondsLeft: number;
		voiceoverCharactersLeft: number;
		transcriptionSecondsLeft: number;
		connectedAccountsLeft: number;
	};
	totalLimits: {
		exportSeconds: number;
		voiceoverCharacters: number;
		transcriptionSeconds: number;
		connectedAccounts: number;
	};
};

export default function SubscriptionCard({
	subscriptionName,
	usage,
	userId
}: {
	subscriptionName: string;
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
				<CardDescription>{subscriptionName}</CardDescription>
			</CardHeader>
			<CardContent className="p-2 pt-0 md:p-4 md:pt-0">
				<UsageDisplay usage={usage} userId={userId} />
				<Button size={'sm'} className="w-full" onClick={manageSubscription} disabled={isPending}>
					{isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Settings className="h-4 w-4 mr-2" />
					)}
					Manage
				</Button>
			</CardContent>
		</Card>
	);
}

const UsageDisplay = ({ usage: initialUsage, userId }: { usage: Usage; userId: string }) => {
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
							...prevUsage.currentUsage,
							exportSecondsLeft:
								newUsage.export_seconds_left ?? prevUsage.currentUsage.exportSecondsLeft,
							voiceoverCharactersLeft:
								newUsage.voiceover_characters_left ??
								prevUsage.currentUsage.voiceoverCharactersLeft,
							transcriptionSecondsLeft:
								newUsage.transcription_seconds_left ??
								prevUsage.currentUsage.transcriptionSecondsLeft,
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

	const calculateUsed = (total: number, left: number) => total - left;
	const calculatePercentage = (used: number, total: number) => (used / total) * 100;
	const secondsToMinutes = (seconds: number) => (seconds / 60).toFixed(1);

	const usageItems = [
		{
			label: 'Export Minutes',
			current: secondsToMinutes(
				calculateUsed(totalLimits.exportSeconds, currentUsage.exportSecondsLeft)
			),
			total: secondsToMinutes(totalLimits.exportSeconds),
			unit: 'minutes',
			percentage: calculatePercentage(
				calculateUsed(totalLimits.exportSeconds, currentUsage.exportSecondsLeft),
				totalLimits.exportSeconds
			)
		},
		{
			label: 'Voiceover Characters',
			current: calculateUsed(totalLimits.voiceoverCharacters, currentUsage.voiceoverCharactersLeft),
			total: totalLimits.voiceoverCharacters,
			unit: 'characters',
			percentage: calculatePercentage(
				calculateUsed(totalLimits.voiceoverCharacters, currentUsage.voiceoverCharactersLeft),
				totalLimits.voiceoverCharacters
			)
		},
		{
			label: 'Transcribe Minutes',
			current: secondsToMinutes(
				calculateUsed(totalLimits.transcriptionSeconds, currentUsage.transcriptionSecondsLeft)
			),
			total: secondsToMinutes(totalLimits.transcriptionSeconds),
			unit: 'minutes',
			percentage: calculatePercentage(
				calculateUsed(totalLimits.transcriptionSeconds, currentUsage.transcriptionSecondsLeft),
				totalLimits.transcriptionSeconds
			)
		},
		{
			label: 'Connected Accounts',
			current: calculateUsed(totalLimits.connectedAccounts, currentUsage.connectedAccountsLeft),
			total: totalLimits.connectedAccounts,
			unit: '',
			percentage: calculatePercentage(
				calculateUsed(totalLimits.connectedAccounts, currentUsage.connectedAccountsLeft),
				totalLimits.connectedAccounts
			)
		}
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
									<p>{`${item.current} / ${item.total} ${item.unit}`}</p>
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
