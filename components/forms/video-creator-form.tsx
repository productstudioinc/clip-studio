'use client';

import { TikTokAccount, YoutubeChannel } from '@/actions/db/social-media-queries';
import { ElevenlabsVoice } from '@/actions/elevenlabs';
import { AspectRatioStep } from '@/components/form-steps/aspect-ratio-step';
import { MusicStep } from '@/components/form-steps/music-step';
import { PromptStep } from '@/components/form-steps/prompt-step';
import { RedditUrlStep } from '@/components/form-steps/reddit-url-step';
import { TemplateSelect } from '@/components/form-steps/template-select';
import { TwitterUrlStep } from '@/components/form-steps/twitter-url-step';
import { VideoPreview } from '@/components/form-steps/video-preview';
import { VisualStyleStep } from '@/components/form-steps/visual-style-step';
import { VoiceStep } from '@/components/form-steps/voice-step';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { SelectTemplates } from '@/db/schema';
import { useTemplateStore } from '@/stores/templatestore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, Video } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// TODO: Get this from the database
export const musicOptions = [
	{
		id: 'none',
		name: 'No Background Music',
		description: 'No music, voice only',
		audio: null,
		duration: 0
	},
	{
		id: 'music1',
		name: 'Upbeat Pop',
		description: 'Energetic, Modern, Positive',
		audio: '/path-to-music-1-sample.mp3',
		duration: 60
	},
	{
		id: 'music2',
		name: 'Soft Jazz',
		description: 'Smooth, Relaxing, Sophisticated',
		audio: '/path-to-music-2-sample.mp3',
		duration: 45
	},
	{
		id: 'music3',
		name: 'Epic Orchestra',
		description: 'Powerful, Dramatic, Cinematic',
		audio: '/path-to-music-3-sample.mp3',
		duration: 55
	},
	{
		id: 'music4',
		name: 'Acoustic Guitar',
		description: 'Gentle, Intimate, Folksy',
		audio: '/path-to-music-4-sample.mp3',
		duration: 50
	},
	{
		id: 'music5',
		name: 'Electronic Beats',
		description: 'Modern, Rhythmic, Technological',
		audio: '/path-to-music-5-sample.mp3',
		duration: 58
	},
	{
		id: 'music6',
		name: 'Classical Piano',
		description: 'Elegant, Timeless, Emotional',
		audio: '/path-to-music-6-sample.mp3',
		duration: 52
	},
	{
		id: 'music7',
		name: 'Ambient Soundscape',
		description: 'Atmospheric, Calming, Ethereal',
		audio: '/path-to-music-7-sample.mp3',
		duration: 65
	},
	{
		id: 'music8',
		name: 'Corporate Motivational',
		description: 'Professional, Inspiring, Uplifting',
		audio: '/path-to-music-8-sample.mp3',
		duration: 48
	},
	{
		id: 'music9',
		name: 'Tropical House',
		description: 'Sunny, Relaxed, Vacation Vibes',
		audio: '/path-to-music-9-sample.mp3',
		duration: 56
	},
	{
		id: 'music10',
		name: 'Cinematic Suspense',
		description: 'Tense, Mysterious, Thrilling',
		audio: '/path-to-music-10-sample.mp3',
		duration: 62
	},
	{
		id: 'music11',
		name: 'Retro Synthwave',
		description: '80s-inspired, Nostalgic, Energetic',
		audio: '/path-to-music-11-sample.mp3',
		duration: 54
	},
	{
		id: 'music12',
		name: 'Nature Sounds',
		description: 'Peaceful, Organic, Meditative',
		audio: '/path-to-music-12-sample.mp3',
		duration: 70
	}
];

export enum Language {
	English = 'english',
	Spanish = 'spanish',
	French = 'french',
	German = 'german',
	Italian = 'italian',
	Portuguese = 'portuguese',
	Dutch = 'dutch',
	Russian = 'russian',
	Chinese = 'chinese',
	Japanese = 'japanese',
	Korean = 'korean',
	Arabic = 'arabic',
	Hindi = 'hindi',
	Bengali = 'bengali',
	Indonesian = 'indonesian',
	Turkish = 'turkish',
	Vietnamese = 'vietnamese',
	Thai = 'thai',
	Polish = 'polish',
	Ukrainian = 'ukrainian'
}

export enum AspectRatio {
	Vertical = '9:16',
	Horizontal = '16:9',
	Square = '1:1'
}

export const AspectRatioDescriptions: Record<
	AspectRatio,
	{ name: string; description: string; width: number; height: number }
> = {
	[AspectRatio.Vertical]: {
		name: '9:16',
		description: 'Shorts, Reels, TikToks',
		width: 720,
		height: 1280
	},
	[AspectRatio.Horizontal]: { name: '16:9', description: 'YouTube', width: 1280, height: 720 },
	[AspectRatio.Square]: {
		name: '1:1',
		description: 'LinkedIn, Instagram',
		width: 1080,
		height: 1080
	}
};

const FormSchema = z.object({
	template: z.string().min(1, 'Template is required'),
	prompt: z.string().optional(),
	language: z
		.nativeEnum(Language, {
			required_error: 'Please select a language.'
		})
		.default(Language.English),

	voice: z.string().min(1, 'Voice is required').default(''),
	voiceVolume: z.number().min(0).max(100).default(70),

	music: z.string().optional(),
	musicVolume: z.number().min(0).max(100).default(30),

	visualStyle: z.string().optional(),

	// aspect ratio
	aspectRatio: z.nativeEnum(AspectRatio).optional(),
	width: z.number().min(1).default(AspectRatioDescriptions[AspectRatio.Vertical].width),
	height: z.number().min(1).default(AspectRatioDescriptions[AspectRatio.Vertical].height),

	// fps
	fps: z.number().min(1).default(30),

	// twitter
	tweetId: z.string().optional(),

	// reddit
	subreddit: z.string().optional(),
	title: z.string().optional(),
	text: z.string().optional()
});

export type FormValues = z.infer<typeof FormSchema>;

interface VideoCreatorFormProps {
	voices: ElevenlabsVoice[];
	templates: SelectTemplates[];
	youtubeChannels: YoutubeChannel[];
	tiktokAccounts: TikTokAccount[];
}

export default function VideoCreatorForm({
	voices,
	templates,
	youtubeChannels,
	tiktokAccounts
}: VideoCreatorFormProps) {
	const { selectedTemplate } = useTemplateStore();
	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			template: selectedTemplate,
			prompt: '',
			language: Language.English,
			voice: voices[0].voice_id,
			voiceVolume: 70,
			music: '',
			musicVolume: 30,
			visualStyle: '',
			aspectRatio: AspectRatio.Vertical,
			width: AspectRatioDescriptions[AspectRatio.Vertical].width,
			height: AspectRatioDescriptions[AspectRatio.Vertical].height,
			fps: 30,
			tweetId: '',
			subreddit: '',
			title: '',
			text: ''
		}
	});

	const onSubmit = async (values: FormValues) => {
		console.log('Form submitted:', { ...values, template: selectedTemplate });
		try {
			if (process.env.NODE_ENV === 'development') {
				// In development mode, render all form inputs as text
				const formInputs = Object.entries(values)
					.map(([key, value]) => `${key}: ${value}`)
					.join('\n');
				toast.info('Form Inputs (Development Mode)', {
					description: <pre className="max-h-80 overflow-auto">{formInputs}</pre>,
					duration: 0
				});
			} else {
				// In production mode, call the API to start video generation
				// await startVideoGeneration({ ...values, template: selectedTemplate });
				toast.success('Video generation started', {
					description: 'Your video is being generated. This may take a few minutes.',
					duration: 10000
				});
			}

			// return promise that resolves after 2 seconds
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					resolve();
				}, 2000);
			});
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Failed to start video generation', {
				description: 'An error occurred. Please try again.'
			});
		}
	};

	return (
		<div className="w-full max-w-7xl mx-auto p-4 space-y-8">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
					<TemplateSelect form={form} templates={templates} />

					<div className="flex flex-col lg:flex-row gap-8">
						<div className="w-full lg:w-3/5 space-y-6">
							<RedditUrlStep form={form} />
							<TwitterUrlStep form={form} />
							<PromptStep form={form} />
							<VoiceStep form={form} voices={voices} />
							<MusicStep form={form} />
							<VisualStyleStep form={form} />
							<AspectRatioStep form={form} />
							{form.formState.errors.root?.serverError && (
								<div className="text-red-500 mb-4">
									{form.formState.errors.root.serverError.message}
								</div>
							)}
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
										<Video className="mr-2 h-4 w-4" /> Generate Video
									</>
								)}
							</Button>

							<Card>
								<CardHeader>
									<CardTitle>Upload to Social Media</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button
										type="button"
										className="w-full"
										onClick={() => console.log('Upload to TikTok')}
									>
										<Upload className="mr-2 h-4 w-4" /> Upload to TikTok
									</Button>
									<Button
										type="button"
										className="w-full"
										onClick={() => console.log('Upload to YouTube')}
									>
										<Upload className="mr-2 h-4 w-4" /> Upload to YouTube
									</Button>
								</CardContent>
							</Card>
						</div>

						<div className="w-full lg:w-2/5">
							<div className="sticky top-20 space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
								<VideoPreview watch={form.watch} selectedTemplate={selectedTemplate} />
								<Card>
									<CardHeader>
										<CardTitle>Additional Information</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground">
											This section can include more details about the selected options, tips for
											creating better videos, or any other relevant information that might be
											helpful for the user during the video creation process.
										</p>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
