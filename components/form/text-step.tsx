'use client'

import React from 'react'
import { VideoProps } from '@/stores/templatestore'
import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

type TextStepProps = {
  form: UseFormReturn<VideoProps>
}

export const TextStep: React.FC<TextStepProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Text and Position</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter video title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titlePosition"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Title Position</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {field.value}%
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter video subtitle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitlePosition"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Subtitle Position</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {field.value}%
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="videoPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Position</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={100}
                      step={1}
                      className="flex-grow"
                    />
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {field.value}%
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="videoScale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Scale</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={10}
                      max={200}
                      step={1}
                      className="flex-grow"
                    />
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {field.value}%
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
