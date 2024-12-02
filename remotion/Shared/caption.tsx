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

type CaptionComponentProps = {
  captions: Caption[]
  styles: { [key: string]: React.CSSProperties }
}

export const CaptionComponent: React.FC<CaptionComponentProps> = ({
  captions,
  styles = {
    fontFamily: 'inherit'
  }
}) => {
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 1200
  })

  const currentFrame = useCurrentFrame()
  const { width, fps } = useVideoConfig()

  return (
    <>
      {pages.map((page, index) => {
        const startFrame = Math.round((page.startMs / 1000) * fps)
        const duration = Math.round(
          ((page.tokens[page.tokens.length - 1].toMs - page.startMs) / 1000) *
            fps
        )
        const scale = spring({
          fps,
          frame: currentFrame - startFrame,
          config: {
            damping: 15,
            stiffness: 300,
            mass: 0.4
          }
        })

        // Generate a random rotation between -3 and 3 degrees
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
                  0px -6px 0 #212121,  
                  0px -6px 0 #212121,
                  0px  6px 0 #212121,
                  0px  6px 0 #212121,
                  -6px  0px 0 #212121,  
                  6px  0px 0 #212121,
                  -6px  0px 0 #212121,
                  6px  0px 0 #212121,
                  -6px -6px 0 #212121,  
                  6px -6px 0 #212121,
                  -6px  6px 0 #212121,
                  6px  6px 0 #212121,
                  -6px  18px 0 #212121,
                  0px  18px 0 #212121,
                  6px  18px 0 #212121,
                  0 19px 1px rgba(0,0,0,.1),
                  0 0 6px rgba(0,0,0,.1),
                  0 6px 3px rgba(0,0,0,.3),
                  0 12px 6px rgba(0,0,0,.2),
                  0 18px 18px rgba(0,0,0,.25),
                  0 24px 24px rgba(0,0,0,.2),
                  0 36px 36px rgba(0,0,0,.15)`,
                letterSpacing: '1px',
                ...styles
              }}
            >
              {page.tokens.map((token, tokenIndex) => {
                const tokenStartFrame = Math.round((token.fromMs / 1000) * fps)
                const tokenEndFrame = Math.round((token.toMs / 1000) * fps)
                const isHighlighted =
                  currentFrame >= tokenStartFrame &&
                  currentFrame < tokenEndFrame

                const progress = interpolate(
                  currentFrame,
                  [tokenStartFrame, tokenEndFrame - 1],
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
                          top: '55%',
                          left: '50%',
                          transform: `translate(-50%, -50%) scale(${backgroundScale})`,
                          backgroundColor: '#32CD32',
                          borderRadius: '20px',
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
