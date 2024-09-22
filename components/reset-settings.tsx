'use client';

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
import {
	BackgroundTheme,
	defaultRedditProps,
	defaultSplitScreenProps,
	defaultTwitterThreadProps,
	useTemplateStore
} from '@/stores/templatestore';
import { RotateCcw } from 'lucide-react';

export const ResetSettings = () => {
	const resetStore = useTemplateStore((state) => ({
		setSelectedTemplate: state.setSelectedTemplate,
		setSplitScreenState: state.setSplitScreenState,
		setRedditState: state.setRedditState,
		setTwitterThreadState: state.setTwitterThreadState,
		setdurationInFrames: state.setDurationInFrames,
		setBackgroundTheme: state.setBackgroundTheme,
		setBackgroundUrls: state.setBackgroundUrls
	}));

	const handleReset = () => {
		useTemplateStore.persist.clearStorage();
		resetStore.setSelectedTemplate('Reddit');
		resetStore.setSplitScreenState(defaultSplitScreenProps);
		resetStore.setRedditState(defaultRedditProps);
		resetStore.setTwitterThreadState(defaultTwitterThreadProps);
		resetStore.setdurationInFrames(900);
		resetStore.setBackgroundTheme(BackgroundTheme.Minecraft);
		resetStore.setBackgroundUrls(defaultSplitScreenProps.backgroundUrls);
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
					<RotateCcw className="w-4 h-4 mr-1" />
					Reset
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure you want to reset?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will reset all your settings to their default values.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
