import { z } from "zod";
import { create } from "zustand";
import { alignmentDefault } from "./alignmenttext";
import { splitScreenTranscriptionDefault } from "./splitscreentranscription";

const SharedProps = z.object({
  durationInFrames: z.number(),
  backgroundUrl: z.string(),
});

const VoiceoverFrames = z.object({
  characters: z.array(z.string()),
  character_start_times_seconds: z.array(z.number()),
  character_end_times_seconds: z.array(z.number()),
});

export const Transcription = z.object({
  text: z.string(),
  chunks: z.array(
    z.object({
      timestamp: z.array(z.number()),
      text: z.string(),
    })
  ),
});

export const TranscriptionResponse = z.array(Transcription, z.string());

export const SplitScreenProps = z
  .object({
    videoUrl: z.string(),
    type: z.enum(["blob", "cloud"]),
    transcriptionId: z.string(),
    transcription: Transcription,
  })
  .merge(SharedProps);

export const RedditProps = z
  .object({
    title: z.string(),
    text: z.string(),
    subreddit: z.string(),
    voiceoverUrl: z.string(),
    voiceoverFrames: VoiceoverFrames,
    titleEnd: z.number(),
  })
  .merge(SharedProps);

export const TwitterThreadProps = z
  .object({
    tweetIds: z.array(z.string()),
  })
  .merge(SharedProps);

export const CompositionProps = z.union([
  SplitScreenProps,
  RedditProps,
  TwitterThreadProps,
]);

export const defaultMyCompProps: z.infer<typeof SplitScreenProps> = {
  videoUrl:
    "https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/transcribe_test.mp4",
  type: "cloud",
  durationInFrames: 3643,
  backgroundUrl: "https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/mc.mp4",
  transcriptionId: "",
  transcription: splitScreenTranscriptionDefault,
};

export const defaultRedditProps: z.infer<typeof RedditProps> = {
  title:
    "AITA for telling my brother's wife we can't all have rich parents like her and her siblings?",
  text: "My brother Nicky (25m) is married to Liza (24f). They were at my parents house on Sunday for dinner and Liza really annoyed the crap out of me, something that isn't new, and I said something in anger and I might be TA for it maybe.\r\n\r\nSo Liza has a wealthy family. They paid for her and her siblings college expenses 100%. They paid for Nicky and Liza's house. They paid for their wedding. They're paying for one of their sons weddings this summer. They can afford all that. Liza has always been very... open, if trying to give her the benefit of the doubt, about it. She never hid the fact she came from money and was never shy about saying her parents pay for so much for her and her siblings.\r\n\r\nLiza doesn't understand that we're not all that lucky. I'm 19f, work full time and I still live with my parents. We couldn't afford college. I didn't get the grades for a scholarship. Struggled enough through school that getting into massive debt for college when I could end up flunking seemed like a bad move for me. So I focus on working and I applied for a couple of training programs close to my parents house so I could try and do better without risking debt for nothing.\r\n\r\nLiza looks down on me so hard for living with my parents still and for not going to college. Sunday she talked about how all her siblings attended college, how three of them are still in college, living there and doing just fine. How they'll be able to buy houses right out of college. How even she and my brother could do it. My parents said politely that not everyone can do all that. But then she talked about being 19 and not in college or living on my own and how I should really try so much harder. I snapped at that moment and I told her we can't all have rich parents who can afford to pay our ways through college, for our weddings and for our houses. I told her my parents didn't have that kind of money and neither did I, so we were doing our best in this shitty fucking economy.\r\n\r\nLiza told me I'm just lazy and making excuses and she stormed out. Nicky left a while after and he was pretty quiet. Liza used his phone to send me 30 texts three days later demanding I apologize and tearing me a new one for not doing it without being told and I know it was her because she texts in a very specific way.\r\n\r\nAITA?",
  subreddit: "AmITheAsshole",
  durationInFrames: Math.floor(30 * 131.655),
  backgroundUrl: "https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/mc.mp4",
  voiceoverUrl:
    "https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/reddit_sample_audio.mp3",
  voiceoverFrames: alignmentDefault,
  titleEnd: 5.596,
};

export const defaultTwitterThreadProps: z.infer<typeof TwitterThreadProps> = {
  tweetIds: ["1803609101110550977"],
  durationInFrames: 900,
  backgroundUrl: "https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/mc.mp4",
};

export const VIDEO_WIDTH = 720;
export const VIDEO_HEIGHT = 1280;
export const VIDEO_FPS = 30;

const TemplateSchema = z.enum(["SplitScreen", "Reddit", "TwitterThread"]);

type State = {
  selectedTemplate: z.infer<typeof TemplateSchema>;
  setSelectedTemplate: (template: z.infer<typeof TemplateSchema>) => void;
  splitScreenState: z.infer<typeof SplitScreenProps>;
  setSplitScreenState: (
    state: Partial<z.infer<typeof SplitScreenProps>>
  ) => void;
  redditState: z.infer<typeof RedditProps>;
  setRedditState: (state: Partial<z.infer<typeof RedditProps>>) => void;
  twitterThreadState: z.infer<typeof TwitterThreadProps>;
  setTwitterThreadState: (
    state: Partial<z.infer<typeof TwitterThreadProps>>
  ) => void;
  durationInFrames: number;
  setdurationInFrames: (length: number) => void;
  backgroundUrl: string;
  setBackgroundUrl: (url: string) => void;
};

export const useTemplateStore = create<State>((set) => ({
  selectedTemplate: "SplitScreen",
  setSelectedTemplate: (template) => {
    TemplateSchema.parse(template);
    set({ selectedTemplate: template });
  },
  splitScreenState: defaultMyCompProps,
  setSplitScreenState: (state) =>
    set((prevState) => ({
      splitScreenState: { ...prevState.splitScreenState, ...state },
    })),
  redditState: defaultRedditProps,
  setRedditState: (state) =>
    set((prevState) => ({
      redditState: { ...prevState.redditState, ...state },
    })),
  twitterThreadState: defaultTwitterThreadProps,
  setTwitterThreadState: (state) =>
    set((prevState) => ({
      twitterThreadState: { ...prevState.twitterThreadState, ...state },
    })),
  durationInFrames: 900,
  setdurationInFrames: (length) =>
    set((state) => ({
      durationInFrames: length,
      splitScreenState: { ...state.splitScreenState, durationInFrames: length },
      redditState: { ...state.redditState, durationInFrames: length },
      twitterThreadState: {
        ...state.twitterThreadState,
        durationInFrames: length,
      },
    })),
  backgroundUrl: "https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/mc.mp4",
  setBackgroundUrl: (url) =>
    set((state) => ({
      backgroundUrl: url,
      splitScreenState: { ...state.splitScreenState, backgroundUrl: url },
      redditState: { ...state.redditState, backgroundUrl: url },
      twitterThreadState: { ...state.twitterThreadState, backgroundUrl: url },
    })),
}));
