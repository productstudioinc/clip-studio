'use client';
import { deleteUser } from '@/actions/db/user-queries';
import { deleteTiktokAccount } from '@/actions/tiktok';
import { deleteYoutubeChannel } from '@/actions/youtube';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useServerAction } from 'zsa-react';

export function DeleteYoutubeAccount({ channelId }: { channelId: string }) {
	const { isPending, execute } = useServerAction(deleteYoutubeChannel);
	const handleDelete = async () => {
		const [_data, err] = await execute({
			channelId
		});
		if (err) {
			toast.error(err.message);
		} else {
			toast.success('Youtube channel deleted');
		}
	};
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm" className="w-full">
					Disconnect
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure you want to disconnect your account?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your
						data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function DeleteTikTokAccount({ accountId }: { accountId: string }) {
	const { isPending, execute } = useServerAction(deleteTiktokAccount);
	const handleDelete = async () => {
		const [_data, err] = await execute({
			id: accountId
		});
		if (err) {
			toast.error(err.message);
		} else {
			toast.success('TikTok account deleted');
		}
	};
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm" className="w-full">
					Disconnect
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure you want to disconnect your account?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your
						data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={isPending}>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function DeleteAccount() {
	const { isPending, execute } = useServerAction(deleteUser);
	const handleDelete = async () => {
		const [_data, err] = await execute();
		if (err) {
			toast.error(err.message);
		} else {
			toast.success('Account deleted');
		}
	};
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm" className="max-w-lg">
					Delete Account
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your
						data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={isPending} asChild>
						<Button variant="destructive" size="sm">
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Confirm
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
