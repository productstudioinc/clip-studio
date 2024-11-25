import { useCallback, useMemo } from 'react'
import { useRenderingStore } from '@/stores/renderstore'
import { useTemplateStore } from '@/stores/templatestore'
import { getProgress, renderVideo } from '@/utils/lambda/api'
import { toast } from 'sonner'

const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, milliSeconds)
  })
}

export const useRendering = (providedId?: string) => {
  const renderId = useMemo(
    () => providedId || crypto.randomUUID(),
    [providedId]
  )
  const { renders, setRenderState, removeRender } = useRenderingStore()
  const state = renders[renderId] || { status: 'init' }
  const {
    selectedTemplate,
    splitScreenState,
    redditState,
    twitterState,
    textMessageState,
    clipsState,
    aivideoState
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterState: state.twitterState,
    textMessageState: state.textMessageState,
    clipsState: state.clipsState,
    aivideoState: state.aiVideoState
  }))

  const id = selectedTemplate

  const inputProps = (() => {
    switch (selectedTemplate) {
      case 'SplitScreen':
        return splitScreenState
      case 'Reddit':
        return redditState
      case 'Twitter':
        return twitterState
      case 'TextMessage':
        return textMessageState
      case 'Clips':
        return clipsState
      case 'AIVideo':
        return aivideoState
      default:
        return twitterState
    }
  })()

  const renderMedia = useCallback(async () => {
    const tid = toast.loading('Initiating video rendering...')
    setRenderState(renderId, {
      status: 'invoking'
    })
    try {
      const { renderId: videoId, bucketName } = await renderVideo({
        id,
        inputProps
      })
      setRenderState(renderId, {
        status: 'rendering',
        progress: 0,
        renderId: videoId,
        bucketName: bucketName
      })
      toast.loading('Rendering video...', { id: tid })

      let pending = true

      while (pending) {
        const result = await getProgress({
          id: videoId,
          bucketName: bucketName
        })
        switch (result.type) {
          case 'error': {
            setRenderState(renderId, {
              status: 'error',
              renderId: videoId,
              error: new Error(result.message)
            })
            toast.error(`Rendering failed: ${result.message}`, { id: tid })
            pending = false
            break
          }
          case 'done': {
            setRenderState(renderId, {
              status: 'done',
              url: result.url,
              size: result.size
            })
            toast.success('Video rendering completed successfully!', {
              id: tid
            })
            pending = false
            break
          }
          case 'progress': {
            setRenderState(renderId, {
              status: 'rendering',
              bucketName: bucketName,
              progress: result.progress,
              renderId: videoId
            })
            toast.loading(
              `Rendering progress: ${Math.round(result.progress * 100)}%`,
              { id: tid }
            )
            await wait(1000)
          }
        }
      }
    } catch (err) {
      setRenderState(renderId, {
        status: 'error',
        error: err as Error,
        renderId: null
      })
      toast.error(`An unexpected error occurred: ${(err as Error).message}`, {
        id: tid
      })
    }
  }, [id, inputProps, renderId, setRenderState])

  const undo = useCallback(() => {
    setRenderState(renderId, { status: 'init' })
    toast.info('Rendering reset')
  }, [renderId, setRenderState])

  const isLoading = state.status === 'invoking' || state.status === 'rendering'
  const isComplete = state.status === 'done'

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
      isLoading,
      isComplete,
      inputProps,
      renderId
    }
  }, [renderMedia, state, undo, isLoading, isComplete, inputProps, renderId])
}
