'use client'

import React from 'react'
import useTemplateConfig from '@/stores/templateConfig'
import { VideoProps } from '@/stores/templatestore'
import { Player } from '@remotion/player'
import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VideoPreviewProps {
  form: UseFormReturn<VideoProps>
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ form }) => {
  const {
    component: CompositionComponent,
    state: inputProps,
    durationInFrames
  } = useTemplateConfig()

  const { watch } = form

  const width = watch('width')
  const height = watch('height')
  const fps = watch('fps')
  const isVoiceoverGenerated = watch('isVoiceoverGenerated')

  const aspectRatioClass = React.useMemo(() => {
    const ratio = width / height
    if (ratio === 9 / 16) {
      return 'max-w-[calc(100vh*9/16)] aspect-[9/16]'
    } else if (ratio === 16 / 9) {
      return 'max-w-[calc(100vh*16/9)] aspect-[16/9]'
    } else if (ratio === 1) {
      return 'max-w-[calc(100vh)] aspect-square'
    } else {
      return `aspect-[${width}/${height}]`
    }
  }, [width, height])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-md font-medium">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative w-full h-full mx-auto flex flex-col items-center justify-center ${aspectRatioClass}`}
        >
          <Player
            component={CompositionComponent as any}
            inputProps={inputProps}
            durationInFrames={durationInFrames}
            className="rounded-md"
            style={{ width: '100%', height: '100%' }}
            fps={fps}
            compositionHeight={height}
            compositionWidth={width}
            controls
            loop
            clickToPlay
          />
          {isVoiceoverGenerated !== undefined && !isVoiceoverGenerated && (
            <div className="absolute inset-0 bg-black/60 flex items-start justify-center text-center pt-10">
              <p className="text-red-500 text-lg font-bold">
                ⚠️ Voiceover is out of sync with the video. <br /> Please
                generate a new voiceover to preview the video.
              </p>
            </div>
          )}
        </div>
        {/* <div className="mt-4">
					<table className="w-full">
						<tbody>
							{watch('language') && (
								<tr>
									<td>
										<strong>Language:</strong>
									</td>
									<td>{watch('language')}</td>
								</tr>
							)}
							{watch('voice') && (
								<tr>
									<td>
										<strong>Voice:</strong>
									</td>
									<td>{watch('voice')}</td>
								</tr>
							)}
							<tr>
								<td>
									<strong>Voice Volume:</strong>
								</td>
								<td>{watch('voiceVolume')}%</td>
							</tr>
							{watch('music') && (
								<tr>
									<td>
										<strong>Music:</strong>
									</td>
									<td>{watch('music') === 'none' ? 'No background music' : watch('music')}</td>
								</tr>
							)}
							<tr>
								<td>
									<strong>Music Volume:</strong>
								</td>
								<td>{watch('musicVolume')}%</td>
							</tr>
							<tr>
								<td>
									<strong>Aspect Ratio:</strong>
								</td>
								<td>{watch('aspectRatio')}</td>
							</tr>
							{watch('tweetId') && (
								<tr>
									<td>
										<strong>Tweet ID:</strong>
									</td>
									<td>{watch('tweetId')}</td>
								</tr>
							)}
							{watch('subreddit') && (
								<tr>
									<td>
										<strong>Subreddit:</strong>
									</td>
									<td>{watch('subreddit')}</td>
								</tr>
							)}
							{watch('title') && (
								<tr>
									<td>
										<strong>Title:</strong>
									</td>
									<td>{watch('title')}</td>
								</tr>
							)}
							{watch('text') && (
								<tr>
									<td>
										<strong>Text:</strong>
									</td>
									<td>{watch('text')}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div> */}
      </CardContent>
    </Card>
  )
}
