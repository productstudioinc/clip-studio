'use client';

import { Button } from '@/components/ui/button';
import { useTemplateStore } from '@/stores/templatestore';
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
		<div className="flex justify-end space-x-2">
			{prevStep && <Button onClick={() => (window.location.href = prevStep.href)}>Previous</Button>}
			{nextStep && <Button onClick={() => (window.location.href = nextStep.href)}>Next</Button>}
		</div>
	);
};
