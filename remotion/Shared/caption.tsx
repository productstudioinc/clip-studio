import { Caption, createTikTokStyleCaptions } from '@remotion/captions'
import {
  Easing,
  interpolate,
  random,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion'
import { z } from 'zod'

import '../Shared/font.css'

import { captionStyleSchema } from '../../stores/templatestore'

interface CaptionComponentProps {
  captions: Caption[]
  styles?: React.CSSProperties
  options?: z.infer<typeof captionStyleSchema>['options']
  playbackRate?: number
}

export const CaptionComponent: React.FC<CaptionComponentProps> = ({
  captions,
  styles,
  options,
  playbackRate = 1
}) => {
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 800
  })

  const currentFrame = useCurrentFrame()
  const { width, fps } = useVideoConfig()

  return (
    <>
      {pages.map((page, index) => {
        const startMs =
          index === 0
            ? page.startMs
            : pages[0].startMs +
              (page.startMs - pages[0].startMs) * playbackRate

        const endMs =
          index === 0
            ? page.tokens[page.tokens.length - 1].toMs
            : pages[0].startMs +
              (page.tokens[page.tokens.length - 1].toMs - pages[0].startMs) *
                playbackRate

        const startFrame = Math.round((startMs / 1000) * fps)
        const endFrame = Math.round((endMs / 1000) * fps)
        const duration = Math.max(endFrame - startFrame, 1)
        const scale = options?.scale
          ? spring({
              fps,
              frame: currentFrame - startFrame,
              config: {
                damping: 15,
                stiffness: 300,
                mass: 0.4
              }
            })
          : 1

        const randomRotation = options?.rotation ? random(index) * 6 - 3 : 0

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 right-0 text-center text-white"
              style={{
                ...styles,
                transform: `scale(${scale}) rotate(${randomRotation}deg)`,
                textShadow:
                  styles?.textShadow ||
                  `
                  -3px -3px 0 #000,  
                   3px -3px 0 #000,
                  -3px  3px 0 #000,
                   3px  3px 0 #000,
                  -3px  0   0 #000,
                   3px  0   0 #000,
                   0   -3px 0 #000,
                   0    3px 0 #000,
                   4px 4px 0px #555,
                   5px 5px 0px #444,
                   6px 6px 0px #333,
                   7px 7px 8px rgba(0,0,0,0.4)
                `,
                maxWidth: '90%',
                margin: '0 auto',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                fontSize: '3.5em'
              }}
            >
              {page.tokens.map((token, tokenIndex) => {
                const tokenStartFrame = Math.round(
                  ((token.fromMs / 1000) * fps) / playbackRate
                )
                const tokenEndFrame = Math.round(
                  ((token.toMs / 1000) * fps) / playbackRate
                )
                const adjustedEndFrame = Math.max(
                  tokenEndFrame,
                  tokenStartFrame + 2
                )
                const isHighlighted =
                  currentFrame >= tokenStartFrame &&
                  currentFrame < adjustedEndFrame

                const progress = interpolate(
                  currentFrame,
                  [tokenStartFrame, adjustedEndFrame - 1],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                  }
                )

                const backgroundScale = interpolate(
                  progress,
                  [0, 1],
                  [1, 1.2],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: Easing.out(Easing.exp)
                  }
                )

                return (
                  <span
                    key={tokenIndex}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      color:
                        isHighlighted && options?.highlighted.word
                          ? options.highlighted.wordColor
                          : options?.textColor || 'white',
                      marginRight: '-0.3em'
                    }}
                  >
                    {isHighlighted && options?.highlighted.boxed && (
                      <span
                        style={{
                          position: 'absolute',
                          inset: '8px',
                          backgroundColor:
                            options.highlighted.boxColor || '#32CD32',
                          borderRadius:
                            options.highlighted.boxBorderRadius || '10px',
                          zIndex: -1,
                          display: 'block',
                          padding: 0,
                          transformOrigin: 'center center',
                          transform: `scale(${backgroundScale})`
                        }}
                      />
                    )}
                    {token.text}{' '}
                  </span>
                )
              })}
            </div>
          </Sequence>
        )
      })}
    </>
  )
}
