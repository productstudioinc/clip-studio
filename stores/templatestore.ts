/* eslint-disable unused-imports/no-unused-vars */
import { z } from 'zod'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { alignmentDefault } from './alignmenttext'
import { splitScreenTranscriptionDefault } from './splitscreentranscription'

// TODO: move to db
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
]

// Enums
export enum Language {
  English = 'en',
  Japanese = 'ja',
  Chinese = 'zh',
  German = 'de',
  Hindi = 'hi',
  French = 'fr',
  Korean = 'ko',
  Portuguese = 'pt',
  Italian = 'it',
  Spanish = 'es',
  Russian = 'ru',
  Indonesian = 'id',
  Dutch = 'nl',
  Turkish = 'tr',
  Filipino = 'fil',
  Polish = 'pl',
  Swedish = 'sv',
  Bulgarian = 'bg',
  Romanian = 'ro',
  Arabic = 'ar',
  Czech = 'cs',
  Greek = 'el',
  Finnish = 'fi',
  Croatian = 'hr',
  Malay = 'ms',
  Slovak = 'sk',
  Danish = 'da',
  Tamil = 'ta',
  Ukrainian = 'uk',
  Vietnamese = 'vi',
  Norwegian = 'no',
  Hungarian = 'hu'
}

export enum AspectRatio {
  Vertical = '9:16',
  Horizontal = '16:9',
  Square = '1:1'
}

export enum BackgroundTheme {
  Minecraft = 'Minecraft',
  GTA = 'GTA',
  Satisfying = 'Satisfying'
}

export enum CaptionStyle {
  Default = 'default',
  KomikaAxis = 'komikaAxis',
  Futuristic = 'futuristic',
  Handwritten = 'handwritten',
  Montserrat = 'montserrat'
}

// Constants
export const AspectRatioMap: Record<
  AspectRatio,
  { name: string; description: string; width: number; height: number }
> = {
  [AspectRatio.Vertical]: {
    name: '9:16',
    description: 'Shorts, Reels, TikToks',
    width: 720,
    height: 1280
  },
  [AspectRatio.Horizontal]: {
    name: '16:9',
    description: 'YouTube',
    width: 1280,
    height: 720
  },
  [AspectRatio.Square]: {
    name: '1:1',
    description: 'LinkedIn, Instagram',
    width: 1080,
    height: 1080
  }
}

export const VIDEO_WIDTH = 720
export const VIDEO_HEIGHT = 1280
export const VIDEO_FPS = 30
export const DEFAULT_DURATION_IN_FRAMES = 900

// Zod Schemas
const BaseVideoSchema = z.object({
  language: z.nativeEnum(Language).default(Language.English),
  voice: z.string().optional(),
  voiceVolume: z.number().min(0).max(100).default(70),
  music: z.string().optional(),
  musicVolume: z.number().min(0).max(100).default(30),
  visualStyle: z.string().optional(),
  aspectRatio: z.nativeEnum(AspectRatio).default(AspectRatio.Vertical),
  width: z.number().min(1).default(VIDEO_WIDTH),
  height: z.number().min(1).default(VIDEO_HEIGHT),
  fps: z.number().min(1).default(VIDEO_FPS),
  durationInFrames: z.number().min(1).default(DEFAULT_DURATION_IN_FRAMES),
  backgroundTheme: z.nativeEnum(BackgroundTheme).optional(),
  backgroundUrls: z.array(z.string()).optional(),
  captionStyle: z.nativeEnum(CaptionStyle).default(CaptionStyle.Default)
})

const VoiceoverFramesSchema = z.object({
  characters: z.array(z.string()),
  character_start_times_seconds: z.array(z.number()),
  character_end_times_seconds: z.array(z.number())
})

export const TranscriptionSchema = z.object({
  text: z.string(),
  chunks: z.array(
    z.object({
      timestamp: z.array(z.number()),
      text: z.string()
    })
  )
})

export const RedditVideoSchema = BaseVideoSchema.extend({
  title: z.string(),
  text: z.string(),
  subreddit: z.string(),
  accountName: z.string(),
  likes: z.number(),
  comments: z.number(),
  voiceoverUrl: z.string(),
  voiceoverFrames: VoiceoverFramesSchema,
  titleEnd: z.number(),
  backgroundUrls: z.array(z.string()).min(1)
})

export const TwitterVideoSchema = BaseVideoSchema.extend({
  tweetId: z.string()
})

export const SplitScreenVideoSchema = BaseVideoSchema.extend({
  videoUrl: z.string(),
  type: z.enum(['blob', 'cloud']),
  transcriptionId: z.string(),
  transcription: TranscriptionSchema,
  backgroundUrls: z.array(z.string()).min(1)
})

export const ClipsVideoSchema = BaseVideoSchema.extend({
  videoUrl: z.string(),
  type: z.enum(['blob', 'cloud']),
  videoPosition: z.number().min(0).max(100).default(50),
  titlePosition: z.number().min(0).max(100).default(15),
  subtitlePosition: z.number().min(0).max(100).default(80),
  videoScale: z.number().min(10).max(200).default(100),
  title: z.string().optional(),
  subtitle: z.string().optional()
})

export const TemplateSchema = z.enum([
  'SplitScreen',
  'Reddit',
  'TwitterThread',
  'Clips'
])
export type TemplateProps = z.infer<typeof TemplateSchema>

export const VideoSchema = z.union([
  SplitScreenVideoSchema,
  RedditVideoSchema,
  TwitterVideoSchema,
  ClipsVideoSchema
])

export type ClipsVideoProps = z.infer<typeof ClipsVideoSchema>

export type VideoProps =
  | RedditVideoProps
  | TwitterVideoProps
  | SplitScreenVideoProps
  | ClipsVideoProps

// Types
export type BaseVideoProps = z.infer<typeof BaseVideoSchema>
export type RedditVideoProps = z.infer<typeof RedditVideoSchema>
export type TwitterVideoProps = z.infer<typeof TwitterVideoSchema>
export type SplitScreenVideoProps = z.infer<typeof SplitScreenVideoSchema>

export const defaultClipsProps: ClipsVideoProps = {
  videoUrl: 'https://assets.clip.studio/clips_sample.webm',
  type: 'cloud',
  language: Language.English,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  durationInFrames: DEFAULT_DURATION_IN_FRAMES,
  captionStyle: CaptionStyle.Default,
  titlePosition: 15,
  subtitlePosition: 80,
  videoPosition: 50,
  videoScale: 100,
  title: 'Jasontheween hits 100k subscribers',
  subtitle: '',
  voiceVolume: 70,
  musicVolume: 30
}

// Default Props
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
]

export const defaultSplitScreenProps: SplitScreenVideoProps = {
  videoUrl: 'https://assets.clip.studio/transcribe_test.webm',
  type: 'cloud',
  durationInFrames: 60 * 30,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: defaultMinecraftBackgrounds,
  transcriptionId: '',
  transcription: splitScreenTranscriptionDefault,
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  captionStyle: CaptionStyle.Default
}

export const defaultRedditProps: RedditVideoProps = {
  title:
    'Decline to pay me after I help you pass your exam, have fun getting deported',
  text: "So, this happened a couple of years ago during COVID when everything was online. A mutual friend (let's call him D) reached out to me, absolutely desperate. He was on the verge of getting deported because he had already failed his coding exam twice. One more failure and he wouldn't be able to stay in the country. He knew I was good at coding and begged me to take the exam for him. He told me how his entire future depended on it, how he had no options left, etc. Feeling a bit sorry for him, I agreed—on the condition that he would pay me $500 for doing it. He agreed immediately, so I spent a couple of weeks preparing. The exam was proctored over Zoom, and we set it up so that I could control his computer remotely while he pretended to take the exam himself. We pulled it off without a hitch, and he passed the exam. Afterward, we went out for drinks to celebrate (each paid their own share because I didn't want him deducting anything from what he owed me).",
  subreddit: 'NuclearRevenge',
  likes: 4200,
  comments: 366,
  durationInFrames: 30 * 30,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: defaultMinecraftBackgrounds,
  voiceoverUrl: 'https://assets.clip.studio/reddit_voiceover_sample.mp3',
  voiceoverFrames: alignmentDefault,
  accountName: 'clipstudio',
  titleEnd: 5.097,
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  captionStyle: CaptionStyle.Default
}

export const defaultTwitterThreadProps: TwitterVideoProps = {
  tweetId: '1803609101110550977',
  durationInFrames: 900,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: defaultMinecraftBackgrounds,
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  captionStyle: CaptionStyle.Default
}

// Zustand Store
type State = {
  selectedTemplate: TemplateProps
  setSelectedTemplate: (template: TemplateProps) => void
  splitScreenState: SplitScreenVideoProps
  setSplitScreenState: (state: Partial<SplitScreenVideoProps>) => void
  redditState: RedditVideoProps
  setRedditState: (state: Partial<RedditVideoProps>) => void
  twitterThreadState: TwitterVideoProps
  setTwitterThreadState: (state: Partial<TwitterVideoProps>) => void
  durationInFrames: number
  setDurationInFrames: (length: number) => void
  backgroundTheme: BackgroundTheme
  setBackgroundTheme: (theme: BackgroundTheme) => void
  backgroundUrls: string[]
  setBackgroundUrls: (urls: string[]) => void
  captionStyle: CaptionStyle
  setCaptionStyle: (style: CaptionStyle) => void
  clipsState: ClipsVideoProps
  setClipsState: (state: Partial<ClipsVideoProps>) => void
}

export const useTemplateStore = create<State>()(
  persist(
    (set) => ({
      selectedTemplate: 'Reddit',
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      splitScreenState: defaultSplitScreenProps,
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
      durationInFrames: DEFAULT_DURATION_IN_FRAMES,
      setDurationInFrames: (length) =>
        set((state) => ({
          durationInFrames: length,
          splitScreenState: {
            ...state.splitScreenState,
            durationInFrames: length
          },
          redditState: { ...state.redditState, durationInFrames: length },
          twitterThreadState: {
            ...state.twitterThreadState,
            durationInFrames: length
          },
          clipsState: { ...state.clipsState, durationInFrames: length }
        })),
      backgroundTheme: BackgroundTheme.Minecraft,
      setBackgroundTheme: (theme) =>
        set((state) => ({
          backgroundTheme: theme,
          splitScreenState: {
            ...state.splitScreenState,
            backgroundTheme: theme
          },
          redditState: { ...state.redditState, backgroundTheme: theme },
          twitterThreadState: {
            ...state.twitterThreadState,
            backgroundTheme: theme
          },
          clipsState: { ...state.clipsState, backgroundTheme: theme }
        })),
      backgroundUrls: defaultMinecraftBackgrounds,
      setBackgroundUrls: (urls) =>
        set((state) => ({
          backgroundUrls: urls,
          splitScreenState: { ...state.splitScreenState, backgroundUrls: urls },
          redditState: { ...state.redditState, backgroundUrls: urls },
          twitterThreadState: {
            ...state.twitterThreadState,
            backgroundUrls: urls
          },
          clipsState: { ...state.clipsState, backgroundUrls: urls }
        })),
      captionStyle: CaptionStyle.Default,
      setCaptionStyle: (style) =>
        set((state) => ({
          captionStyle: style,
          splitScreenState: { ...state.splitScreenState, captionStyle: style },
          redditState: { ...state.redditState, captionStyle: style },
          twitterThreadState: {
            ...state.twitterThreadState,
            captionStyle: style
          },
          clipsState: { ...state.clipsState, captionStyle: style }
        })),
      clipsState: defaultClipsProps,
      setClipsState: (state) =>
        set((prevState) => ({
          clipsState: { ...prevState.clipsState, ...state }
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
        clipsState: state.clipsState,
        durationInFrames: state.durationInFrames,
        captionStyle: state.captionStyle
      })
    }
  )
)
