'use client'

import { useEffect, useRef, useState } from 'react'
import { CREDIT_CONVERSIONS } from '@/utils/constants'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

interface VideoCardProps {
  title: string
  videoSrc: string
}

interface VideoShowcase {
  videoSrc: string
}

interface VideoCosts {
  render: number
  voiceover: number
  imageGeneration: number
  transcription: number
}
const VideoCard = ({ title, videoSrc }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Mobile behavior - play when in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (window.innerWidth <= 768) {
          // Mobile breakpoint
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play()
            } else {
              video.pause()
              video.currentTime = 0
            }
          })
        }
      },
      { threshold: 0.5 }
    )

    // Desktop behavior - play on hover
    const loadFirstFrame = () => {
      video.currentTime = 0.001
    }

    const handleMouseEnter = () => {
      if (window.innerWidth > 768) {
        video.play()
      }
    }

    const handleMouseLeave = () => {
      if (window.innerWidth > 768) {
        video.pause()
        video.currentTime = 0.001
      }
    }

    video.load()
    video.addEventListener('loadedmetadata', loadFirstFrame)
    video.addEventListener('mouseenter', handleMouseEnter)
    video.addEventListener('mouseleave', handleMouseLeave)
    observer.observe(video)

    return () => {
      video.removeEventListener('loadedmetadata', loadFirstFrame)
      video.removeEventListener('mouseenter', handleMouseEnter)
      video.removeEventListener('mouseleave', handleMouseLeave)
      observer.unobserve(video)
      observer.disconnect()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      width={200}
      height={300}
      loop
      playsInline
      muted
      poster={videoSrc}
      preload="metadata"
      className="w-[200px] h-[300px] object-cover rounded-md cursor-pointer"
      aria-description={title}
    />
  )
}

const showcases: Record<string, VideoShowcase> = {
  Reddit: {
    videoSrc: 'https://assets.clip.studio/reddit_preview.webm'
  },
  'Text Message': {
    videoSrc: 'https://assets.clip.studio/textmessage_preview.webm'
  },
  'Twitter Thread': {
    videoSrc: 'https://assets.clip.studio/twitter_preview.webm'
  },
  AI: {
    videoSrc: 'https://assets.clip.studio/aivideo_preview.webm'
  },
  'Split Screen': {
    videoSrc: 'https://assets.clip.studio/splitscreen_preview.webm'
  },
  Clips: {
    videoSrc: 'https://assets.clip.studio/clips_preview.webm'
  }
}

const costPerVideo: Record<string, VideoCosts> = {
  Reddit: {
    render: 12,
    voiceover: 10,
    imageGeneration: 0,
    transcription: 0
  },
  'Text Message': {
    render: 12,
    voiceover: 10,
    imageGeneration: 0,
    transcription: 0
  },
  'Twitter Thread': {
    render: 12,
    voiceover: 10,
    imageGeneration: 0,
    transcription: 0
  },
  AI: {
    render: 12,
    voiceover: 10,
    imageGeneration: 60,
    transcription: 0
  },
  'Split Screen': {
    render: 12,
    voiceover: 0,
    imageGeneration: 0,
    transcription: 6
  },
  Clips: {
    render: 12,
    voiceover: 0,
    transcription: 0,
    imageGeneration: 0
  }
}
const CreditSlider = ({
  credits,
  setCredits
}: {
  credits: number
  setCredits: (value: number) => void
}) => {
  const maxCredits = 5000
  const creditStep = 50
  const mobileMarkers = [0, 1000, 2000, 3000, 4000, 5000]
  const desktopMarkers = [
    0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000
  ]
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const planLabels: Record<number, string> = {
    500: 'Hobby',
    1000: 'Creator',
    4000: 'Pro'
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor="credit-slider"
        className="block text-sm font-medium text-muted-foreground"
      >
        Select number of credits:
      </label>
      <Slider
        id="credit-slider"
        min={0}
        max={maxCredits}
        step={creditStep}
        value={[credits]}
        onValueChange={(values) => setCredits(values[0])}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        {(isMobile ? mobileMarkers : desktopMarkers).map((value) => (
          <div key={value} className="flex flex-col items-center">
            <span className="mb-1">{value}</span>
            <div
              className={`h-1 w-0.5 ${planLabels[value] ? 'bg-primary' : 'bg-muted-foreground'}`}
            />
            {planLabels[value] && (
              <span className="mb-1 font-medium text-primary">
                {planLabels[value]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const VideoTypeCard = ({
  type,
  costs,
  credits
}: {
  type: string
  costs: VideoCosts
  credits: number
}) => {
  const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
  const videoCount = Math.floor(credits / totalCost)
  const showcase = showcases[type]

  return (
    <div className="bg-card w-full p-4 rounded-lg border shadow-sm flex flex-col items-center space-y-2">
      <p className="text-4xl font-bold text-green-500">{videoCount}</p>
      <h3 className="text-lg font-semibold whitespace-nowrap">
        {type}{' '}
        <span className="text-muted-foreground">
          {videoCount === 1 ? 'video' : 'videos'}
        </span>
      </h3>
      <div className="flex items-center w-full gap-2">
        <hr className="flex-grow border-muted-foreground/30" />
        <span className="text-sm text-muted-foreground">or</span>
        <hr className="flex-grow border-muted-foreground/30" />
      </div>
      <h3 className="text-sm font-semibold whitespace-nowrap text-green-500">
        {(videoCount / 30).toFixed(1)} months{' '}
        <span className="text-muted-foreground">of daily videos</span>
      </h3>
      {showcase && <VideoCard title={type} videoSrc={showcase.videoSrc} />}
      <p className="text-sm text-muted-foreground">(1 minute each)</p>
    </div>
  )
}
const CostBreakdownTable = () => (
  <>
    <p className="text-xl mt-6 mb-2 text-center">Credit breakdown per video</p>
    <div className="overflow-x-auto md:overflow-x-visible">
      <table className="min-w-full whitespace-nowrap text-left mb-6 text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-muted-foreground">Video Type</th>
            <th className="px-4 py-2 text-muted-foreground">Render</th>
            <th className="px-4 py-2 text-muted-foreground">Voiceover</th>
            <th className="px-4 py-2 text-muted-foreground">Image</th>
            <th className="px-4 py-2 text-muted-foreground">Transcription</th>
            <th className="px-4 py-2 text-lg font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(costPerVideo).map(([type, costs]) => {
            const total = Object.values(costs).reduce(
              (sum, cost) => sum + cost,
              0
            )
            return (
              <tr key={type}>
                <td className="border px-4 py-2 text-muted-foreground">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </td>
                <td className="border px-4 py-2 text-muted-foreground">
                  {costs.render}
                </td>
                <td className="border px-4 py-2 text-muted-foreground">
                  {costs.voiceover}
                </td>
                <td className="border px-4 py-2 text-muted-foreground">
                  {costs.imageGeneration}
                </td>
                <td className="border px-4 py-2 text-muted-foreground">
                  {costs.transcription}
                </td>
                <td className="border px-4 py-2 text-lg font-bold">{total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </>
)

const HowItWorksSection = () => (
  <div className="bg-muted p-4 rounded-md">
    <h3 className="font-semibold mb-2">How it works:</h3>
    <ul className="list-disc list-inside space-y-1 text-sm">
      <li>Slide to select the number of credits</li>
      <li>See instantly how many videos you can create...</li>
      <li>
        1 credit = {CREDIT_CONVERSIONS.EXPORT_SECONDS} seconds of video
        rendering (12 credits / minute)
      </li>
      <li>
        1 credit = {CREDIT_CONVERSIONS.VOICEOVER_CHARACTERS} characters of
        voiceover (10 credits / minute)
      </li>
      <li>
        AI videos take {CREDIT_CONVERSIONS.IMAGE_GENERATION} credits per image,
        (60 credits / minute)
      </li>
    </ul>
  </div>
)

const HowManyVideos = ({ credits }: { credits: number }) => (
  <div className="text-center space-y-4">
    <div className="flex flex-wrap items-center justify-center gap-2 px-4">
      <span className="text-2xl sm:text-4xl font-bold text-primary">With</span>
      <span className="text-2xl sm:text-4xl font-bold text-green-500">
        {new Intl.NumberFormat('en-US').format(credits)} credits
      </span>
      <span className="text-2xl sm:text-4xl font-bold text-primary">
        you can create
      </span>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(costPerVideo).map(([type, costs]) => (
        <VideoTypeCard key={type} type={type} costs={costs} credits={credits} />
      ))}
    </div>
  </div>
)

export function CreditCalculator() {
  const [credits, setCredits] = useState<number>(1000)

  return (
    <Card className="w-full max-w-screen-md mx-auto">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-center">
          Credit Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CreditSlider credits={credits} setCredits={setCredits} />
        <HowManyVideos credits={credits} />
        <CostBreakdownTable />
        <HowItWorksSection />
      </CardContent>
    </Card>
  )
}
