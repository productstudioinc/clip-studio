import React, { useEffect, useState } from 'react'
import type { PlayerRef } from '@remotion/player'
import { Volume2, VolumeX } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const MuteButton: React.FC<{
  playerRef: React.RefObject<PlayerRef>
}> = ({ playerRef }) => {
  const [muted, setMuted] = useState(playerRef.current?.isMuted() ?? false)

  const onClick = React.useCallback(() => {
    if (!playerRef.current) {
      return
    }

    if (playerRef.current.isMuted()) {
      playerRef.current.unmute()
    } else {
      playerRef.current.mute()
    }
  }, [playerRef])

  useEffect(() => {
    const { current } = playerRef
    if (!current) {
      return
    }

    const onMuteChange = () => {
      setMuted(current.isMuted())
    }

    current.addEventListener('mutechange', onMuteChange)
    return () => {
      current.removeEventListener('mutechange', onMuteChange)
    }
  }, [playerRef])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  )
}
