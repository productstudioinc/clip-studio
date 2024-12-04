import React from 'react'
import { makeTransform, scale, translateY } from '@remotion/animation-utils'
import { loadFont as loadMontserratFont } from '@remotion/google-fonts/Montserrat'
import { loadFont as loadPermanentMarkerFont } from '@remotion/google-fonts/PermanentMarker'
import { loadFont as loadRobotoFont } from '@remotion/google-fonts/Roboto'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { CaptionStyle } from '../../stores/templatestore'

import './font.css'

const robotoFont = loadRobotoFont('normal', {
  weights: ['700']
})

const permanentMarkerFont = loadPermanentMarkerFont()

const montserratFont = loadMontserratFont('normal', {
  weights: ['800']
})

const komikaFontFamily = 'Komika Axis'

export const Word: React.FC<{
  enterProgress: number
  text: string
  stroke?: boolean
  captionStyle: CaptionStyle
}> = ({ enterProgress, text, stroke = false, captionStyle }) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()
  const desiredFontSize = 52

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

  const getStyleProperties = (style: CaptionStyle) => {
    switch (style) {
      case CaptionStyle.Comic:
        return {
          fontFamily: komikaFontFamily,
          color: 'yellow',
          textTransform: 'uppercase' as const
        }
      case CaptionStyle.Default:
        return {
          fontFamily: montserratFont.fontFamily,
          color: 'white',
          textTransform: 'uppercase' as const
        }
      default:
        return {
          fontFamily: montserratFont.fontFamily,
          color: 'white',
          textTransform: 'uppercase' as const
        }
    }
  }

  const styleProperties = getStyleProperties(captionStyle)

  return (
    <span className="relative w-full flex justify-center items-center">
      <span
        style={{
          position: 'absolute',
          width: '100%',
          fontSize: desiredFontSize,
          color: styleProperties.color,
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
          fontFamily: styleProperties.fontFamily,
          textTransform: styleProperties.textTransform,
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: '1em'
        }}
      >
        {text}
      </span>
    </span>
  )
}
