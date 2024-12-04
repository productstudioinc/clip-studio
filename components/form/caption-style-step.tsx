'use client'

import React, { CSSProperties } from 'react'
import { CaptionComponent } from '@/remotion/Shared/caption'
import {
  CaptionStyle,
  captionStyleSchema,
  useTemplateStore,
  VideoProps
} from '@/stores/templatestore'
import { Caption } from '@remotion/captions'
import { Player } from '@remotion/player'
import { Check, ChevronDown, Paintbrush, Type, Wand2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
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
        boxBorderRadius: '10px',
        boxInset: '0%'
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
        boxed: true,
        wordColor: '#FFD700',
        boxColor: '#32CD32',
        boxBorderRadius: '10px',
        boxInset: '10% 3% -10% 3%'
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
  const captions: Caption[] = [
    {
      text: 'Using',
      startMs: 0,
      endMs: 500,
      timestampMs: 250,
      confidence: null
    },
    {
      text: ' clip studio',
      startMs: 500,
      endMs: 1000,
      timestampMs: 750,
      confidence: null
    },
    {
      text: ' you ',
      startMs: 1000,
      endMs: 1250,
      timestampMs: 1125,
      confidence: null
    },
    {
      text: ' can ',
      startMs: 1250,
      endMs: 1500,
      timestampMs: 1375,
      confidence: null
    },
    {
      text: ' make ',
      startMs: 1500,
      endMs: 2000,
      timestampMs: 1750,
      confidence: null
    },
    {
      text: ' some',
      startMs: 2000,
      endMs: 2500,
      timestampMs: 2250,
      confidence: null
    },
    {
      text: ' dope',
      startMs: 2500,
      endMs: 3000,
      timestampMs: 2750,
      confidence: null
    },
    {
      text: ' videos',
      startMs: 3000,
      endMs: 3500,
      timestampMs: 3250,
      confidence: null
    }
  ]
  return (
    <div className="w-full h-full aspect-video rounded-md overflow-hidden">
      <Player
        component={CaptionComponent as any}
        durationInFrames={110}
        fps={30}
        autoPlay
        loop
        controls
        compositionWidth={16 * 50}
        compositionHeight={9 * 30}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage:
            'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
          backgroundSize: '20px 20px',
          backgroundColor: '#fff',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
        inputProps={{
          captions,
          styles: style.style,
          options: style.options
        }}
      />
    </div>
  )
}

export const CaptionStyleStep: React.FC<CaptionStyleStepProps> = ({ form }) => {
  const setCaptionStyle = useTemplateStore((state) => state.setCaptionStyle)

  const handleCaptionStyleChange = (value: string) => {
    const selectedStyle = captionStyles.find((style) => style.id === value)
    if (selectedStyle) {
      form.setValue('captionStyle', selectedStyle)
      setCaptionStyle(selectedStyle)
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
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Caption Style</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="style">
              <AccordionTrigger>
                <span className="flex items-center">
                  <Type className="w-4 h-4 mr-2" />
                  Style
                </span>
              </AccordionTrigger>
              <AccordionContent>
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
                                  field.value.id === style.id &&
                                    'border-primary'
                                )}
                              >
                                <RadioGroupItem
                                  value={style.id}
                                  className="sr-only"
                                />
                                <span
                                  className="text-2xl mb-2"
                                  style={style.style}
                                >
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
                      onChange={(color) =>
                        handleColorChange('textColor', color)
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="highlight">
              <AccordionTrigger>
                <span className="flex items-center">
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Highlight
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="word-highlight">Word Highlighting</Label>
                      <Switch
                        id="word-highlight"
                        checked={
                          form.getValues('captionStyle').options.highlighted
                            .word
                        }
                        onCheckedChange={(checked) =>
                          handleHighlightingChange('word', checked)
                        }
                      />
                    </div>
                    {form.getValues('captionStyle').options.highlighted
                      .word && (
                      <div className="flex items-center justify-between">
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
                          form.getValues('captionStyle').options.highlighted
                            .boxed
                        }
                        onCheckedChange={(checked) =>
                          handleHighlightingChange('boxed', checked)
                        }
                      />
                    </div>
                    {form.getValues('captionStyle').options.highlighted
                      .boxed && (
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
                          <Label htmlFor="boxBorderRadius">
                            Box Border Radius
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Slider
                              id="boxBorderRadius"
                              min={0}
                              max={20}
                              step={1}
                              value={[
                                parseInt(
                                  form.getValues('captionStyle').options
                                    .highlighted.boxBorderRadius
                                )
                              ]}
                              onValueChange={([value]) =>
                                handleBorderRadiusChange(value)
                              }
                              className="flex-grow"
                            />
                            <span className="w-12 text-center">
                              {
                                form.getValues('captionStyle').options
                                  .highlighted.boxBorderRadius
                              }
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="effects">
              <AccordionTrigger>
                <span className="flex items-center">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Effects
                </span>
              </AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <CaptionPreview style={form.getValues('captionStyle')} />
        </div>
      </CardContent>
    </Card>
  )
}
