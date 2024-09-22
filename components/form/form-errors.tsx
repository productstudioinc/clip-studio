import { Button } from '@/components/ui/button';
import { VideoProps } from '@/stores/templatestore';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

type FormSubmitProps = {
	form: UseFormReturn<VideoProps>;
};

export const FormSubmit: React.FC<FormSubmitProps> = ({ form }) => (
	<Button
		type="submit"
		className="w-full"
		size="lg"
		disabled={form.formState.isSubmitting || !form.formState.isValid}
	>
		{form.formState.isSubmitting ? (
			<>
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				Generating...
			</>
		) : (
			<>
				<span className="mr-2 h-4 w-4">🎥</span> Generate Video
			</>
		)}
	</Button>
);
