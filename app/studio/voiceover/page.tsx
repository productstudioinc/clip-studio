import { getVoices } from "@/utils/actions/elevenlabs";
import { SelectVoice } from "./select-voice";

export default async function VoiceoverPage() {
  const voices = await getVoices();
  return <SelectVoice voices={voices} />;
}
