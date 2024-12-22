'use client'

import { useState } from 'react'
import { useAppContext } from '@/contexts/app-context'
import { SelectUserUploads } from '@/db/schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Image, Video, Music, File } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export function AssetPicker({
  tags,
  onSelect,
  selectedAsset,
}: {
  tags: string[]
  onSelect: (asset: SelectUserUploads) => void
  selectedAsset?: SelectUserUploads | null
}) {
  const { userUploads } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<SelectUserUploads | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredUploads = userUploads.filter((upload) => {
    if (!upload.tags) return false
    if (selectedTag) {
      return upload.tags.includes(selectedTag)
    }
    return tags.some(tag => upload.tags?.includes(tag))
  })

  const handleSelect = (asset: SelectUserUploads) => {
    onSelect(asset)
    setIsOpen(false)
    setPreviewAsset(null)
  }

  const renderAssetIcon = (asset: SelectUserUploads) => {
    if (asset.tags?.includes('Video')) return <Video className="w-6 h-6 text-blue-500" />
    if (asset.tags?.includes('Image')) return <Image className="w-6 h-6 text-green-500" />
    if (asset.tags?.includes('Audio')) return <Music className="w-6 h-6 text-purple-500" />
    return <File className="w-6 h-6 text-gray-500" />
  }

  const renderDetailedPreview = (asset: SelectUserUploads | null) => {
    if (!asset || !asset.tags) return null

    if (asset.tags.includes('Video')) {
      return (
        <video 
          src={asset.url} 
          controls 
          className="w-full h-[200px] object-contain bg-black rounded-md"
        />
      )
    }

    if (asset.tags.includes('Image')) {
      return (
        <img 
          src={asset.previewUrl || asset.url} 
          alt="Asset preview" 
          className="w-full h-[200px] object-contain bg-black rounded-md"
        />
      )
    }

    if (asset.tags.includes('Audio')) {
      return (
        <div className="w-full p-4 rounded-md bg-secondary">
          <audio src={asset.url} controls className="w-full" />
        </div>
      )
    }

    return null
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-[150px] h-[150px] p-0 overflow-hidden"
        onClick={() => {
          setIsOpen(true)
          setPreviewAsset(selectedAsset || null)
        }}
      >
        {selectedAsset ? (
          <img src={selectedAsset.previewUrl || selectedAsset.url} alt="Selected asset" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted-foreground">Select Asset</span>
        )}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select an Asset</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 h-[500px]">
            <ScrollArea className="w-full">
              <div className="flex gap-2 flex-wrap pb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-4 flex-1 min-h-0">
              <ScrollArea className="flex-1 border rounded-md p-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  <AnimatePresence>
                    {filteredUploads.map((asset) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`cursor-pointer transition-all ${
                          previewAsset?.id === asset.id ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'
                        }`}
                        onClick={() => setPreviewAsset(asset)}
                      >
                        <div className="aspect-square bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                          {asset.previewUrl || asset.tags?.includes('Image') ? (
                            <img src={asset.previewUrl || asset.url} alt="Asset preview" className="h-full w-full object-cover" />
                          ) : (
                            renderAssetIcon(asset)
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
              <ScrollArea className="w-[300px] flex flex-col">
                {previewAsset ? (
                  <>
                    {renderDetailedPreview(previewAsset)}
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Asset Details</h3>
                      <p className="text-sm mb-1"><span className="font-medium">Filename:</span> {previewAsset.url.split('/').pop()}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Type:</span> {previewAsset.tags?.join(', ')}</p>
                      <p className="text-sm"><span className="font-medium">Created:</span> {previewAsset.createdAt.toLocaleString()}</p>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleSelect(previewAsset)}
                    >
                      Confirm Selection
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select an asset to preview
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

