import React from "react";
import { Composition } from "remotion";
import {
  TemplateSchema,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  useTemplateStore,
} from "../stores/templatestore";
import { SplitScreenComposition } from "./SplitScreen/Composition";
import { RedditComposition } from "./Reddit/Composition";
import { TwitterThreadComposition } from "./TwitterThread/Composition";
import { getVideoMetadata } from "@remotion/media-utils";
import { z } from "zod";

type CompositionConfig = {
  [K in z.infer<typeof TemplateSchema>]: {
    component: React.ComponentType<any>;
    calculateMetadata?: (props: any) => Promise<{ durationInFrames: number }>;
  };
};

const compositionConfig: CompositionConfig = {
  SplitScreen: {
    component: SplitScreenComposition,
    calculateMetadata: async ({ props }) => {
      const data = await getVideoMetadata(props.videoUrl);
      return { durationInFrames: Math.floor(data.durationInSeconds * 30) };
    },
  },
  Reddit: {
    component: RedditComposition,
    calculateMetadata: async ({ props }) => ({
      durationInFrames: props.durationInFrames,
    }),
  },
  TwitterThread: {
    component: TwitterThreadComposition,
  },
};

export const RemotionRoot: React.FC = () => {
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

  const getTemplateState = () => {
    switch (selectedTemplate) {
      case "SplitScreen":
        return splitScreenState;
      case "Reddit":
        return redditState;
      case "TwitterThread":
        return twitterThreadState;
    }
  };

  const templateState = getTemplateState();
  const { component, calculateMetadata } = compositionConfig[selectedTemplate];

  return (
    <Composition
      id={selectedTemplate}
      component={component}
      durationInFrames={templateState.durationInFrames}
      fps={VIDEO_FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
      defaultProps={templateState}
      calculateMetadata={calculateMetadata}
    />
  );
};
