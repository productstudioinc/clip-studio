/* eslint-disable unused-imports/no-unused-vars */
import { z } from 'zod'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { alignmentDefault } from './alignmenttext'
import { splitScreenTranscriptionDefault } from './splitscreentranscription'

// Enums
export enum Language {
  English = 'en',
  German = 'de',
  Hindi = 'hi',
  French = 'fr',
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

// Emoji map of language flags
export const LanguageFlags: Record<Language, string> = {
  [Language.English]: '🇬🇧',
  [Language.German]: '🇩🇪',
  [Language.Hindi]: '🇮🇳',
  [Language.French]: '🇫🇷',
  [Language.Portuguese]: '🇵��',
  [Language.Italian]: '🇮🇹',
  [Language.Spanish]: '🇪🇸',
  [Language.Russian]: '🇷🇺',
  [Language.Indonesian]: '🇮🇩',
  [Language.Dutch]: '🇳🇱',
  [Language.Turkish]: '🇹🇷',
  [Language.Filipino]: '🇵🇭',
  [Language.Polish]: '🇵🇱',
  [Language.Swedish]: '🇸🇪',
  [Language.Bulgarian]: '🇧🇬',
  [Language.Romanian]: '🇷🇴',
  [Language.Arabic]: '🇸🇦',
  [Language.Czech]: '🇨🇿',
  [Language.Greek]: '🇬🇷',
  [Language.Finnish]: '🇫🇮',
  [Language.Croatian]: '🇭🇷',
  [Language.Malay]: '🇲🇾',
  [Language.Slovak]: '🇸🇰',
  [Language.Danish]: '🇩🇰',
  [Language.Tamil]: '🇱🇰',
  [Language.Ukrainian]: '🇺🇦',
  [Language.Vietnamese]: '🇻🇳',
  [Language.Norwegian]: '🇳🇴',
  [Language.Hungarian]: '🇭🇺'
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
  backgroundUrls: z.array(z.string())
})

export const TwitterVideoSchema = BaseVideoSchema.extend({
  tweetId: z.string(),
  backgroundUrls: z.array(z.string()).min(1)
})

export const SplitScreenVideoSchema = BaseVideoSchema.extend({
  videoUrl: z.string(),
  type: z.enum(['blob', 'cloud']),
  transcriptionId: z.string(),
  transcription: TranscriptionSchema,
  backgroundUrls: z.array(z.string())
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
  'Clips',
  'TextMessage',
  'AIVideo'
])
export type TemplateProps = z.infer<typeof TemplateSchema>

export const TextMessageVideoSchema = BaseVideoSchema.extend({
  sender: z.object({
    name: z.string(),
    voiceId: z.string()
  }),
  receiver: z.object({
    name: z.string(),
    image: z.string().optional(),
    voiceId: z.string()
  }),
  messages: z.array(
    z.object({
      sender: z.enum(['sender', 'receiver']),
      content: z.object({
        type: z.enum([
          'text',
          'image'
          // 'emoji', 'sticker', 'audio', 'video'
        ]),
        value: z.union([
          z.string(),
          z.object({ url: z.string() }),
          z.object({ duration: z.number() })
        ])
      }),
      from: z.number(),
      duration: z.number(),
      reactions: z.array(z.string()).optional(),
      replyTo: z.number().optional() // Index of the message being replied to
    })
  ),
  style: z.enum(['imessage', 'whatsapp']),
  mode: z.enum(['dark', 'light']),
  voiceoverUrl: z.string(),
  backgroundUrls: z.array(z.string())
})

export const AIVideoSchema = BaseVideoSchema.extend({
  prompt: z.string(),
  storyLength: z.enum(['short', 'medium', 'long']),
  range: z.union([z.literal('1-2'), z.literal('3-4'), z.literal('5-7')]),
  segments: z.union([z.literal('6-7'), z.literal('12-14'), z.literal('18-21')]),
  videoStructure: z.array(
    z.object({
      text: z.string(),
      imageDescription: z.string(),
      imageUrl: z.string().nullable()
    })
  ),
  voiceoverUrl: z.string(),
  voiceoverFrames: VoiceoverFramesSchema
}).refine(
  (data) => {
    const rangeToSegments = {
      '1-2': '6-7',
      '3-4': '12-14',
      '5-7': '18-21'
    }
    return (
      data.segments ===
      rangeToSegments[data.range as keyof typeof rangeToSegments]
    )
  },
  {
    message:
      'Range and segments must match: 1-2 with 6-7, 3-4 with 12-14, or 5-7 with 18-21',
    path: ['segments']
  }
)

export type AIVideoProps = z.infer<typeof AIVideoSchema>

export const VideoSchema = z.union([
  SplitScreenVideoSchema,
  RedditVideoSchema,
  TwitterVideoSchema,
  ClipsVideoSchema,
  TextMessageVideoSchema,
  AIVideoSchema
])

// Types
export type VideoProps = z.infer<typeof VideoSchema>
export type BaseVideoProps = z.infer<typeof BaseVideoSchema>
export type RedditVideoProps = z.infer<typeof RedditVideoSchema>
export type TwitterVideoProps = z.infer<typeof TwitterVideoSchema>
export type SplitScreenVideoProps = z.infer<typeof SplitScreenVideoSchema>
export type TextMessageVideoProps = z.infer<typeof TextMessageVideoSchema>
export type ClipsVideoProps = z.infer<typeof ClipsVideoSchema>

// Default Props
const generateMinecraftBackgrounds = (count: number) => {
  return Array.from(
    { length: count },
    (_, i) => `https://assets.clip.studio/mc_${i}.mp4`
  )
}

const allMinecraftBackgrounds = generateMinecraftBackgrounds(100)

const selectRandomBackgroundWindow = (
  backgrounds: string[],
  windowSize: number = 5
) => {
  const totalParts = backgrounds.length
  const maxStartIndex = totalParts - windowSize
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1))
  return backgrounds.slice(startIndex, startIndex + windowSize)
}

export const defaultSplitScreenProps: SplitScreenVideoProps = {
  videoUrl: 'https://assets.clip.studio/transcribe_test.webm',
  type: 'cloud',
  durationInFrames: 60 * 30,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: selectRandomBackgroundWindow(allMinecraftBackgrounds),
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
  backgroundUrls: selectRandomBackgroundWindow(allMinecraftBackgrounds),
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
  backgroundUrls: selectRandomBackgroundWindow(allMinecraftBackgrounds),
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  captionStyle: CaptionStyle.Default
}

export const defaultTextMessageProps: TextMessageVideoProps = {
  sender: {
    name: 'me',
    voiceId: '9BWtsMINqrJLrRacOk9x'
  },
  receiver: {
    name: 'Jessica',
    image: '',
    voiceId: 'EXAVITQu4vr4xnSDxMaL'
  },
  messages: [
    {
      sender: 'sender',
      content: {
        type: 'text',
        value:
          "OMG! You won't believe who I just caught sneaking out of the principal's office! 😱🔥"
      },
      from: 0,
      duration: 4.505
    },
    {
      sender: 'receiver',
      content: {
        type: 'text',
        value: 'No way! Who?? Spill the tea! ☕️👀'
      },
      from: 4.505,
      duration: 2.461
    },
    {
      sender: 'sender',
      content: {
        type: 'text',
        value:
          'Promise not to tell? It was... the head cheerleader with the math nerd! 🤓📚💋'
      },
      from: 6.966,
      duration: 5.294
    },
    {
      sender: 'receiver',
      content: {
        type: 'text',
        value:
          'WHAT?! Ashley and Kevin?! My mind is blown! 🤯 How did THAT happen?!'
      },
      from: 12.26,
      duration: 5.108
    }
  ],
  style: 'imessage',
  mode: 'dark',
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  durationInFrames: 521,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: selectRandomBackgroundWindow(allMinecraftBackgrounds),
  captionStyle: CaptionStyle.Default,
  voiceoverUrl: 'https://assets.clip.studio/messages_voiceover_sample.mp3'
}

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
  titlePosition: 20,
  subtitlePosition: 80,
  videoPosition: 50,
  videoScale: 100,
  title: 'Jasontheween hits 100k subscribers',
  subtitle: '',
  voiceVolume: 70,
  musicVolume: 30
}

export const defaultAIVideoProps: AIVideoProps = {
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  durationInFrames: DEFAULT_DURATION_IN_FRAMES,
  prompt: 'A story about Julius Caesar',
  captionStyle: CaptionStyle.Default,
  voiceoverUrl: 'https://assets.clip.studio/ai_voiceover_sample.mp3',
  voiceoverFrames: alignmentDefault,
  storyLength: 'short',
  range: '1-2',
  segments: '6-7',
  videoStructure: [
    {
      text: 'A man and woman are walking in a field of flowers',
      imageDescription: 'A man and woman are walking in a field of flowers',
      imageUrl: null
    },
    {
      text: 'A man and woman are walking in a field of flowers',
      imageDescription: 'A man and woman are walking in a field of flowers',
      imageUrl: null
    }
  ]
}

const initialState = {
  selectedTemplate: 'AIVideo' as TemplateProps,
  splitScreenState: defaultSplitScreenProps,
  redditState: defaultRedditProps,
  twitterThreadState: defaultTwitterThreadProps,
  textMessageState: defaultTextMessageProps,
  durationInFrames: DEFAULT_DURATION_IN_FRAMES,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: selectRandomBackgroundWindow(allMinecraftBackgrounds),
  captionStyle: CaptionStyle.Default,
  clipsState: defaultClipsProps,
  aiVideoState: defaultAIVideoProps
}

type State = {
  selectedTemplate: TemplateProps
  setSelectedTemplate: (template: TemplateProps) => void
  splitScreenState: SplitScreenVideoProps
  setSplitScreenState: (state: Partial<SplitScreenVideoProps>) => void
  redditState: RedditVideoProps
  setRedditState: (state: Partial<RedditVideoProps>) => void
  twitterThreadState: TwitterVideoProps
  setTwitterThreadState: (state: Partial<TwitterVideoProps>) => void
  textMessageState: TextMessageVideoProps
  setTextMessageState: (state: Partial<TextMessageVideoProps>) => void
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
  aiVideoState: AIVideoProps
  setAIVideoState: (state: Partial<AIVideoProps>) => void
  reset: () => void
}

export const useTemplateStore = create<State>()(
  devtools((set) => ({
    ...initialState,
    setSelectedTemplate: (template) => set({ selectedTemplate: template }),
    setSplitScreenState: (state) =>
      set((prevState) => ({
        splitScreenState: { ...prevState.splitScreenState, ...state }
      })),
    setRedditState: (state) =>
      set((prevState) => ({
        redditState: { ...prevState.redditState, ...state }
      })),
    setTwitterThreadState: (state) =>
      set((prevState) => ({
        twitterThreadState: { ...prevState.twitterThreadState, ...state }
      })),
    setTextMessageState: (state) =>
      set((prevState) => ({
        textMessageState: { ...prevState.textMessageState, ...state }
      })),
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
        clipsState: { ...state.clipsState, durationInFrames: length },
        textMessageState: {
          ...state.textMessageState,
          durationInFrames: length
        },
        aiVideoState: { ...state.aiVideoState, durationInFrames: length }
      })),
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
        clipsState: { ...state.clipsState, backgroundTheme: theme },
        textMessageState: {
          ...state.textMessageState,
          backgroundTheme: theme
        },
        aiVideoState: { ...state.aiVideoState, backgroundTheme: theme }
      })),
    setBackgroundUrls: (urls) =>
      set((state) => ({
        backgroundUrls: urls,
        splitScreenState: { ...state.splitScreenState, backgroundUrls: urls },
        redditState: { ...state.redditState, backgroundUrls: urls },
        twitterThreadState: {
          ...state.twitterThreadState,
          backgroundUrls: urls
        },
        clipsState: { ...state.clipsState, backgroundUrls: urls },
        textMessageState: { ...state.textMessageState, backgroundUrls: urls },
        aiVideoState: { ...state.aiVideoState, backgroundUrls: urls }
      })),
    setCaptionStyle: (style) =>
      set((state) => ({
        captionStyle: style,
        splitScreenState: { ...state.splitScreenState, captionStyle: style },
        redditState: { ...state.redditState, captionStyle: style },
        twitterThreadState: {
          ...state.twitterThreadState,
          captionStyle: style
        },
        clipsState: { ...state.clipsState, captionStyle: style },
        textMessageState: { ...state.textMessageState, captionStyle: style },
        aiVideoState: { ...state.aiVideoState, captionStyle: style }
      })),
    setClipsState: (state) =>
      set((prevState) => ({
        clipsState: { ...prevState.clipsState, ...state }
      })),
    setAIVideoState: (state) =>
      set((prevState) => ({
        aiVideoState: { ...prevState.aiVideoState, ...state }
      })),
    reset: () => set(initialState)
  }))
)
