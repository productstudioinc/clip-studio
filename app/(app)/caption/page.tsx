'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTemplateStore } from '@/stores/templatestore';
import { getTranscription, getTranscriptionId } from '@/utils/actions/transcribe';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TranscribeControls() {
	const { splitScreenState, setSplitScreenState } = useTemplateStore((state) => ({
		selectedTemplate: state.selectedTemplate,
		setRedditState: state.setRedditState,
		redditState: state.redditState,
		splitScreenState: state.splitScreenState,
		setSplitScreenState: state.setSplitScreenState
	}));

	const handleTranscriptionChange = (index: number, field: string, value: string) => {
		const newChunks = [...splitScreenState.transcription.chunks];
		newChunks[index] = { ...newChunks[index], [field]: value };
		setSplitScreenState({
			...splitScreenState,
			transcription: { ...splitScreenState.transcription, chunks: newChunks }
		});
	};

	const [isTranscribing, setIsTranscribing] = useState(false);

	const handleSplitScreenTranscribeClick = async () => {
		setIsTranscribing(true);
		const videoUrl = splitScreenState.videoUrl;
		const [transcriptionId, transcriptionIdErr] = await getTranscriptionId(videoUrl);

		toast.success('Extraced audio, generating transcription...');

		if (transcriptionIdErr) {
			toast.error(transcriptionIdErr.message);
		} else {
			setSplitScreenState({
				...splitScreenState,
				transcriptionId: transcriptionId
			});

			const checkTranscription = async () => {
				const [transcription, transcriptionErr] = await getTranscription(transcriptionId);

				if (transcriptionErr) {
					toast.error(transcriptionErr.message);
					setIsTranscribing(false);
				} else if (transcription.status === 'processing') {
					setTimeout(checkTranscription, 5000);
				} else if (transcription.status === 'done') {
					toast.success('Transcription generated!');
					setIsTranscribing(false);
					setSplitScreenState({
						...splitScreenState,
						transcription: transcription.data
					});
				}
			};

			checkTranscription();
		}
	};

	const renderTranscription = () => {
		if (!splitScreenState.transcription) return null;

		const { chunks } = splitScreenState.transcription;

		return (
			<div>
				<ul className="overflow-y-auto h-full">
					{chunks.map((chunk, index) => (
						<li key={index} className="chunk flex items-center mb-2">
							<Input
								value={chunk.timestamp[0]}
								onChange={(e) => handleTranscriptionChange(index, 'start', e.target.value)}
								className="mr-2 w-16"
							/>
							<Input
								value={chunk.timestamp[1]}
								onChange={(e) => handleTranscriptionChange(index, 'end', e.target.value)}
								className="mr-2 w-16"
							/>
							<Textarea
								value={chunk.text}
								onChange={(e) => handleTranscriptionChange(index, 'text', e.target.value)}
								className="mr-2"
								rows={1}
							/>
						</li>
					))}
				</ul>
			</div>
		);
	};

	return (
		<>
			<Button className="mb-4" disabled={isTranscribing} onClick={handleSplitScreenTranscribeClick}>
				{isTranscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				Transcribe
			</Button>
			{renderTranscription()}
		</>
	);
}
