'use client';

import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import { ArrowRightIcon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfirmationDialog() {
	const router = useRouter();

	useEffect(() => {
		confetti({
			particleCount: 100,
			spread: 100,
			origin: {
				x: 0.5,
				y: 0.5
			}
		});
	}, []);

	return (
		<Dialog open={true} onOpenChange={(open) => !open && router.back()}>
			<DialogContent className="p-0 border-0 max-w-lg">
				<DialogTitle className="hidden">Pricing</DialogTitle>
				<DialogDescription className="hidden">
					Choose the plan that best fits your needs.
				</DialogDescription>
				<div className="text-center p-6">
					<CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
					<h2 className="text-2xl font-bold mb-4">Thank You for Upgrading!</h2>
				</div>
				<div className="px-6 pb-6">
					<p className="text-lg text-center mb-6">
						Your account has been successfully upgraded. Welcome to your enhanced experience!
					</p>
				</div>
				<div className="flex flex-col space-y-4 p-6 border-t">
					<Link href="/" className={buttonVariants({ variant: 'default' })}>
						Create a new video
						<ArrowRightIcon className="w-4 h-4 ml-2" />
					</Link>
				</div>
			</DialogContent>
		</Dialog>
	);
}
