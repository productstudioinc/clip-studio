export const CREDIT_CONVERSIONS = {
  EXPORT_SECONDS: 5, // 1 credit per 5 seconds of video (Math.ceil(durationinframes / 30 / 5))
  VOICEOVER_CHARACTERS: 100, // 1 credit per 100 characters
  TRANSCRIBE_SECONDS: 10,
  IMAGE_GENERATION: 10, // Now this correctly represents 10 credits per image
  SCRIPT_GENERATION: 1
}

export const UTM_COOKIE_NAME = '_utm'
