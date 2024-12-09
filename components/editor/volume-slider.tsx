import React, { useCallback, useEffect, useState } from 'react'
import type { PlayerRef } from '@remotion/player'
import { Volume2, VolumeX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'

export const VolumeSlider: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>
}> = ({ playerRef }) => {
  const [volume, setVolume] = useState(playerRef.current?.getVolume() ?? 1)
  const [muted, setMuted] = useState(playerRef.current?.isMuted() ?? false)
  const [isVolumePopoverOpen, setIsVolumePopoverOpen] = useState(false)

  useEffect(() => {
    const { current } = playerRef
    if (!current) {
      return
    }

    const onVolumeChange = () => {
      setVolume(current.getVolume())
    }

    const onMuteChange = () => {
      setMuted(current.isMuted())
    }

    current.addEventListener('volumechange', onVolumeChange)
    current.addEventListener('mutechange', onMuteChange)

    return () => {
      current.removeEventListener('volumechange', onVolumeChange)
      current.removeEventListener('mutechange', onMuteChange)
    }
  }, [playerRef])

  const onChange = React.useCallback(
    (value: number[]) => {
      if (!playerRef.current) {
        return
      }

      const newVolume = value[0]
      playerRef.current.setVolume(newVolume)
      if (muted) {
        playerRef.current.unmute()
        setMuted(false)
      }
    },
    [playerRef, muted]
  )

  const toggleMute = useCallback(() => {
    if (!playerRef.current) {
      return
    }

    if (muted) {
      playerRef.current.unmute()
    } else {
      playerRef.current.mute()
    }
    setMuted(!muted)
  }, [muted, playerRef])

  const openVolumePopover = useCallback(() => {
    setIsVolumePopoverOpen(true)
  }, [])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'v') {
        openVolumePopover()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [openVolumePopover])

  return (
    <Popover open={isVolumePopoverOpen} onOpenChange={setIsVolumePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" onClick={openVolumePopover}>
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={toggleMute}>
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[muted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={onChange}
            className="flex-grow"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
