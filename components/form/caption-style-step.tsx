'use client'

import React, { CSSProperties, useEffect, useState } from 'react'
import {
  CaptionStyle,
  captionStyleSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { motion, useAnimation } from 'framer-motion'
import { Check, ChevronDown, Paintbrush, Type, Wand2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

type CaptionStyleStepProps = {
  form: UseFormReturn<VideoProps>
}

const captionStyles: z.infer<typeof captionStyleSchema>[] = [
  {
    id: CaptionStyle.Default,
    options: {
      highlighted: {
        word: false,
        boxed: false,
        wordColor: '#FFD700',
        boxColor: '#32CD32',
        boxBorderRadius: '10px'
      },
      textColor: 'white',
      rotation: false,
      scale: false
    },
    name: 'Default',
    style: {
      color: 'white',
      fontSize: '28px',
      textTransform: 'uppercase',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center',
      lineHeight: '1.2',
      textShadow: `
        -3px -3px 0 #000,  
         3px -3px 0 #000,
        -3px  3px 0 #000,
         3px  3px 0 #000,
        -3px  0   0 #000,
         3px  0   0 #000,
         0   -3px 0 #000,
         0    3px 0 #000,
         4px 4px 0px #555,
         5px 5px 0px #444,
         6px 6px 0px #333,
         7px 7px 8px rgba(0,0,0,0.4)
      `
    } as CSSProperties
  },
  {
    id: CaptionStyle.Comic,
    options: {
      highlighted: {
        word: true,
        boxed: false,
        wordColor: '#FFD700',
        boxColor: '#32CD32',
        boxBorderRadius: '10px'
      },
      textColor: 'white',
      rotation: false,
      scale: false
    },
    name: 'Comic',
    style: {
      color: 'white',
      fontSize: '28px',
      fontFamily: 'Komika Axis, sans-serif',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: '1.2'
    } as CSSProperties
  }
]

const ColorPicker = ({
  color,
  onChange
}: {
  color: string
  onChange: (color: string) => void
}) => {
  const colors = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#00FFFF',
    '#FF00FF',
    '#C0C0C0',
    '#808080',
    '#800000',
    '#808000',
    '#008000',
    '#800080',
    '#008080',
    '#000080'
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[60px] h-[30px] p-0 border-2"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Open color picker</span>
          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-8 gap-1 mb-2">
          {colors.map((c) => (
            <Button
              key={c}
              className="w-6 h-6 rounded-md p-0 flex items-center justify-center"
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
            >
              {c === color && <Check className="h-3 w-3 text-white" />}
            </Button>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="flex items-center gap-2">
          <Label htmlFor="custom-color" className="shrink-0">
            Custom:
          </Label>
          <Input
            id="custom-color"
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 p-0 border-none"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 h-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

const CaptionPreview: React.FC<{
  style: z.infer<typeof captionStyleSchema>
}> = ({ style }) => {
  const controls = useAnimation()
  const [currentWord, setCurrentWord] = useState(0)
  const words = ['Caption', 'Preview', 'Example']

  useEffect(() => {
    const sequence = async () => {
      controls.set({ scale: 1, rotate: 0 })

      while (true) {
        for (let i = 0; i < words.length; i++) {
          setCurrentWord(i)

          if (!style.options.scale && !style.options.rotation) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            continue
          }

          await controls.start({
            scale: style.options.scale ? 1.2 : 1,
            rotate: style.options.rotation ? Math.random() * 6 - 3 : 0,
            transition: { duration: 0.5 }
          })

          await new Promise((resolve) => setTimeout(resolve, 2000))

          await controls.start({
            scale: 1,
            rotate: 0,
            transition: { duration: 0.5 }
          })
        }
      }
    }

    sequence()
    return () => controls.stop()
  }, [controls, style.options.scale, style.options.rotation, words.length])

  return (
    <div className="bg-background p-4 rounded-md flex items-center justify-center h-24 overflow-hidden">
      <motion.div
        animate={controls}
        style={{
          ...style.style,
          color: style.options.textColor,
          textShadow: `
            -2px -2px 0 #000,  
             2px -2px 0 #000,
            -2px  2px 0 #000,
             2px  2px 0 #000,
            -2px  0   0 #000,
             2px  0   0 #000,
             0   -2px 0 #000,
             0    2px 0 #000,
             3px 3px 6px rgba(0,0,0,0.3),
             4px 4px 8px rgba(0,0,0,0.2)
          `
        }}
      >
        {words.map((word, index) => (
          <span
            key={index}
            style={{
              position: 'relative',
              display: 'inline-block',
              color:
                currentWord === index && style.options.highlighted.word
                  ? style.options.highlighted.wordColor
                  : style.options.textColor,
              marginRight: '0.2em',
              padding: '0.2em'
            }}
          >
            {currentWord === index && style.options.highlighted.boxed && (
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  inset: '8px',
                  backgroundColor: style.options.highlighted.boxColor,
                  borderRadius: style.options.highlighted.boxBorderRadius,
                  zIndex: -1,
                  display: 'block',
                  padding: 0
                }}
              />
            )}
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export const CaptionStyleStep: React.FC<CaptionStyleStepProps> = ({ form }) => {
  const setCaptionStyle = useTemplateStore((state) => state.setCaptionStyle)
  const [activeSection, setActiveSection] = useState<string>('style')

  const handleCaptionStyleChange = (value: string) => {
    const selectedStyle = captionStyles.find((style) => style.id === value)
    if (selectedStyle) {
      const styleWithDefaultOptions = {
        ...selectedStyle,
        options: {
          ...selectedStyle.options,
          rotation: false,
          scale: false,
          highlighted: {
            ...selectedStyle.options.highlighted,
            word: false,
            boxed: false
          }
        }
      }
      form.setValue('captionStyle', styleWithDefaultOptions)
      setCaptionStyle(styleWithDefaultOptions)
    }
  }

  const handleHighlightingChange = (
    type: 'word' | 'boxed',
    enabled: boolean
  ) => {
    const currentStyle = form.getValues('captionStyle')
    const updatedStyle = {
      ...currentStyle,
      options: {
        ...currentStyle.options,
        highlighted: {
          ...currentStyle.options.highlighted,
          [type]: enabled
        }
      }
    }
    form.setValue('captionStyle', updatedStyle)
    setCaptionStyle(updatedStyle)
  }

  const handleToggleOption = (
    option: 'rotation' | 'scale',
    enabled: boolean
  ) => {
    const currentStyle = form.getValues('captionStyle')
    const updatedStyle = {
      ...currentStyle,
      options: {
        ...currentStyle.options,
        [option]: enabled
      }
    }
    form.setValue('captionStyle', updatedStyle)
    setCaptionStyle(updatedStyle)
  }

  const handleColorChange = (
    type: 'textColor' | 'wordColor' | 'boxColor',
    color: string
  ) => {
    const currentStyle = form.getValues('captionStyle')
    const updatedStyle = {
      ...currentStyle,
      options: {
        ...currentStyle.options,
        ...(type === 'textColor'
          ? { textColor: color }
          : {
              highlighted: {
                ...currentStyle.options.highlighted,
                [type]: color
              }
            })
      }
    }
    form.setValue('captionStyle', updatedStyle)
    setCaptionStyle(updatedStyle)
  }

  const handleBorderRadiusChange = (value: number) => {
    const currentStyle = form.getValues('captionStyle')
    const updatedStyle = {
      ...currentStyle,
      options: {
        ...currentStyle.options,
        highlighted: {
          ...currentStyle.options.highlighted,
          boxBorderRadius: `${value}px`
        }
      }
    }
    form.setValue('captionStyle', updatedStyle)
    setCaptionStyle(updatedStyle)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Caption Style</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={activeSection}
            onValueChange={(value) => setActiveSection(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="style">
                <span className="flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Style
                </span>
              </SelectItem>
              <SelectItem value="highlight">
                <span className="flex items-center">
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Highlight
                </span>
              </SelectItem>
              <SelectItem value="effects">
                <span className="flex items-center">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Effects
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {activeSection === 'style' && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="captionStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose a font</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={handleCaptionStyleChange}
                        defaultValue={field.value.id}
                        className="grid grid-cols-2 gap-4"
                      >
                        {captionStyles.map((style) => (
                          <Label
                            key={style.id}
                            className={cn(
                              'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
                              field.value.id === style.id && 'border-primary'
                            )}
                          >
                            <RadioGroupItem
                              value={style.id}
                              className="sr-only"
                            />
                            <span className="text-2xl mb-2" style={style.style}>
                              Caption Style
                            </span>
                            <span className="text-sm font-medium">
                              {style.name}
                            </span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <Label htmlFor="textColor">Text Color</Label>
                <ColorPicker
                  color={form.getValues('captionStyle').options.textColor}
                  onChange={(color) => handleColorChange('textColor', color)}
                />
              </div>
            </div>
          )}

          {activeSection === 'highlight' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="word-highlight">Word Highlighting</Label>
                  <Switch
                    id="word-highlight"
                    checked={
                      form.getValues('captionStyle').options.highlighted.word
                    }
                    onCheckedChange={(checked) =>
                      handleHighlightingChange('word', checked)
                    }
                  />
                </div>
                {form.getValues('captionStyle').options.highlighted.word && (
                  <div className="flex items-center justify-between pl-4">
                    <Label htmlFor="wordColor">Word Color</Label>
                    <ColorPicker
                      color={
                        form.getValues('captionStyle').options.highlighted
                          .wordColor
                      }
                      onChange={(color) =>
                        handleColorChange('wordColor', color)
                      }
                    />
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="box-highlight">Box Highlighting</Label>
                  <Switch
                    id="box-highlight"
                    checked={
                      form.getValues('captionStyle').options.highlighted.boxed
                    }
                    onCheckedChange={(checked) =>
                      handleHighlightingChange('boxed', checked)
                    }
                  />
                </div>
                {form.getValues('captionStyle').options.highlighted.boxed && (
                  <>
                    <div className="flex items-center justify-between pl-4">
                      <Label htmlFor="boxColor">Box Color</Label>
                      <ColorPicker
                        color={
                          form.getValues('captionStyle').options.highlighted
                            .boxColor
                        }
                        onChange={(color) =>
                          handleColorChange('boxColor', color)
                        }
                      />
                    </div>
                    <div className="space-y-2 pl-4">
                      <Label htmlFor="boxBorderRadius">Box Border Radius</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="boxBorderRadius"
                          min={0}
                          max={20}
                          step={1}
                          value={[
                            parseInt(
                              form.getValues('captionStyle').options.highlighted
                                .boxBorderRadius
                            )
                          ]}
                          onValueChange={([value]) =>
                            handleBorderRadiusChange(value)
                          }
                          className="flex-grow"
                        />
                        <span className="w-12 text-center">
                          {
                            form.getValues('captionStyle').options.highlighted
                              .boxBorderRadius
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === 'effects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="rotation">Rotation Effects</Label>
                <Switch
                  id="rotation"
                  checked={form.getValues('captionStyle').options.rotation}
                  onCheckedChange={(checked) =>
                    handleToggleOption('rotation', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="scale">Scale Effects</Label>
                <Switch
                  id="scale"
                  checked={form.getValues('captionStyle').options.scale}
                  onCheckedChange={(checked) =>
                    handleToggleOption('scale', checked)
                  }
                />
              </div>
            </div>
          )}

          <CaptionPreview style={form.getValues('captionStyle')} />
        </div>
      </CardContent>
    </Card>
  )
}
