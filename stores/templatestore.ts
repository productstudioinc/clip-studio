/* eslint-disable unused-imports/no-unused-vars */
import { z } from 'zod'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { aiVoiceoverFrames } from './aivideo_voiceover'
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
  [Language.Portuguese]: '🇵',
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
  Custom = 'Custom',
  Satisfying = 'Satisfying'
}

export enum CaptionStyle {
  Default = 'default',
  KomikaAxis = 'komikaAxis',
  Futuristic = 'futuristic',
  Handwritten = 'handwritten',
  Montserrat = 'montserrat'
}

export enum VisualStyle {
  Realistic = 'Realistic',
  Anime = 'Anime',
  Neopunk = 'Neopunk',
  JapaneseInk = 'Japanese Ink',
  LineArt = 'Line Art',
  Medieval = 'Medieval',
  Cinematic = 'Cinematic',
  Playdoh = 'Playdoh'
}

export const visualStyles = [
  {
    id: VisualStyle.Realistic,
    name: 'Realistic',
    image: 'https://assets.clip.studio/visual_style_realistic.jpg'
  },
  {
    id: VisualStyle.Anime,
    name: 'Anime',
    image: 'https://assets.clip.studio/visual_style_anime.jpg'
  },
  {
    id: VisualStyle.Neopunk,
    name: 'Neopunk',
    image: 'https://assets.clip.studio/visual_style_neopunk.jpg'
  },
  {
    id: VisualStyle.JapaneseInk,
    name: 'Japanese Ink',
    image: 'https://assets.clip.studio/visual_style_japanese.jpg'
  },
  {
    id: VisualStyle.LineArt,
    name: 'Line Art',
    image: 'https://assets.clip.studio/visual_style_lineart.jpg'
  },
  {
    id: VisualStyle.Medieval,
    name: 'Medieval',
    image: 'https://assets.clip.studio/visual_style_medieval.jpg'
  },
  {
    id: VisualStyle.Cinematic,
    name: 'Cinematic',
    image: 'https://assets.clip.studio/visual_style_cinematic.jpg'
  },
  {
    id: VisualStyle.Playdoh,
    name: 'Playdoh',
    image: 'https://assets.clip.studio/visual_style_playdoh.jpg'
  }
]

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
  backgroundUrls: z.array(z.string()),
  isVoiceoverGenerated: z.boolean().default(false) // a flag to generate a voiceover
})

export const TwitterVideoSchema = BaseVideoSchema.extend({
  tweets: z.array(
    z.object({
      id: z.string(),
      username: z.string(),
      avatar: z.string(),
      content: z.string(),
      image: z.string(),
      likes: z.number().optional(),
      retweets: z.number().optional(),
      comments: z.number().optional(),
      verified: z.boolean().optional().default(true),
      duration: z.number().optional(),
      from: z.number().optional()
    })
  ),
  backgroundUrls: z.array(z.string()).min(1),
  voiceoverUrl: z.string(),
  voiceSettings: z
    .array(
      z.object({
        username: z.string(),
        voiceId: z.string()
      })
    )
    .optional(),
  isVoiceoverGenerated: z.boolean().default(false),
  voiceSpeed: z.number().min(1).max(2).default(1)
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
  backgroundUrls: z.array(z.string()),
  isVoiceoverGenerated: z.boolean().default(false) // a flag to generate a voiceover
})

export const AIVideoSchema = z.object({
  language: z.nativeEnum(Language).default(Language.English),
  voiceVolume: z.number().min(0).max(100).default(70),
  musicVolume: z.number().min(0).max(100).default(30),
  aspectRatio: z.nativeEnum(AspectRatio).default(AspectRatio.Vertical),
  width: z.number().min(1).default(VIDEO_WIDTH),
  height: z.number().min(1).default(VIDEO_HEIGHT),
  fps: z.number().min(1).default(VIDEO_FPS),
  durationInFrames: z.number().min(1).default(DEFAULT_DURATION_IN_FRAMES),
  prompt: z.string(),
  storyLength: z.enum(['short', 'medium', 'long']),
  range: z.union([z.literal('1-2'), z.literal('3-4'), z.literal('5-7')]),
  segments: z.union([z.literal('6-7'), z.literal('12-14'), z.literal('18-21')]),
  videoStructure: z.array(
    z.object({
      text: z.string(),
      imageDescription: z.string(),
      imageUrl: z.string().nullable(),
      duration: z.number().optional() // Make duration optional
    })
  ),
  voiceId: z.string(),
  voiceoverUrl: z.string(),
  visualStyle: z.nativeEnum(VisualStyle).default(VisualStyle.Realistic),
  voiceoverFrames: VoiceoverFramesSchema,
  backgroundTheme: z.nativeEnum(BackgroundTheme).optional(),
  backgroundUrls: z.array(z.string()).optional(),
  captionStyle: z.nativeEnum(CaptionStyle).default(CaptionStyle.Default)
})

export type AIVideoProps = z.infer<typeof AIVideoSchema>

export const VideoSchema = z.union([
  SplitScreenVideoSchema,
  RedditVideoSchema,
  TwitterVideoSchema,
  ClipsVideoSchema,
  TextMessageVideoSchema,
  AIVideoSchema
])

export const TemplateSchema = z.enum([
  'SplitScreen',
  'Reddit',
  'Twitter',
  'Clips',
  'TextMessage',
  'AIVideo'
])
export type TemplateProps = z.infer<typeof TemplateSchema>

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
  captionStyle: CaptionStyle.Default,
  isVoiceoverGenerated: true
}

export const defaultTwitterProps: TwitterVideoProps = {
  durationInFrames: 7780,
  backgroundTheme: BackgroundTheme.Minecraft,
  backgroundUrls: selectRandomBackgroundWindow(allMinecraftBackgrounds),
  voiceoverUrl: 'https://assets.clip.studio/twitter_voiceover_sample_2.mp3',
  language: Language.English,
  voiceVolume: 70,
  musicVolume: 30,
  aspectRatio: AspectRatio.Vertical,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  captionStyle: CaptionStyle.Default,
  tweets: [
    {
      id: '1848975277570797673',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        'I was very surprised when my husband talked about how he was disciplined as a child when we met. He\'d describe a punishment that sounds like what would be done to criminals and then say something like "my dad did that to me at 11 when I wet the bed".',
      image: '',
      verified: false,
      likes: 190447,
      comments: 791,
      duration: 12.214,
      from: 0
    },
    {
      id: '1848975294201278847',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "One time he mentioned how his mom tied up his 12 years old sisters and put hot pepper in her V because she brought a male classmate to the house to study. I explained to him that was abuse, I didn't go through that and I turned out fine.",
      image: '',
      verified: false,
      likes: 29458,
      comments: 66,
      duration: 12.168,
      from: 12.214
    },
    {
      id: '1848975305647464693',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        'We agreed then not to raise our kids like that when we had them. I usually take the kids to visit their grandparents, both my parents and my MIL. I stay over with them whenever I visit so there has never been any issue. Last week was my wedding anniversary and me and my husband',
      image: '',
      verified: false,
      likes: 16838,
      comments: 8,
      duration: 15.65,
      from: 24.381999999999998
    },
    {
      id: '1848975310689112483',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "decided to take a trip to a resort, just the two of us to celebrate.\nMy parents and siblings all lived in another state and I was contemplating having my friends over to watch the kids. When my MIL heard, she asked why I would want a stranger watch her grandkids when she's alive.",
      image: '',
      verified: false,
      likes: 12976,
      comments: 6,
      duration: 15.046,
      from: 40.032
    },
    {
      id: '1848975316561125549',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "I was skeptical at first but my husband convinced me to allow her. She came a day before we left and promised to take good care of them. I've raised my kids to be well mannered so I wasn't expecting any issue to arise. We returned home 5 days later and when we got inside,",
      image: '',
      verified: false,
      likes: 12165,
      comments: 15,
      duration: 16.207,
      from: 55.077999999999996
    },
    {
      id: '1848975324190593049',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "the kids weren't in the living room. It was around 6 in the evening and their grand mum told us they are asleep. My kids come home from school by 3:30pm, bath, eat, take a 30mins nap, do their homework and watch tv till 9pm. My last born will watch cartoon until I force her to go",
      image: '',
      verified: false,
      likes: 12381,
      comments: 2,
      duration: 18.483,
      from: 71.285
    },
    {
      id: '1848975329609539655',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "to bed. It was strange seeing an empty sitting room. Mama convinced me that they were willingly in bed but my maternal instincts said otherwise.\nAs I opened their bedroom door, I heard a gasp and then silence. I went to my baby's bed and I saw her shutting her eyes tight,",
      image: '',
      verified: false,
      likes: 12674,
      comments: 3,
      duration: 15.789,
      from: 89.768
    },
    {
      id: '1848975334646898977',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        'she looked fearful and flinched when I touched her.I asked her "What\'s wrong?" She jumped on my body and screamed mummy as soon as she heard my voice and started crying. My son joined her too and I was confused as to they were crying and thought about where their elder sister was',
      image: '',
      verified: false,
      likes: 14552,
      comments: 2,
      duration: 14.953,
      from: 105.557
    },
    {
      id: '1848975339612995987',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        'I initially thought they had missed me but the tears was too much for that. Their grandma came into the room with my husband. When my son saw her, he ran to his bed and mama started screaming at the one on my body to go to bed. My baby cried harder saying',
      image: '',
      verified: false,
      likes: 12634,
      comments: 1,
      duration: 14.49,
      from: 120.51
    },
    {
      id: '1848975345266868671',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        '"Mummy, don\'t let her beat me". She filled me in on how grandma has been beating them and said "Mummy, if you see my sister". I didn\'t allow her finish before I quickly went to her bed.\nI ripped the covers off her and she was shivering and running temperature.',
      image: '',
      verified: false,
      likes: 13406,
      comments: 1,
      duration: 15.696,
      from: 135
    },
    {
      id: '1848975350614622600',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "Her menstrual flow started two days ago and it came when we were away. She had forgotten to dispose one of her used pad and left it in a black nylon in their bathroom. Mama discovered and called her attention to it. She apologized and went to thrash it but the apology wasn't",
      image: '',
      verified: false,
      likes: 12369,
      comments: 1,
      duration: 15.557,
      from: 150.696
    },
    {
      id: '1848975355819778109',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        'enough for MIL. She beat her and further asked her to go outside to the compound to kneel down. She was there under sun all day till late in the evening. The next day, she had been unable to get off bed and the younger ones went to inform grandma. She said she was faking it, she',
      image: '',
      verified: false,
      likes: 12338,
      comments: 4,
      duration: 16.161,
      from: 166.253
    },
    {
      id: '1848975360907444541',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "still forced her to do chores without giving her any drug for the fever. She told her that was how her father was raised and he didn't die so she would be fine. I was livid upon hearing all of these. My husband saw the state she was and rushed her to the car. I took the other two",
      image: '',
      verified: false,
      likes: 12024,
      comments: 4,
      duration: 16.486,
      from: 182.414
    },
    {
      id: '1848975366175490418',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "to follow him and MIL tried to stop me that it wasn't a big deal. I pushed her off me but she wouldn't stop so kicked her out of anger. We took my daughter to the hospital and stayed that night. We got back the next day and mama had left. She called her son crying the next day",
      image: '',
      verified: false,
      likes: 11535,
      comments: 1,
      duration: 15.65,
      from: 198.89999999999998
    },
    {
      id: '1848975371380678678',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "that I beat her up last night cos she was trying to calm me down.\nI took the phone and called her liar and that the only reason I didn't involve the police was because she's my MIL and that nothing must happen to my child. Not up to an hour my husband ended the call,",
      image: '',
      verified: false,
      likes: 11582,
      comments: 18,
      duration: 14.21,
      from: 214.54999999999998
    },
    {
      id: '1848975376812302833',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "his sister called and said I was proud and that is why I feel my kids are above correction. I told her that was the reason she was unable to conceive as God was trying to save the kids from her. My husband has blocked her and mama. He said said he'd realized how toxic his family",
      image: '',
      verified: false,
      likes: 15767,
      comments: 19,
      duration: 15.511,
      from: 228.76
    },
    {
      id: '1848975381987995655',
      username: 'Remzsx',
      avatar:
        'https://pbs.twimg.com/profile_images/1789648358107136000/4jWTp2LI_normal.jpg',
      content:
        "was because despite that mama almost have our daughter ki||ed, she still supported her. He doesn't want us exposed to that. We are trying to decide if we should go non contact with them but won't that be going too far? Kindly advice.",
      image: '',
      verified: false,
      likes: 17006,
      comments: 667,
      duration: 15.093,
      from: 244.271
    }
  ],
  voiceSettings: [],
  isVoiceoverGenerated: true,
  voiceSpeed: 1
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
  voiceoverUrl: 'https://assets.clip.studio/messages_voiceover_sample.mp3',
  isVoiceoverGenerated: true
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
  voiceoverUrl: 'https://assets.clip.studio/aivideo_voiceover.mp3',
  voiceoverFrames: aiVoiceoverFrames,
  voiceId: 'EXAVITQu4vr4xnSDxMaL',
  storyLength: 'short',
  range: '1-2',
  segments: '6-7',
  visualStyle: VisualStyle.Realistic,
  videoStructure: [
    {
      text: 'In the heart of ancient Rome, a young Julius Caesar gazes at the bustling Forum, dreaming of greatness. His ambition burns bright, igniting a fire within him to change the world.',
      imageDescription:
        'A young Julius Caesar stands in the Roman Forum, surrounded by citizens and merchants, his eyes filled with determination and ambition, set against the backdrop of ancient Roman architecture.',
      duration: 13.113052631578947,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_1.png'
    },
    {
      text: 'As he rises through the ranks, Julius Caesar forms a powerful alliance with Pompey and Crassus, known as the First Triumvirate. Together, they reshape the political landscape of Rome.',
      imageDescription:
        'Julius Caesar, Pompey, and Crassus stand together in a dimly lit room, discussing strategies, their expressions serious, symbolizing the power dynamics of the First Triumvirate.',
      duration: 13.442526315789474,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_2.png'
    },
    {
      text: "With military genius, Caesar conquers Gaul, expanding Rome's territory and earning the loyalty of his soldiers. His fame grows, but so does the envy of his rivals.",
      imageDescription:
        'Julius Caesar leads his troops into battle against the Gauls, a fierce expression on his face, as Roman soldiers rally behind him, banners waving in the wind.',
      duration: 12.124631578947362,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_3.png'
    },
    {
      text: 'Returning to Rome, Caesar is greeted as a hero, but whispers of betrayal echo in the Senate. His popularity threatens the power of the Senate, igniting fear among the elite.',
      imageDescription:
        'A jubilant crowd welcomes Julius Caesar back to Rome, while shadowy figures in the Senate plot against him, their faces twisted with jealousy and fear.',
      duration: 12.783578947368426,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_4.png'
    },
    {
      text: "Despite warnings, Caesar crosses the Rubicon River, declaring, 'The die is cast!' This bold move ignites a civil war, pitting him against Pompey and the Senate.",
      imageDescription:
        'Julius Caesar stands at the banks of the Rubicon River, resolute and defiant, as he prepares to lead his army into a civil war, the river symbolizing a point of no return.',
      duration: 11.926947368421054,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_5.png'
    },
    {
      text: 'The war rages on, and Caesar emerges victorious, becoming dictator for life. His reforms bring hope to the people, but his power grows increasingly absolute.',
      imageDescription:
        'Julius Caesar addresses a crowd in the Roman Forum, gesturing passionately as citizens cheer, while senators watch with concern, foreshadowing his growing tyranny.',
      duration: 11.729263157894742,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_6.png'
    },
    {
      text: "Yet, with great power comes great danger. A conspiracy brews among the Senate, led by Brutus and Cassius, who fear for the Republic's future.",
      imageDescription:
        'Brutus and Cassius huddle in a dark corner of the Senate, plotting against Julius Caesar, their faces tense with determination and fear for the Republic.',
      duration: 10.674947368421044,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_7.png'
    },
    {
      text: 'On the Ides of March, Caesar arrives at the Senate, unaware of the impending betrayal. His friend Brutus stands among the conspirators, torn between loyalty and duty.',
      imageDescription:
        'Julius Caesar enters the Senate, a confident smile on his face, while Brutus watches from the shadows, his expression conflicted, symbolizing the tension of betrayal.',
      duration: 12.322315789473691,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_8.png'
    },
    {
      text: "As the conspirators strike, Caesar utters his famous last words, 'Et tu, Brute?' His shock reverberates through history, marking the end of an era.",
      imageDescription:
        'Julius Caesar, surrounded by senators, falls to the ground, a look of betrayal on his face, as Brutus stands over him, a dagger in hand, capturing the moment of treachery.',
      duration: 11.070315789473668,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_9.png'
    },
    {
      text: "Caesar's assassination plunges Rome into chaos. The Republic crumbles, and civil war erupts once more, as his legacy looms large over the empire.",
      imageDescription:
        "A chaotic scene unfolds in Rome as citizens riot and soldiers clash, the aftermath of Julius Caesar's assassination, symbolizing the turmoil of a fallen Republic.",
      duration: 10.938526315789474,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_10.png'
    },
    {
      text: "In the wake of his death, Caesar's adopted heir, Octavian, rises to power, vowing to restore order and avenge his fallen mentor, setting the stage for a new empire.",
      imageDescription:
        'Octavian stands resolute in front of a statue of Julius Caesar, determination in his eyes, as he prepares to lead Rome into a new era, symbolizing hope and vengeance.',
      duration: 12.190526315789498,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_11.png'
    },
    {
      text: "The rise of the Roman Empire begins, but the shadow of Julius Caesar's ambition and tragedy remains, a reminder of the fine line between power and downfall.",
      imageDescription:
        "A panoramic view of the Roman Empire at its height, with a statue of Julius Caesar in the foreground, symbolizing his lasting impact on history and the empire's legacy.",
      duration: 11.66336842105261,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_12.png'
    },
    {
      text: "Julius Caesar's story teaches us that ambition can lead to greatness, but unchecked power can also lead to ruin. His legacy continues to inspire and caution leaders today.",
      imageDescription:
        'A modern-day leader stands before a statue of Julius Caesar, reflecting on the lessons of ambition and power, symbolizing the timeless relevance of his story.',
      duration: 11.268,
      imageUrl: 'https://assets.clip.studio/aivideo_default_image_13.png'
    }
  ]
}

const initialState = {
  selectedTemplate: 'Reddit' as TemplateProps,
  splitScreenState: defaultSplitScreenProps,
  redditState: defaultRedditProps,
  twitterState: defaultTwitterProps,
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
  twitterState: TwitterVideoProps
  setTwitterState: (state: Partial<TwitterVideoProps>) => void
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
    setTwitterState: (state) =>
      set((prevState) => ({
        twitterState: { ...prevState.twitterState, ...state }
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
        twitterState: { ...state.twitterState, durationInFrames: length },
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
        twitterState: { ...state.twitterState, backgroundTheme: theme },
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
        twitterState: { ...state.twitterState, backgroundUrls: urls },
        clipsState: { ...state.clipsState, backgroundUrls: urls },
        textMessageState: { ...state.textMessageState, backgroundUrls: urls },
        aiVideoState: { ...state.aiVideoState, backgroundUrls: urls }
      })),
    setCaptionStyle: (style) =>
      set((state) => ({
        captionStyle: style,
        splitScreenState: { ...state.splitScreenState, captionStyle: style },
        redditState: { ...state.redditState, captionStyle: style },
        twitterState: { ...state.twitterState, captionStyle: style },
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
