"use server";
import { ElevenLabsClient } from "elevenlabs";

const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY!,
});

export const getVoices = async () => {
  const voices = await elevenLabsClient.voices.getAll();
  console.log(voices);
  const filteredVoices = voices.voices.map((voice) => ({
    voice_id: voice.voice_id,
    name: voice.name,
    description: voice.description,
    samples: voice.samples,
    labels: voice.labels,
    preview_url: voice.preview_url,
  }));
  return filteredVoices;
};

export type ElevenlabsVoices = Awaited<ReturnType<typeof getVoices>>[number];
