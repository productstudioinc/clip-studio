import React, { useEffect } from 'react'
import { Repeat } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const LoopButton: React.FC<{
  loop: boolean
  setLoop: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ loop, setLoop }) => {
  const onClick = React.useCallback(() => {
    setLoop((prev) => !prev)
  }, [setLoop])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'l') {
        setLoop((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [setLoop])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={loop ? 'Disable loop' : 'Enable loop'}
      className={loop ? 'bg-primary/10' : ''}
    >
      <Repeat className={`h-4 w-4 ${loop ? 'text-primary' : ''}`} />
    </Button>
  )
}
