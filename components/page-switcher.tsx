'use client';

import { Button } from '@/components/ui/button';
import { useTemplateStore } from '@/stores/templatestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const steps = [
	{
		label: 'Templates',
		href: '/'
	},
	{
		label: 'Configure',
		href: '/configure'
	},
	{
		label: 'Voiceover',
		href: '/voiceover'
	},
	{
		label: 'Caption',
		href: '/caption'
	},
	{
		label: 'Export',
		href: '/export'
	}
];

export const PageSwitcher = () => {
	const currentRoute = usePathname();
	const { selectedTemplate } = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate
	}));

	const adjustedSteps =
		selectedTemplate === 'SplitScreen'
			? steps.filter((step) => step.label !== 'Voiceover')
			: steps.filter((step) => step.label !== 'Caption');

	const currentIndex = adjustedSteps.findIndex((step) => step.href === currentRoute);
	const prevStep = currentIndex > 0 ? adjustedSteps[currentIndex - 1] : null;
	const nextStep = currentIndex < adjustedSteps.length - 1 ? adjustedSteps[currentIndex + 1] : null;

	return (
		<div className="flex items-center space-x-4">
			{prevStep && (
				<Button size="sm" asChild>
					<Link href={prevStep.href}>
						<ChevronLeft className="w-4 h-4 mr-1" />
						Previous
					</Link>
				</Button>
			)}
			{nextStep && (
				<Button size="sm" asChild>
					<Link href={nextStep.href}>
						Next
						<ChevronRight className="w-4 h-4 ml-1" />
					</Link>
				</Button>
			)}
		</div>
	);
};
