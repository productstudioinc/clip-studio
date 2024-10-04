import React from 'react'
import { makeTransform, scale, translateY } from '@remotion/animation-utils'
import { loadFont as loadMontserratFont } from '@remotion/google-fonts/Montserrat'
import { fitText } from '@remotion/layout-utils'
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion'

import { CaptionStyle } from '../../stores/templatestore'

import './font.css'

const montserratFont = loadMontserratFont('normal', {
  weights: ['700']
})

const komikaFontFamily = 'Komika Axis'

export const Word: React.FC<{
  enterProgress: number
  text: string
  stroke: boolean
  captionStyle: CaptionStyle
}> = ({ enterProgress, text, stroke, captionStyle }) => {
  const { width, fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const desiredFontSize = 64

  const fontFamily =
    captionStyle === CaptionStyle.KomikaAxis
      ? komikaFontFamily
      : montserratFont.fontFamily

  const splitText = (text: string, maxWordsPerLine: number) => {
    const words = text.split(' ')
    const lines = []
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      lines.push(words.slice(i, i + maxWordsPerLine).join(' '))
    }
    return lines
  }

  const textLines = splitText(text, 5)

  const fontSizes = textLines.map(
    (line) =>
      fitText({
        fontFamily,
        text: line,
        withinWidth: width * 0.7
      }).fontSize
  )

  const minFontSize = Math.min(desiredFontSize, ...fontSizes)

  const growAnimation = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5
    },
    durationInFrames: 5
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        top: undefined,
        bottom: 350,
        height: 150,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {textLines.map((line, index) => (
        <div
          key={index}
          style={{
            fontSize: minFontSize,
            color:
              captionStyle === CaptionStyle.KomikaAxis ? 'yellow' : 'white',
            WebkitTextStroke: stroke ? '10px black' : undefined,
            transform: makeTransform([
              scale(
                interpolate(enterProgress * growAnimation, [0, 1], [0.95, 1])
              ),
              translateY(interpolate(enterProgress, [0, 1], [20, 0]))
            ]),
            opacity: interpolate(enterProgress, [0, 0.3], [1, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            }),
            fontFamily,
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 10
          }}
        >
          {line}
        </div>
      ))}
    </AbsoluteFill>
  )
}
