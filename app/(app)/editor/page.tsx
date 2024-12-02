'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { EditorComposition } from '@/remotion/Editor/Composition'
import { Caption } from '@remotion/captions'
import type { PlayerRef } from '@remotion/player'
import { Player } from '@remotion/player'

import { isPositionedItem, PositionedItem, Track } from '@/types/editor'
import { FullscreenButton } from '@/components/editor/fullscreen-button'
import { LoopButton } from '@/components/editor/loop-button'
import { PlayPauseButton } from '@/components/editor/play-pause-button'
import { SeekBar } from '@/components/editor/seek-bar'
import { SpeedSelection } from '@/components/editor/speed-selection'
import { TimeDisplay } from '@/components/editor/time-display'
import { Timeline } from '@/components/editor/timeline'
import { VolumeSlider } from '@/components/editor/volume-slider'

const captions: Caption[] = [
  {
    text: 'Using',
    startMs: 0,
    endMs: 500,
    timestampMs: 250,
    confidence: null
  },
  {
    text: ' clip studio',
    startMs: 500,
    endMs: 1000,
    timestampMs: 750,
    confidence: null
  },
  {
    text: ' you ',
    startMs: 1000,
    endMs: 1250,
    timestampMs: 1125,
    confidence: null
  },
  {
    text: ' can ',
    startMs: 1250,
    endMs: 1500,
    timestampMs: 1375,
    confidence: null
  },
  {
    text: ' make ',
    startMs: 1500,
    endMs: 2000,
    timestampMs: 1750,
    confidence: null
  },
  {
    text: ' some',
    startMs: 2000,
    endMs: 2500,
    timestampMs: 2250,
    confidence: null
  },
  {
    text: ' dope',
    startMs: 2500,
    endMs: 3000,
    timestampMs: 2750,
    confidence: null
  },
  {
    text: ' videos',
    startMs: 3000,
    endMs: 3500,
    timestampMs: 3250,
    confidence: null
  }
]

export default function Page() {
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fps, setFps] = useState(60)
  const [loop, setLoop] = useState(true)
  const playerRef = useRef<PlayerRef>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const durationInFrames = 450
  const [selectedFont, setSelectedFont] = useState<string | null>(null)

  const [tracks, setTracks] = useState<Track[]>([
    {
      name: 'Video',
      items: [
        {
          type: 'video',
          src: 'https://assets.clip.studio/textmessage_preview.webm',
          aspectRatio: 9 / 16,
          maintainAspectRatio: true,
          volume: 0,
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          rotation: 0,
          durationInFrames: 150,
          from: 0,
          id: '5',
          color: '#ccc',
          isDragging: false
        },
        {
          type: 'video',
          src: 'https://assets.clip.studio/twitter_preview.webm',
          volume: 0,
          aspectRatio: 9 / 16,
          maintainAspectRatio: true,
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          rotation: 0,
          durationInFrames: 150,
          from: 100,
          id: '4',
          color: '#ccc',
          isDragging: false
        },
        {
          type: 'video',
          src: 'https://assets.clip.studio/reddit_preview.webm',
          volume: 0,
          aspectRatio: 9 / 16,
          maintainAspectRatio: true,
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          rotation: 0,
          durationInFrames: 150,
          from: 200,
          id: '3',
          color: '#ccc',
          isDragging: false
        }
      ]
    },
    {
      name: 'Solid',
      items: [
        {
          type: 'solid',
          color: '#000',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          durationInFrames: 450,
          from: 0,
          id: '2',
          rotation: 0,
          isDragging: false
        }
      ]
    },
    {
      name: 'Audio',
      items: [
        {
          type: 'audio',
          src: 'https://assets.clip.studio/music/QKthr.mp3',
          volume: 1,
          durationInFrames: 450,
          from: 0,
          id: '1'
        }
      ]
    }
  ])

  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const changeItem = useCallback(
    (itemId: string, updater: (item: PositionedItem) => PositionedItem) => {
      setTracks((oldTracks) => {
        return oldTracks.map((track) => ({
          ...track,
          items: track.items.map((item) => {
            if (item.id === itemId && isPositionedItem(item)) {
              return updater(item)
            }
            return item
          })
        }))
      })
    },
    []
  )

  const captionStyles = useMemo(() => {
    return {
      fontFamily: selectedFont ?? 'inherit',
      fontSize: '100px'
    } as React.CSSProperties
  }, [selectedFont])

  const inputProps = useMemo(() => {
    const visibleTracks = tracks.filter((track) => track.visible !== false)

    return {
      captions,
      captionStyles,
      tracks: visibleTracks,
      setSelectedItem,
      changeItem,
      selectedItem,
      fps
    }
  }, [tracks, fps, captions, captionStyles, changeItem, selectedItem])

  const handleSeek = (frame: number) => {
    setCurrentFrame(frame)
    playerRef.current?.seekTo(frame)
  }

  const handleTrackVisibilityChange = useCallback((trackIndex: number) => {
    setTracks((prevTracks) =>
      prevTracks.map((track, index) =>
        index === trackIndex
          ? { ...track, visible: track.visible === false ? true : false }
          : track
      )
    )
  }, [])

  return (
    <div className="flex flex-col w-full h-full">
      {/* <FontPicker
        selectedFont={selectedFont}
        setSelectedFont={setSelectedFont}
      /> */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Player
          ref={playerRef}
          component={EditorComposition}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionHeight={1920}
          compositionWidth={1080}
          loop={loop}
          playbackRate={playbackRate}
          className="rounded-lg max-h-[60vh]"
          controls={false}
        />
      </div>
      <div className="border rounded-lg p-4 m-4">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-4">
            <SpeedSelection
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
            />
            <PlayPauseButton playerRef={playerRef} />
            <LoopButton loop={loop} setLoop={setLoop} />
            <VolumeSlider playerRef={playerRef} />
            <TimeDisplay
              playerRef={playerRef}
              durationInFrames={durationInFrames}
              fps={fps}
            />

            <FullscreenButton playerRef={playerRef} />
          </div>
        </div>
        <div className="flex flex-col">
          <SeekBar
            playerRef={playerRef}
            durationInFrames={durationInFrames}
            onSeek={handleSeek}
          />
          <Timeline
            captions={captions}
            tracks={tracks}
            setTracks={setTracks}
            currentFrame={currentFrame}
            onSeek={handleSeek}
            durationInFrames={durationInFrames}
            onTrackVisibilityChange={handleTrackVisibilityChange}
          />
        </div>
      </div>
    </div>
  )
}
