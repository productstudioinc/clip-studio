import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { alignmentDefault } from './alignmenttext';
import { splitScreenTranscriptionDefault } from './splitscreentranscription';

const SharedProps = z.object({
	durationInFrames: z.number(),
	backgroundTheme: z.enum(['Minecraft', 'GTA', 'Satisfying']),
	backgroundUrls: z.array(z.string())
});

const VoiceoverFrames = z.object({
	characters: z.array(z.string()),
	character_start_times_seconds: z.array(z.number()),
	character_end_times_seconds: z.array(z.number())
});

export const Transcription = z.object({
	text: z.string(),
	chunks: z.array(
		z.object({
			timestamp: z.array(z.number()),
			text: z.string()
		})
	)
});

export const TranscriptionResponse = z.array(Transcription, z.string());

export const SplitScreenProps = z
	.object({
		videoUrl: z.string(),
		type: z.enum(['blob', 'cloud']),
		transcriptionId: z.string(),
		transcription: Transcription
	})
	.merge(SharedProps);

export const RedditProps = z
	.object({
		title: z.string(),
		text: z.string(),
		subreddit: z.string(),
		accountName: z.string(),
		voiceoverUrl: z.string(),
		voiceoverFrames: VoiceoverFrames,
		titleEnd: z.number()
	})
	.merge(SharedProps);

export const TwitterThreadProps = z
	.object({
		tweetIds: z.array(z.string())
	})
	.merge(SharedProps);

export const CompositionProps = z.union([SplitScreenProps, RedditProps, TwitterThreadProps]);

const defaultMinecraftBackgrounds = [
	'https://assets.clip.studio/mc_0.mp4',
	'https://assets.clip.studio/mc_1.mp4',
	'https://assets.clip.studio/mc_2.mp4',
	'https://assets.clip.studio/mc_3.mp4',
	'https://assets.clip.studio/mc_4.mp4',
	'https://assets.clip.studio/mc_5.mp4',
	'https://assets.clip.studio/mc_6.mp4',
	'https://assets.clip.studio/mc_7.mp4',
	'https://assets.clip.studio/mc_8.mp4',
	'https://assets.clip.studio/mc_9.mp4'
];

export const defaultMyCompProps: z.infer<typeof SplitScreenProps> = {
	videoUrl: 'https://assets.clip.studio/transcribe_test.mp4',
	type: 'cloud',
	durationInFrames: 3643,
	backgroundTheme: 'Minecraft',
	backgroundUrls: defaultMinecraftBackgrounds,
	transcriptionId: '',
	transcription: splitScreenTranscriptionDefault
};

export const defaultRedditProps: z.infer<typeof RedditProps> = {
	title: 'Decline to pay me after I help you pass your exam, have fun getting deported',
	text: "So, this happened a couple of years ago during COVID when everything was online. A mutual friend (let's call him D) reached out to me, absolutely desperate. He was on the verge of getting deported because he had already failed his coding exam twice. One more failure and he wouldn't be able to stay in the country. He knew I was good at coding and begged me to take the exam for him. He told me how his entire future depended on it, how he had no options left, etc. Feeling a bit sorry for him, I agreed—on the condition that he would pay me $500 for doing it. He agreed immediately, so I spent a couple of weeks preparing. The exam was proctored over Zoom, and we set it up so that I could control his computer remotely while he pretended to take the exam himself. We pulled it off without a hitch, and he passed the exam. Afterward, we went out for drinks to celebrate (each paid their own share because I didn't want him deducting anything from what he owed me). Here's where things went downhill. He gave me $100 upfront and promised to pay the remaining $400 in a couple of weeks after he sorted out his graduation stuff. Weeks turned into months, and he kept dodging me with excuses. After six months of this, it became clear he wasn't going to pay me back. I gave him multiple warnings to pay me or I'll report him but he kept taking it lightly and blocked me I was pissed. I helped him out, and he completely ghosted me after getting what he wanted. So, I decided to take matters into my own hands. First, I reported him to his university for academic misconduct. I explained in detail how I was the one who took the exam for him and provided evidence to back it up. They investigated and failed him retroactively, which meant he couldn't graduate. Since his visa was tied to his student status, this basically screwed him over completely. Some context : It was an anonymous tip off to the college with a fake email with all the proof,they called him and gave him a chance to retake exam on the spot but guy never studied and failed at the most basic stuff. But it didn't end there. He was still living in the country illegally, hoping to somehow fix things. I knew he had no way out, so I anonymously tipped off the authorities, saying there was an illegal immigrant involved in suspicious activity living in my area. They came, found out he was there illegally, and he got deported. Context - As for deport I felt bit scared in case he tried to hurt me in some way so I made sure he never set a foot in there again Now some mutual friends are saying I went too far, that it was a petty move to ruin his entire life over $400. On one hand, I feel like he deserved it for trying to scam me. I wouldn't have mind if he came clean saying he doesn't have money or financial capacity to pay and he was sorry I would have let the matters go without a hitch.",
	subreddit: 'AmITheAsshole',
	durationInFrames: Math.floor(30 * 177.4),
	backgroundTheme: 'Minecraft',
	backgroundUrls: defaultMinecraftBackgrounds,
	voiceoverUrl: 'https://assets.clip.studio/reddit_voiceover_sample.mp3',
	voiceoverFrames: alignmentDefault,
	accountName: 'clipstudio',
	titleEnd: 4.168
};

export const defaultTwitterThreadProps: z.infer<typeof TwitterThreadProps> = {
	tweetIds: ['1803609101110550977'],
	durationInFrames: 900,
	backgroundTheme: 'Minecraft',
	backgroundUrls: defaultMinecraftBackgrounds
};

export const VIDEO_WIDTH = 720;
export const VIDEO_HEIGHT = 1280;
export const VIDEO_FPS = 30;

export const TemplateSchema = z.enum(['SplitScreen', 'Reddit', 'TwitterThread']);

type State = {
	selectedTemplate: z.infer<typeof TemplateSchema>;
	setSelectedTemplate: (template: z.infer<typeof TemplateSchema>) => void;
	splitScreenState: z.infer<typeof SplitScreenProps>;
	setSplitScreenState: (state: Partial<z.infer<typeof SplitScreenProps>>) => void;
	redditState: z.infer<typeof RedditProps>;
	setRedditState: (state: Partial<z.infer<typeof RedditProps>>) => void;
	twitterThreadState: z.infer<typeof TwitterThreadProps>;
	setTwitterThreadState: (state: Partial<z.infer<typeof TwitterThreadProps>>) => void;
	durationInFrames: number;
	setdurationInFrames: (length: number) => void;
	backgroundTheme: z.infer<typeof SharedProps>['backgroundTheme'];
	setBackgroundTheme: (theme: z.infer<typeof SharedProps>['backgroundTheme']) => void;
	backgroundUrls: string[];
	setBackgroundUrls: (urls: string[]) => void;
};

export const useTemplateStore = create<State>()(
	persist(
		(set) => ({
			selectedTemplate: 'Reddit',
			setSelectedTemplate: (template) => {
				TemplateSchema.parse(template);
				set({ selectedTemplate: template });
			},
			splitScreenState: defaultMyCompProps,
			setSplitScreenState: (state) =>
				set((prevState) => ({
					splitScreenState: { ...prevState.splitScreenState, ...state }
				})),
			redditState: defaultRedditProps,
			setRedditState: (state) =>
				set((prevState) => ({
					redditState: { ...prevState.redditState, ...state }
				})),
			twitterThreadState: defaultTwitterThreadProps,
			setTwitterThreadState: (state) =>
				set((prevState) => ({
					twitterThreadState: { ...prevState.twitterThreadState, ...state }
				})),
			durationInFrames: 900,
			setdurationInFrames: (length) =>
				set((state) => ({
					durationInFrames: length,
					splitScreenState: { ...state.splitScreenState, durationInFrames: length },
					redditState: { ...state.redditState, durationInFrames: length },
					twitterThreadState: {
						...state.twitterThreadState,
						durationInFrames: length
					}
				})),
			backgroundTheme: 'Minecraft',
			setBackgroundTheme: (theme) =>
				set((state) => ({
					backgroundTheme: theme,
					splitScreenState: { ...state.splitScreenState, backgroundTheme: theme },
					redditState: { ...state.redditState, backgroundTheme: theme },
					twitterThreadState: {
						...state.twitterThreadState,
						backgroundTheme: theme
					}
				})),
			backgroundUrls: defaultMinecraftBackgrounds,
			setBackgroundUrls: (urls) =>
				set((state) => ({
					backgroundUrls: urls,
					splitScreenState: { ...state.splitScreenState, backgroundUrls: urls },
					redditState: { ...state.redditState, backgroundUrls: urls },
					twitterThreadState: { ...state.twitterThreadState, backgroundUrls: urls }
				}))
		}),
		{
			name: 'template-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				selectedTemplate: state.selectedTemplate,
				splitScreenState: state.splitScreenState,
				redditState: state.redditState,
				twitterThreadState: state.twitterThreadState,
				durationInFrames: state.durationInFrames,
				backgroundTheme: state.backgroundTheme,
				backgroundUrls: state.backgroundUrls
			})
		}
	)
);
