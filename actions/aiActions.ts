'use server'

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const generateStoryScript = createServerAction()
  .input(
    z.object({
      prompt: z.string(),
      range: z.string(),
      segments: z.string()
    })
  )
  .handler(async ({ input }) => {
    const { prompt, range, segments } = input

    const result = await generateObject({
      model: openai('gpt-4o-mini', {
        structuredOutputs: true
      }),
      schemaName: 'story',
      schemaDescription:
        'A story object containing an array of segments, each with text and an image description',
      schema: z.object({
        segments: z.array(
          z.object({
            text: z.string(),
            imageDescription: z.string()
          })
        )
      }),
      prompt: `
      You are tasked with generating a story for a video that has the potential to go viral and keep users engaged. The story will consist of multiple segments, each containing a short text description (1-2 sentences) and a corresponding image description. Your goal is to create content that is captivating, shareable, and tailored to the target audience.

      Guidelines for creating engaging content:
      - Keep each segment concise and impactful
      - Use emotional triggers (e.g., surprise, joy, curiosity)
      - Incorporate relatable situations or characters
      - Create a narrative arc with a clear beginning, middle, and end across all segments
      - Use vivid language to paint a picture in the viewer's mind

      The story should be 3-4 minutes long. Use the following guidelines for the number of segments:
      - Short story (1-2 minutes): 6-7 segments
      - Medium story (3-4 minutes): 12-14 segments
      - Long story (5-7 minutes): 18-21 segments

      For this ${range} minute story, you should create approximately ${segments} segments.

      The theme of the story is ${prompt}.

      Incorporate these inputs into your story as follows:
      1. Ensure the story aligns with the given theme
      2. Tailor the content to appeal to the target audience
      3. Structure the story to fit within the specified duration of ${range} minutes by creating ${segments} segments

      When crafting the text descriptions:
      - Start with a hook to grab the viewer's attention in the first segment
      - Use short, punchy sentences for easy reading
      - Include dialogue or inner thoughts to add depth
      - End with a twist or satisfying conclusion in the final segment

      For the image descriptions:
      - Each description MUST be completely self-contained and individually discernible
      - Always include full names of key characters in every relevant description
      - Incorporate specific details related to the story's theme or historical context
      - Include relevant keywords, time period, or setting information in every description
      - Ensure each description clearly connects to the overall narrative theme
      - Provide enough context that someone unfamiliar with the story would understand the image's significance
      - Use 20-30 words to capture all necessary details while remaining concise
      - Avoid any references to previous segments or ongoing narrative
      - Use clear, specific language to convey the main image concept
      - Strictly avoid content that could violate social media terms of service
      - Keep all content family-friendly and suitable for a general audience

      Example:
      Instead of: "A diverse group of people stand together in a park, holding hands and smiling."
      Write: "Dr. Martin Luther King Jr. leads a diverse group in a 1960s civil rights march, their determined faces reflecting hope for equality and justice in America."

      Remember to focus on viral potential:
      - Include elements that encourage sharing (e.g., relatable content, humor, inspiration)
      - Create a sense of urgency or FOMO (Fear Of Missing Out)
      - Leave room for viewer interpretation or engagement

      Ensure that both the text and image descriptions work together to create a cohesive and engaging story that has the potential to go viral on social media. Each segment should flow naturally into the next, creating a seamless narrative experience for a ${range} minute video with ${segments} segments.`
    })

    return result.object.segments
  })
