'use client';

import { useTemplateStore } from '@/stores/templatestore';
import { usePathname } from 'next/navigation';

const steps = [
  {
    label: 'Templates',
    href: '/',
  },
  {
    label: 'Configure',
    href: '/configure',
  },
  {
    label: 'Voiceover',
    href: '/voiceover',
  },
  {
    label: 'Caption',
    href: '/caption',
  },
  {
    label: 'Export',
    href: '/export',
  },
]

export const PageSwitcher = () => {
	const currentRoute = usePathname();
  const { selectedTemplate } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate
  }))
	return (

  )
};
