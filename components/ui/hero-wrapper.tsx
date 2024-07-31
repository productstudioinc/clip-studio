'use client';
import Hero from '@/app/hero';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePathname } from 'next/navigation';

export default function HeroWrapper() {
	const pathname = usePathname();
	return (
		pathname === '/' && (
			<Dialog defaultOpen={true}>
				<DialogContent>
					<Hero />
				</DialogContent>
			</Dialog>
		)
	);
}
