import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { AbsoluteFill, Sequence, Series, Video } from 'remotion'

import { SplitScreenVideoProps } from '../../stores/templatestore'
import Subtitle from '../Shared/Subtitle'

export type SubtitleProp = {
  startFrame: number
  endFrame: number
  text: string
}

const FPS = 30

export const SplitScreenComposition = ({
  videoUrl,
  type,
  backgroundUrls,
  backgroundStartIndex,
  durationInFrames,
  transcription,
  captionStyle
}: SplitScreenVideoProps) => {
  const requiredSegments = useMemo(() => {
    const totalMinutes = Math.ceil(durationInFrames / (FPS * 60))
    const totalRequiredSegments = totalMinutes
    const segments = []

    for (let i = 0; i < totalRequiredSegments; i++) {
      const segmentIndex = (backgroundStartIndex + i) % backgroundUrls.length
      segments.push(backgroundUrls[segmentIndex])
    }

    return segments
  }, [backgroundUrls, durationInFrames, backgroundStartIndex])

  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([])

  const generateSubtitles = useCallback(() => {
    try {
      const { chunks } = transcription
      const subtitlesData: SubtitleProp[] = []
      for (let i = 0; i < chunks.length; i++) {
        const { timestamp, text } = chunks[i]
        const startFrame = Math.floor(timestamp[0] * FPS)
        const endFrame = Math.floor(timestamp[1] * FPS)
        subtitlesData.push({
          startFrame,
          endFrame,
          text
        })
      }
      setSubtitles(subtitlesData)
    } catch (e) {
      console.error('Error in generateSubtitles:', e)
    }
  }, [transcription])

  useEffect(() => {
    generateSubtitles()
  }, [generateSubtitles])

  const videoStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: type === 'blob' ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }

  const uploadingTextStyle: CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
  }

  return (
    <AbsoluteFill>
      <div
        style={{ position: 'absolute', top: 0, width: '100%', height: '50%' }}
      >
        <Video src={videoUrl} style={videoStyle} muted />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '50%'
        }}
      >
        <Series>
          {requiredSegments.map((url, index) => (
            <Series.Sequence durationInFrames={FPS * 60} key={index}>
              <Video
                src={url}
                startFrom={0}
                endAt={FPS * 60}
                style={videoStyle}
                muted
                loop
              />
            </Series.Sequence>
          ))}
        </Series>
      </div>
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
      <div style={overlayStyle}>
        <div style={uploadingTextStyle}>Uploading video...</div>
      </div>
    </AbsoluteFill>
  )
}
