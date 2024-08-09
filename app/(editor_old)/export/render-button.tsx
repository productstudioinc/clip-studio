import { Button } from '@/components/ui/button';
import { CloudLightning, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface RenderState {
	status: 'init' | 'invoking' | 'rendering' | 'done' | 'error';
	error?: { message: string };
}

export const RenderButton: React.FC<{
	renderMedia: () => void;
	state: RenderState;
}> = ({ renderMedia, state }) => {
	useEffect(() => {
		if (state.status === 'error') {
			toast.error(state.error?.message);
		}
		if (state.status === 'done') {
			toast.success('Render completed!');
		}
	}, [state]);
	const isLoading = state.status === 'invoking' || state.status === 'rendering';

	return (
		<Button variant={'ghost'} disabled={isLoading || state.status === 'done'} onClick={renderMedia}>
			{isLoading ? (
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
			) : (
				<CloudLightning className="mr-2 h-4 w-4" />
			)}
			Render
		</Button>
	);
};
