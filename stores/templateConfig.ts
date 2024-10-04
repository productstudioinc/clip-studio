import { ClipsComposition } from '../remotion/Clips/Composition'
import { RedditComposition } from '../remotion/Reddit/Composition'
import { SplitScreenComposition } from '../remotion/SplitScreen/Composition'
import { TwitterThreadComposition } from '../remotion/TwitterThread/Composition'
import { useTemplateStore } from './templatestore'

const useTemplateConfig = () => {
  const {
    selectedTemplate,
    splitScreenState,
    redditState,
    twitterThreadState,
    clipsState
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterThreadState: state.twitterThreadState,
    clipsState: state.clipsState
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
    TwitterThread: {
      component: TwitterThreadComposition,
      state: twitterThreadState,
      durationInFrames: twitterThreadState.durationInFrames
    },
    Clips: {
      component: ClipsComposition,
      state: clipsState,
      durationInFrames: clipsState.durationInFrames
    }
  }

  return templateConfig[selectedTemplate]
}

export default useTemplateConfig
