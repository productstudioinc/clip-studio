import { AIVideoComposition } from '@/remotion/AIVideo/Composition'
import { AIImagesComposition } from '../remotion/AIImages/Composition'
import { ClipsComposition } from '../remotion/Clips/Composition'
import { HopeCoreComposition } from '../remotion/HopeCore/Composition'
import { RedditComposition } from '../remotion/Reddit/Composition'
import { SplitScreenComposition } from '../remotion/SplitScreen/Composition'
import { TextMessageComposition } from '../remotion/TextMessage/Composition'
import { TwitterComposition } from '../remotion/TwitterThread/Composition'
import { useTemplateStore } from './templatestore'

const useTemplateConfig = () => {
  const {
    selectedTemplate,
    splitScreenState,
    redditState,
    twitterState,
    clipsState,
    textMessageState,
    aiImagesState,
    aiVideoState,
    hopeCoreState
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterState: state.twitterState,
    clipsState: state.clipsState,
    textMessageState: state.textMessageState,
    aiImagesState: state.aiImagesState,
    aiVideoState: state.aiVideoState,
    hopeCoreState: state.hopeCoreState
  }))

  const templateConfig = {
    SplitScreen: {
      component: SplitScreenComposition,
      state: splitScreenState,
      durationInFrames: splitScreenState.durationInFrames
    },
    Reddit: {
      component: RedditComposition,
      state: redditState,
      durationInFrames: redditState.durationInFrames
    },
    Twitter: {
      component: TwitterComposition,
      state: twitterState,
      durationInFrames: twitterState.durationInFrames
    },
    Clips: {
      component: ClipsComposition,
      state: clipsState,
      durationInFrames: clipsState.durationInFrames
    },
    TextMessage: {
      component: TextMessageComposition,
      state: textMessageState,
      durationInFrames: textMessageState.durationInFrames
    },
    AIImages: {
      component: AIImagesComposition,
      state: aiImagesState,
      durationInFrames: aiImagesState.durationInFrames
    },
    AIVideo: {
      component: AIVideoComposition,
      state: aiVideoState,
      durationInFrames: aiVideoState.durationInFrames
    },
    HopeCore: {
      component: HopeCoreComposition,
      state: hopeCoreState,
      durationInFrames: hopeCoreState.durationInFrames
    }
  }

  return templateConfig[selectedTemplate]
}

export default useTemplateConfig
