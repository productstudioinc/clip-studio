import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const generateStory = createServerAction().input(z.object({}))

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
  You are tasked with generating a story for a social media video that has the potential to go viral and keep users engaged. The story will consist of multiple segments, each containing a short text description (1-2 sentences) and a corresponding image description. Your goal is to create content that is captivating, shareable, and tailored to the target audience.

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

  For this 3-4 minute story, you should create approximately 12-14 segments.

  You will be provided with the following inputs: Theme

  Incorporate these inputs into your story as follows:
  1. Ensure the story aligns with the given theme
  2. Tailor the content to appeal to the target audience
  3. Structure the story to fit within the specified duration of {RANGE} minutes by creating {SEGMENTS} segments

  When crafting the text descriptions:
  - Start with a hook to grab the viewer's attention in the first segment
  - Use short, punchy sentences for easy reading
  - Include dialogue or inner thoughts to add depth
  - End with a twist or satisfying conclusion in the final segment

  For the image descriptions:
  - Describe a visually striking scene that complements the text for each segment
  - Include details on colors, expressions, and key elements
  - Ensure each image can be easily visualized and created

  Remember to focus on viral potential:
  - Include elements that encourage sharing (e.g., relatable content, humor, inspiration)
  - Create a sense of urgency or FOMO (Fear Of Missing Out)
  - Leave room for viewer interpretation or engagement

  Ensure that both the text and image descriptions work together to create a cohesive and engaging story that has the potential to go viral on social media. Each segment should flow naturally into the next, creating a seamless narrative experience for a {RANGE} minute video with {SEGMENTS} segments.`
})

console.log(JSON.stringify(result.object, null, 2))
