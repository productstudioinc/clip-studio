'use client'

import { useAppContext } from '@/contexts/app-context'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileAudio, FileVideo, Clock, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import HeroVideoDialog from "@/components/ui/hero-video-dialog"
import { format } from 'date-fns'

export default function UserUploads() {
  const { userUploads } = useAppContext();

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  const renderUploadCard = (upload: any) => (
    <Card key={upload.id} className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base truncate max-w-[80%]">{upload.id}</span>
          {upload.status === 'completed' ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Processing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3">
        {upload.previewUrl ? (
          upload.tags?.includes('Video') ? (
            <HeroVideoDialog
              videoSrc={upload.url}
              thumbnailSrc={upload.previewUrl}
              thumbnailAlt={`Preview for ${upload.id}`}
              className="w-full aspect-video rounded-md overflow-hidden"
            />
          ) : (
            <div className="aspect-video relative rounded-md overflow-hidden">
              <Image
                src={upload.previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )
        ) : (
          <div className="bg-secondary/50 aspect-video flex items-center justify-center rounded-md">
            {upload.tags?.includes('Video') ? (
              <FileVideo className="h-12 w-12 text-muted-foreground/70" />
            ) : (
              <FileAudio className="h-12 w-12 text-muted-foreground/70" />
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start space-y-3 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {upload.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Uploaded {formatDate(upload.createdAt)}
        </span>
      </CardFooter>
    </Card>
  )

  const videoUploads = userUploads.filter(upload => upload.tags?.includes('Video'))
  const audioUploads = userUploads.filter(upload => upload.tags?.includes('Voiceover'))

  return (
    <div className="container max-w-7xl mx-auto space-y-6 py-6 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your Uploads</h1>
        {/* Could add actions here like "Upload New" button */}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all">All Uploads ({userUploads.length})</TabsTrigger>
          <TabsTrigger value="video">Videos ({videoUploads.length})</TabsTrigger>
          <TabsTrigger value="audio">Audio ({audioUploads.length})</TabsTrigger>
        </TabsList>

        {['all', 'video', 'audio'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <ScrollArea className="h-[calc(100vh-220px)]">
              {userUploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <p className="text-muted-foreground">No uploads found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(tab === 'all' 
                    ? userUploads 
                    : tab === 'video' 
                      ? videoUploads 
                      : audioUploads
                  ).map(renderUploadCard)}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

