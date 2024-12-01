import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { PlayerRef } from '@remotion/player'

import { Slider } from '@/components/ui/slider'

type Size = {
  width: number
  height: number
  left: number
  top: number
}

export const useElementSize = (
  ref: React.RefObject<HTMLElement>
): Size | null => {
  const [size, setSize] = useState<Size | null>(() => {
    if (!ref.current) {
      return null
    }

    const rect = ref.current.getClientRects()
    if (!rect[0]) {
      return null
    }

    return {
      width: rect[0].width as number,
      height: rect[0].height as number,
      left: rect[0].x as number,
      top: rect[0].y as number
    }
  })

  const observer = useMemo(() => {
    if (typeof ResizeObserver === 'undefined') {
      return null
    }

    return new ResizeObserver((entries) => {
      const { target } = entries[0]
      const newSize = target.getClientRects()

      if (!newSize?.[0]) {
        setSize(null)
        return
      }

      const { width } = newSize[0]

      const { height } = newSize[0]

      setSize({
        width,
        height,
        left: newSize[0].x,
        top: newSize[0].y
      })
    })
  }, [])

  const updateSize = useCallback(() => {
    if (!ref.current) {
      return
    }

    const rect = ref.current.getClientRects()
    if (!rect[0]) {
      setSize(null)
      return
    }

    setSize((prevState) => {
      const isSame =
        prevState &&
        prevState.width === rect[0].width &&
        prevState.height === rect[0].height &&
        prevState.left === rect[0].x &&
        prevState.top === rect[0].y
      if (isSame) {
        return prevState
      }

      return {
        width: rect[0].width as number,
        height: rect[0].height as number,
        left: rect[0].x as number,
        top: rect[0].y as number,
        windowSize: {
          height: window.innerHeight,
          width: window.innerWidth
        }
      }
    })
  }, [ref])

  useEffect(() => {
    if (!observer) {
      return
    }

    const { current } = ref
    if (current) {
      observer.observe(current)
    }

    return (): void => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [observer, ref, updateSize])

  useEffect(() => {
    window.addEventListener('resize', updateSize)

    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [updateSize])

  return useMemo(() => {
    if (!size) {
      return null
    }

    return { ...size, refresh: updateSize }
  }, [size, updateSize])
}

export const SeekBar: React.FC<{
  durationInFrames: number
  inFrame?: number | null
  outFrame?: number | null
  playerRef: React.RefObject<PlayerRef>
  onSeek: (frame: number) => void
}> = ({ durationInFrames, inFrame, outFrame, playerRef, onSeek }) => {
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const { current } = playerRef
    if (!current) {
      return
    }

    const onFrameUpdate = () => {
      setFrame(current.getCurrentFrame())
    }

    const onPlay = () => {
      setPlaying(true)
    }

    const onPause = () => {
      setPlaying(false)
    }

    current.addEventListener('frameupdate', onFrameUpdate)
    current.addEventListener('play', onPlay)
    current.addEventListener('pause', onPause)

    return () => {
      current.removeEventListener('frameupdate', onFrameUpdate)
      current.removeEventListener('play', onPlay)
      current.removeEventListener('pause', onPause)
    }
  }, [playerRef])

  const handleSeek = useCallback(
    (value: number[]) => {
      if (!playerRef.current) {
        return
      }

      const newFrame = Math.round(value[0])
      playerRef.current.seekTo(newFrame)
      onSeek(newFrame)
    },
    [playerRef]
  )

  return (
    <Slider
      min={inFrame ?? 0}
      max={outFrame ?? durationInFrames - 1}
      step={1}
      value={[frame]}
      onValueChange={handleSeek}
    />
  )
}
