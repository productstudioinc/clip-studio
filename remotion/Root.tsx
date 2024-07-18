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

// super ugly code but i couldnt figure out how to do it a cleaner way

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

  const defaultProps =
    selectedTemplate === "SplitScreen"
      ? splitScreenState
      : selectedTemplate === "Reddit"
      ? redditState
      : twitterThreadState;

  const videoDuration =
    selectedTemplate === "SplitScreen"
      ? splitScreenState.durationInFrames
      : selectedTemplate === "Reddit"
      ? redditState.durationInFrames
      : twitterThreadState.durationInFrames;

  return (
    <>
      <div
        style={{
          display: selectedTemplate === "SplitScreen" ? "block" : "none",
        }}
      >
        <Composition
          id="SplitScreen"
          component={SplitScreenComposition}
          durationInFrames={videoDuration}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultProps as any}
          calculateMetadata={async ({ props }) => {
            const data = await getVideoMetadata(props.videoUrl);
            return {
              durationInFrames: Math.floor(data.durationInSeconds * 30),
            };
          }}
        />
      </div>
      <div
        style={{ display: selectedTemplate === "Reddit" ? "block" : "none" }}
      >
        <Composition
          id="Reddit"
          component={RedditComposition}
          durationInFrames={videoDuration}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultProps as any}
          calculateMetadata={async ({ props }) => {
            return {
              durationInFrames: props.durationInFrames,
            };
          }}
        />
      </div>
      <div
        style={{
          display: selectedTemplate === "TwitterThread" ? "block" : "none",
        }}
      >
        <Composition
          id="TwitterThread"
          component={TwitterThreadComposition}
          durationInFrames={videoDuration}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          defaultProps={defaultProps as any}
        />
      </div>
    </>
  );
};
