'use client'

import React, { useCallback, useEffect, useState } from 'react'
import type { PlayerRef } from '@remotion/player'
import { Maximize2, Minimize2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const FullscreenButton: React.FC<{
  playerRef: React.RefObject<PlayerRef>
}> = ({ playerRef }) => {
  const [supportsFullscreen, setSupportsFullscreen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const { current } = playerRef

    if (!current) {
      return
    }

    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
    }

    current.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      current.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [playerRef])

  useEffect(() => {
    // Must be handled client-side to avoid SSR hydration mismatch
    setSupportsFullscreen(
      (typeof document !== 'undefined' &&
        (document.fullscreenEnabled ||
          // @ts-expect-error Types not defined
          document.webkitFullscreenEnabled)) ??
        false
    )
  }, [])

  const toggleFullscreen = useCallback(() => {
    const { current } = playerRef
    if (!current) {
      return
    }

    if (isFullscreen) {
      current.exitFullscreen()
    } else {
      current.requestFullscreen()
    }
  }, [isFullscreen, playerRef])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'f') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [toggleFullscreen])

  if (!supportsFullscreen) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  )
}
