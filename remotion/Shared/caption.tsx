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

interface CaptionComponentProps {
  captions: Caption[]
  styles?: React.CSSProperties
  playbackRate?: number
}

export const CaptionComponent: React.FC<CaptionComponentProps> = ({
  captions,
  styles,
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
        const scale = spring({
          fps,
          frame: currentFrame - startFrame,
          config: {
            damping: 15,
            stiffness: 300,
            mass: 0.4
          }
        })

        const randomRotation = random(index) * 6 - 3

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 right-0 text-center text-white"
              style={{
                fontSize: `${width / 12}px`,
                fontWeight: '900',
                lineHeight: 1.1,
                maxWidth: '95%',
                margin: '0 auto',
                wordWrap: 'break-word',
                transform: `scale(${scale}) rotate(${randomRotation}deg)`,
                transformOrigin: 'center center',
                textShadow: `
                  -1px -1px 0 #212121,
                   1px -1px 0 #212121,
                  -1px  1px 0 #212121,
                   1px  1px 0 #212121,
                   2px 2px 0 #212121,
                   3px 3px 0 #212121,
                   4px 4px 0 #212121,
                   5px 5px 0 #212121,
                   6px 6px 0 #212121,
                   7px 7px 0 #212121,
                   8px 8px 0 #212121,
                   9px 9px 0 #212121,
                  10px 10px 0 #212121`,
                letterSpacing: '1px',
                ...styles
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
                      color: isHighlighted ? '#FFD700' : 'white',
                      transition: 'color 0.1s ease-in-out',
                      marginRight: '0.2em'
                    }}
                  >
                    {isHighlighted && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '57%',
                          left: '53%',
                          transform: `translate(-50%, -50%) scale(${backgroundScale})`,
                          backgroundColor: '#32CD32',
                          borderRadius: '10px',
                          zIndex: -1,
                          width: '100%',
                          height: '100%',
                          transformOrigin: 'center center'
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
