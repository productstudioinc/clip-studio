import { Caption, createTikTokStyleCaptions } from '@remotion/captions'
import { random, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'

type CaptionComponentProps = {
  captions: Caption[]
  styles: React.CSSProperties
  seed: number
}

interface WordBox {
  x: number
  y: number
  width: number
  height: number
}

export const CaptionHopecoreComponent: React.FC<CaptionComponentProps> = ({
  captions,
  styles,
  seed
}) => {
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 800
  })

  const currentFrame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()

  // Define a safe margin zone
  const safeMargin = 40

  // Function to check if two boxes overlap
  const doesOverlap = (box1: WordBox, box2: WordBox) => {
    return !(
      box1.x + box1.width < box2.x ||
      box2.x + box2.width < box1.x ||
      box1.y + box1.height < box2.y ||
      box2.y + box2.height < box1.y
    )
  }

  // Function to find a valid position for a new word
  const findValidPosition = (
    wordWidth: number,
    wordHeight: number,
    existingBoxes: WordBox[],
    attempts: number = 50,
    tokenIndex: number
  ): { x: number; y: number } => {
    const padding = 5 // Reduced padding to keep words closer
    const centerX = width * 0.5
    const centerY = height * 0.5

    for (let i = 0; i < attempts; i++) {
      const angle = random(seed + tokenIndex * 100 + i) * Math.PI * 2
      const radius =
        Math.min(width, height) *
        0.2 * // Reduced radius to create tighter clusters
        (1 + random(seed + tokenIndex * 200 + i) * 0.3) // Reduced randomness
      const x = Math.max(
        safeMargin,
        Math.min(
          width - wordWidth - safeMargin,
          centerX + Math.cos(angle) * radius - wordWidth / 2
        )
      )
      const y = Math.max(
        safeMargin,
        Math.min(
          height - wordHeight - safeMargin,
          centerY + Math.sin(angle) * radius - wordHeight / 2
        )
      )

      const newBox: WordBox = {
        x: x - padding,
        y: y - padding,
        width: wordWidth + padding * 2,
        height: wordHeight + padding * 2
      }

      // Check if this position overlaps with any existing boxes
      const hasOverlap = existingBoxes.some((box) => doesOverlap(newBox, box))

      if (!hasOverlap) {
        return { x, y }
      }
    }

    // If no valid position found, return a fallback position within the safe zone
    return {
      x: Math.max(
        safeMargin,
        Math.min(
          width - wordWidth - safeMargin,
          centerX + (random(seed + tokenIndex * 300) - 0.5) * width * 0.4
        )
      ),
      y: Math.max(
        safeMargin,
        Math.min(
          height - wordHeight - safeMargin,
          centerY + (random(seed + tokenIndex * 400) - 0.5) * height * 0.4
        )
      )
    }
  }

  return (
    <>
      {pages.map((page, index) => {
        const startFrame = Math.round((page.startMs / 1000) * fps)
        const duration = Math.round(
          ((page.tokens[page.tokens.length - 1].toMs - page.startMs) / 1000) *
            fps
        )

        return (
          <Sequence key={index} from={startFrame} durationInFrames={duration}>
            <div className="absolute inset-0">
              {(() => {
                const placedBoxes: WordBox[] = []

                return page.tokens.map((token, tokenIndex) => {
                  const tokenStartFrame = Math.round(
                    (token.fromMs / 1000) * fps
                  )
                  const tokenEndFrame = Math.round((token.toMs / 1000) * fps)
                  const isVisible = currentFrame >= tokenStartFrame
                  const isHighlighted =
                    currentFrame >= tokenStartFrame &&
                    currentFrame < tokenEndFrame

                  // Adjust base font size to ensure it fits within the screen
                  const maxFontSize = Math.min(width / 10, height / 10) // Slightly reduced max font size
                  const baseFontSize = Math.min(
                    maxFontSize,
                    (width - 2 * safeMargin) / token.text.length
                  )
                  const fontSize = baseFontSize * 1.5 // Slightly reduced font size

                  // Estimate word dimensions (approximate)
                  const wordWidth = token.text.length * fontSize * 0.6
                  const wordHeight = fontSize * 1.3

                  // Find a position that doesn't overlap and is within screen bounds
                  const position = findValidPosition(
                    wordWidth,
                    wordHeight,
                    placedBoxes,
                    50,
                    tokenIndex
                  )

                  // Add this word's box to the placed boxes
                  placedBoxes.push({
                    x: position.x,
                    y: position.y,
                    width: wordWidth,
                    height: wordHeight
                  })

                  return (
                    <div
                      key={tokenIndex}
                      style={{
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                        fontSize: `${fontSize}px`,
                        fontWeight: '900',
                        color: isHighlighted ? '#FFD700' : 'white',
                        textShadow: `
                          -1px -1px 0 #000,  
                          1px -1px 0 #000,
                          -1px 1px 0 #000,
                          1px 1px 0 #000,
                          0 2px 4px rgba(0,0,0,0.5)
                        `,
                        transition: 'color 0.1s ease-in-out',
                        whiteSpace: 'nowrap',
                        zIndex: isHighlighted ? 2 : 1,
                        opacity: isVisible ? 1 : 0,
                        display: isVisible ? 'block' : 'none'
                      }}
                    >
                      {token.text}
                    </div>
                  )
                })
              })()}
            </div>
          </Sequence>
        )
      })}
    </>
  )
}
