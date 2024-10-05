import React from 'react'
import { ClipsComposition } from './Clips/Composition'
import { getVideoMetadata } from '@remotion/media-utils'
import { Composition } from 'remotion'

import {
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
import { RedditComposition } from './Reddit/Composition'
import { SplitScreenComposition } from './SplitScreen/Composition'
import { TextMessageComposition } from './TextMessage/Composition'
import { TwitterThreadComposition } from './TwitterThread/Composition'

export const RemotionRoot: React.FC = () => {
  const {
    splitScreenState,
    redditState,
    twitterThreadState,
    clipsState,
    textMessageState
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterThreadState: state.twitterThreadState,
    clipsState: state.clipsState,
    textMessageState: state.textMessageState
  }))

  return (
    <>
      <Composition
        id="TextMessage"
        component={TextMessageComposition}
        durationInFrames={textMessageState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={TextMessageVideoSchema}
        defaultProps={textMessageState as any}
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
        id="TwitterThread"
        component={TwitterThreadComposition}
        durationInFrames={twitterThreadState.durationInFrames}
        schema={TwitterVideoSchema}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={twitterThreadState as any}
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
      />
    </>
  )
}
