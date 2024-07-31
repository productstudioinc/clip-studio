import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getBillingPortal } from '@/utils/stripe/server';
import { Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

type Usage = {
	currentUsage: {
		voiceoverCharactersLeft: number;
		transcriptionMinutesLeft: number;
		connectedAccountsLeft: number;
	};
	totalLimits: {
		voiceoverCharacters: number;
		transcriptionMinutes: number;
		connectedAccounts: number;
	};
};

export default function SubscriptionCard({
	subscriptionName,
	usage
}: {
	subscriptionName: string;
	usage: Usage;
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
				<UsageDisplay usage={usage} />
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

const UsageDisplay = ({ usage }: { usage: Usage }) => {
	const { currentUsage, totalLimits } = usage;
	const calculateUsed = (total: number, left: number) => total - left;
	const calculatePercentage = (used: number, total: number) => (used / total) * 100;

	return (
		<div className="flex flex-col gap-2 pb-6">
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
