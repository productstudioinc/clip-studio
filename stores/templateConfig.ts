import { RedditComposition } from "../remotion/Reddit/Composition";
import { SplitScreenComposition } from "../remotion/SplitScreen/Composition";
import { TwitterThreadComposition } from "../remotion/TwitterThread/Composition";
import { useTemplateStore } from "./templatestore";

const useTemplateConfig = () => {
  const {
    selectedTemplate,
    splitScreenState,
    redditState,
    twitterThreadState,
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterThreadState: state.twitterThreadState,
  }));

  const templateConfig = {
    SplitScreen: {
      component: SplitScreenComposition,
      state: splitScreenState,
      durationInFrames: splitScreenState.durationInFrames,
    },
    Reddit: {
      component: RedditComposition,
      state: redditState,
      durationInFrames: redditState.durationInFrames,
    },
    TwitterThread: {
      component: TwitterThreadComposition,
      state: twitterThreadState,
      durationInFrames: twitterThreadState.durationInFrames,
    },
  };

  return templateConfig[selectedTemplate];
};

export default useTemplateConfig;
