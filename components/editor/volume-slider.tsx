import React, { useEffect, useState } from 'react'
import type { PlayerRef } from '@remotion/player'
import { Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'

export const VolumeSlider: React.FC<{
  playerRef: React.RefObject<PlayerRef>
}> = ({ playerRef }) => {
  const [volume, setVolume] = useState(playerRef.current?.getVolume() ?? 1)
  const [muted, setMuted] = useState(playerRef.current?.isMuted() ?? false)

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
      if (newVolume > 0 && playerRef.current.isMuted()) {
        playerRef.current.unmute()
      }

      playerRef.current.setVolume(newVolume)
    },
    [playerRef]
  )
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Volume2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top">
        <Slider
          value={[muted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onChange}
        />
      </PopoverContent>
    </Popover>
  )
}
