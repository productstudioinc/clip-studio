'use client'

import {
  useTemplateStore
} from '@/stores/templatestore'
import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export const ResetSettings = () => {
  const reset = useTemplateStore((state) => state.reset)

  const handleReset = () => {
    reset()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Trash2 className="w-4 h-4 mr-1" />
          Clear Settings
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to clear your settings?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Clearing your local settings will
            reset all options to their default values and remove any unsaved
            transcriptions, voiceovers, and other temporary data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            Clear Settings
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
