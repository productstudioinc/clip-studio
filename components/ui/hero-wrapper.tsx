'use client';
import Hero from '@/app/hero';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

export default function HeroWrapper() {
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		const visited = localStorage.getItem('visited');
		if (!visited) {
			setShowDialog(true);
		}
	}, []);

	const handleClose = () => {
		localStorage.setItem('visited', 'true');
		setShowDialog(false);
	};

	return (
		<>
			{showDialog && (
				<Dialog
					defaultOpen={showDialog}
					onOpenChange={(open) => {
						if (!open) {
							handleClose();
						}
					}}
				>
					<DialogContent>
						<Hero />
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
