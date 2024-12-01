'use client'

import React, { useCallback, useEffect, useState } from 'react'
import type { PlayerRef } from '@remotion/player'
import { Pause, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const PlayPauseButton: React.FC<{
  playerRef: React.RefObject<PlayerRef>
}> = ({ playerRef }) => {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const { current } = playerRef
    setPlaying(current?.isPlaying() ?? false)
    if (!current) return

    const onPlay = () => {
      setPlaying(true)
    }

    const onPause = () => {
      setPlaying(false)
    }

    current.addEventListener('play', onPlay)
    current.addEventListener('pause', onPause)

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        onToggle()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      current.removeEventListener('play', onPlay)
      current.removeEventListener('pause', onPause)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [playerRef])

  const onToggle = useCallback(() => {
    playerRef.current?.toggle()
  }, [playerRef])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label={playing ? 'Pause' : 'Play'}
    >
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
    </Button>
  )
}
