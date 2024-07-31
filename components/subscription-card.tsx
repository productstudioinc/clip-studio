import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/supabase/client';
import { getBillingPortal } from '@/utils/stripe/server';
import { Loader2, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

type Usage = {
	currentUsage: {
		exportSecondsLeft: number;
		voiceoverCharactersLeft: number;
		transcriptionMinutesLeft: number;
		connectedAccountsLeft: number;
	};
	totalLimits: {
		exportSeconds: number;
		voiceoverCharacters: number;
		transcriptionMinutes: number;
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
							transcriptionMinutesLeft:
								newUsage.transcription_minutes_left ??
								prevUsage.currentUsage.transcriptionMinutesLeft,
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

	return (
		<div className="flex flex-col gap-2 pb-6">
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<span className="text-xs">Export Minutes</span>
					<span className="text-xs text-muted-foreground">
						{secondsToMinutes(
							calculateUsed(totalLimits.exportSeconds, currentUsage.exportSecondsLeft)
						)}{' '}
						/ {secondsToMinutes(totalLimits.exportSeconds)}
					</span>
				</div>
				<Progress
					value={calculatePercentage(
						calculateUsed(totalLimits.exportSeconds, currentUsage.exportSecondsLeft),
						totalLimits.exportSeconds
					)}
					className="h-2"
				/>
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<span className="text-xs">Voiceover</span>
					<span className="text-xs text-muted-foreground">
						{calculateUsed(totalLimits.voiceoverCharacters, currentUsage.voiceoverCharactersLeft)} /{' '}
						{totalLimits.voiceoverCharacters}
					</span>
				</div>
				<Progress
					value={calculatePercentage(
						calculateUsed(totalLimits.voiceoverCharacters, currentUsage.voiceoverCharactersLeft),
						totalLimits.voiceoverCharacters
					)}
					className="h-2"
				/>
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<span className="text-xs">Transcription</span>
					<span className="text-xs text-muted-foreground">
						{calculateUsed(totalLimits.transcriptionMinutes, currentUsage.transcriptionMinutesLeft)}{' '}
						/ {totalLimits.transcriptionMinutes}
					</span>
				</div>
				<Progress
					value={calculatePercentage(
						calculateUsed(totalLimits.transcriptionMinutes, currentUsage.transcriptionMinutesLeft),
						totalLimits.transcriptionMinutes
					)}
					className="h-2"
				/>
			</div>
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<span className="text-xs">Connected Accounts</span>
					<span className="text-xs text-muted-foreground">
						{calculateUsed(totalLimits.connectedAccounts, currentUsage.connectedAccountsLeft)} /{' '}
						{totalLimits.connectedAccounts}
					</span>
				</div>
				<Progress
					value={calculatePercentage(
						calculateUsed(totalLimits.connectedAccounts, currentUsage.connectedAccountsLeft),
						totalLimits.connectedAccounts
					)}
					className="h-2"
				/>
			</div>
		</div>
	);
};
