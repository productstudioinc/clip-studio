import React from 'react'
// you cant use alias imports here for some reason
import { getVideoMetadata } from '@remotion/media-utils'
import { Composition } from 'remotion'

import {
  AIImagesSchema,
  ClipsVideoSchema,
  HopeCoreVideoSchema,
  RedditVideoSchema,
  SplitScreenVideoSchema,
  TextMessageVideoSchema,
  TwitterVideoSchema,
  useTemplateStore,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH
} from '../stores/templatestore'
import { AIImagesComposition } from './AIImages/Composition'
import { ClipsComposition } from './Clips/Composition'
import { EditorComposition } from './Editor/Composition'
import { HopeCoreComposition } from './HopeCore/Composition'
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
    aiImagesState,
    hopeCoreState
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterState: state.twitterState,
    clipsState: state.clipsState,
    textMessageState: state.textMessageState,
    aiImagesState: state.aiImagesState,
    hopeCoreState: state.hopeCoreState
  }))

  return (
    <>
      <Composition
        id="Editor"
        component={EditorComposition}
        defaultProps={{
          tracks: [],
          captions: [],
          captionStyles: {},
          selectedItem: null,
          setSelectedItem: () => {},
          changeItem: () => {}
        }}
        durationInFrames={1000}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      <Composition
        id="HopeCore"
        component={HopeCoreComposition}
        durationInFrames={hopeCoreState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={HopeCoreVideoSchema}
        defaultProps={hopeCoreState as any}
      />

      <Composition
        id="AIImages"
        component={AIImagesComposition}
        durationInFrames={aiImagesState.durationInFrames}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        schema={AIImagesSchema}
        defaultProps={aiImagesState as any}
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
