import { useCallback, useEffect, useState } from 'react'
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Sequence,
  useVideoConfig
} from 'remotion'

import { AIVideoProps } from '../../stores/templatestore'
import Subtitle from '../Shared/Subtitle'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const FPS = 30

export const AIVideoComposition = ({
  backgroundUrls,
  captionStyle,
  voiceoverFrames
}: AIVideoProps) => {
  const videoConfig = useVideoConfig()
  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([])
  const [handle] = useState(() => delayRender())

  const generateSubtitles = useCallback(() => {
    try {
      const {
        characters,
        character_start_times_seconds,
        character_end_times_seconds
      } = voiceoverFrames
      const subtitlesData: SubtitleProp[] = []
      let currentWord = ''
      let wordStartIndex = 0

      for (let i = 0; i < characters.length; i++) {
        if (characters[i] === ' ' || i === characters.length - 1) {
          if (currentWord) {
            const startFrame = Math.floor(
              character_start_times_seconds[wordStartIndex] * FPS
            )
            const endFrame = Math.floor(character_end_times_seconds[i] * FPS)

            subtitlesData.push({
              startFrame,
              endFrame,
              text: currentWord.trim()
            })

            currentWord = ''
            wordStartIndex = i + 1
          }
        } else {
          currentWord += characters[i]
        }
      }
      setSubtitles(subtitlesData)
      continueRender(handle)
    } catch (e) {
      console.error('Error in generateSubtitles:', e)
      cancelRender(e)
    }
  }, [handle, voiceoverFrames])

  useEffect(() => {
    generateSubtitles()
  }, [generateSubtitles])

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '50%'
        }}
      ></div>
      {subtitles.map((subtitle, index) =>
        subtitle.startFrame < subtitle.endFrame ? (
          <Sequence
            from={subtitle.startFrame}
            durationInFrames={subtitle.endFrame - subtitle.startFrame}
            key={index}
          >
            <Subtitle
              text={subtitle.text}
              captionStyle={captionStyle}
              style={{ top: '50%' }}
            />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  )
}
