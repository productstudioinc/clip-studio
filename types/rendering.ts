export type RenderingState =
  | {
      status: 'init'
    }
  | {
      status: 'invoking'
    }
  | {
      renderId: string
      bucketName: string
      progress: number
      status: 'rendering'
    }
  | {
      renderId: string | null
      status: 'error'
      error: Error
    }
  | {
      url: string
      size: number
      status: 'done'
    }
