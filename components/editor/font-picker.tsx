import React, { useCallback, useEffect, useState } from 'react'

import { top100 as fonts } from '@/lib/fonts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export const FontPicker: React.FC<{
  selectedFont: string | null
  setSelectedFont: (font: string) => void
}> = ({ selectedFont, setSelectedFont }) => {
  const [loadedFonts, setLoadedFonts] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadAllFonts = async () => {
      const fontPromises = fonts.map(async (font) => {
        const loaded = await font.load()
        const { fontFamily } = loaded.loadFont()
        return { family: font.family, fontFamily }
      })

      const loadedFontFamilies = await Promise.all(fontPromises)
      const fontMap = loadedFontFamilies.reduce(
        (acc, { family, fontFamily }) => {
          acc[family] = fontFamily
          return acc
        },
        {} as { [key: string]: string }
      )

      setLoadedFonts(fontMap)
    }

    loadAllFonts()
  }, [])

  const onValueChange = useCallback(
    (value: string) => {
      setSelectedFont(loadedFonts[value] || value)
    },
    [loadedFonts, setSelectedFont]
  )

  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a font" />
      </SelectTrigger>
      <SelectContent>
        {fonts.map((f) => (
          <SelectItem
            key={f.family}
            value={f.family}
            style={{
              fontFamily: loadedFonts[f.family] || 'inherit'
            }}
          >
            {f.family}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
