import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBillingPortal } from '@/utils/stripe/server';
import { Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

export default function SubscriptionCard({ subscriptionName }: { subscriptionName: string }) {
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
