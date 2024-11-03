import React from 'react'
// you cant use alias imports here for some reason
import { getVideoMetadata } from '@remotion/media-utils'
import { Composition } from 'remotion'

import {
  AIVideoSchema,
  ClipsVideoSchema,
  RedditVideoSchema,
  SplitScreenVideoSchema,
  TextMessageVideoSchema,
  TwitterVideoSchema,
  useTemplateStore,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH
} from '../stores/templatestore'
import { AIVideoComposition } from './AIVideo/Composition'
import { ClipsComposition } from './Clips/Composition'
import { RedditComposition } from './Reddit/Composition'
import { SplitScreenComposition } from './SplitScreen/Composition'
import { TextMessageComposition } from './TextMessage/Composition'
import { TwitterComposition } from './TwitterThread/Composition'

export const RemotionRoot: React.FC = () => {
  const {
    splitScreenState,
    redditState,
    twitterState,
    clipsState,
    textMessageState,
    aiVideoState
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterState: state.twitterState,
    clipsState: state.clipsState,
    textMessageState: state.textMessageState,
    aiVideoState: state.aiVideoState
  }))

  return (
    <>
      <Composition
        id="AIVideo"
        component={AIVideoComposition}
        durationInFrames={aiVideoState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={AIVideoSchema}
        defaultProps={aiVideoState as any}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames
          }
        }}
      />

      <Composition
        id="TextMessage"
        component={TextMessageComposition}
        durationInFrames={textMessageState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={TextMessageVideoSchema}
        defaultProps={textMessageState as any}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames
          }
        }}
      />
      <Composition
        id="SplitScreen"
        component={SplitScreenComposition}
        durationInFrames={splitScreenState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={SplitScreenVideoSchema}
        defaultProps={splitScreenState as any}
        calculateMetadata={async ({ props }) => {
          const data = await getVideoMetadata(props.videoUrl)
          return {
            durationInFrames: Math.floor(data.durationInSeconds * 30)
          }
        }}
      />
      <Composition
        id="Reddit"
        component={RedditComposition}
        durationInFrames={redditState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={RedditVideoSchema}
        defaultProps={redditState as any}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames
          }
        }}
      />
      <Composition
        id="Twitter"
        component={TwitterComposition}
        durationInFrames={twitterState.durationInFrames}
        schema={TwitterVideoSchema}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={twitterState as any}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames
          }
        }}
      />
      <Composition
        id="Clips"
        component={ClipsComposition}
        durationInFrames={clipsState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={ClipsVideoSchema}
        defaultProps={clipsState as any}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: props.durationInFrames
          }
        }}
      />
    </>
  )
}
