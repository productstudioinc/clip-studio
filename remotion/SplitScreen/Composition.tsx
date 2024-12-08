import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { getVideoMetadata } from '@remotion/media-utils'
import { AbsoluteFill, continueRender, delayRender, Series } from 'remotion'

import { SplitScreenVideoProps } from '../../stores/templatestore'
import { CaptionComponent } from '../Shared/caption'
import { LoopedOffthreadVideo } from '../Shared/LoopedOffthreadVideo'

const FPS = 30

export const SplitScreenComposition = ({
  videoUrl,
  type,
  backgroundUrls,
  backgroundStartIndex,
  durationInFrames,
  captionStyle,
  transcription
}: SplitScreenVideoProps) => {
  const [handle] = useState(() => delayRender('Loading video metadata'))

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        await Promise.all([
          getVideoMetadata(videoUrl),
          ...backgroundUrls.map((url) => getVideoMetadata(url))
        ])
        continueRender(handle)
      } catch (err) {
        console.error('Error loading video metadata:', err)
        continueRender(handle)
      }
    }

    loadMetadata()
  }, [videoUrl, backgroundUrls, handle])

  const requiredSegments = useMemo(() => {
    if (backgroundUrls.length === 1) {
      return backgroundUrls
    }
    const totalMinutes = Math.ceil(durationInFrames / (FPS * 60))
    const totalRequiredSegments = totalMinutes
    const segments = []

    for (let i = 0; i < totalRequiredSegments; i++) {
      const segmentIndex = (backgroundStartIndex + i) % backgroundUrls.length
      segments.push(backgroundUrls[segmentIndex])
    }

    return segments
  }, [backgroundUrls, durationInFrames, backgroundStartIndex])

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
        <LoopedOffthreadVideo src={videoUrl} style={videoStyle} />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '50%'
        }}
      >
        {backgroundUrls.length === 1 ? (
          <LoopedOffthreadVideo src={backgroundUrls[0]} style={videoStyle} />
        ) : (
          <Series>
            {requiredSegments.map((url, index) => (
              <Series.Sequence durationInFrames={FPS * 60} key={index}>
                <LoopedOffthreadVideo
                  src={url}
                  style={videoStyle}
                  startFrom={0}
                  endAt={FPS * 60}
                />
              </Series.Sequence>
            ))}
          </Series>
        )}
      </div>
      <AbsoluteFill>
        <CaptionComponent
          captions={transcription}
          styles={captionStyle.style}
          options={captionStyle.options}
        />
      </AbsoluteFill>
      <div style={overlayStyle}>
        <div style={uploadingTextStyle}>Uploading video...</div>
      </div>
    </AbsoluteFill>
  )
}
