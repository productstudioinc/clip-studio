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
import { Trash2 } from 'lucide-react';

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
				<Button variant="outline">
					<Trash2 className="w-4 h-4 mr-1" />
					Clear Settings
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure you want to clear your settings?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. Clearing your local settings will reset all options to
						their default values and remove any unsaved transcriptions, voiceovers, and other
						temporary data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleReset}>Clear Settings</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
