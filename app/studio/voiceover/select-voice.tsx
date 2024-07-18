"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pause, Play } from "lucide-react";
import { ElevenlabsVoices } from "@/utils/actions/elevenlabs";

export const SelectVoice: React.FC<{
  voices: ElevenlabsVoices[];
}> = ({ voices }) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handlePlayPause = (previewUrl: string | undefined, voiceId: string) => {
    if (!previewUrl) return;
    if (playingAudio === voiceId) {
      setPlayingAudio(null);
      const audio = document.getElementById(voiceId) as HTMLAudioElement;
      audio.pause();
    } else {
      if (playingAudio) {
        const currentAudio = document.getElementById(
          playingAudio
        ) as HTMLAudioElement;
        currentAudio.pause();
      }
      setPlayingAudio(voiceId);
      const newAudio = document.getElementById(voiceId) as HTMLAudioElement;
      newAudio.play();
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {voices.map((voice) => (
        <Card key={voice.voice_id} className="flex flex-col h-full">
          <CardHeader className="p-4">
            <CardTitle className="text-lg truncate">
              {voice.name || "Unnamed Voice"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between pb-4 px-4">
            {voice.labels && Object.keys(voice.labels).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.values(voice.labels).map((value, index) => (
                  <Badge key={index} variant="secondary">
                    {value}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              onClick={() => handlePlayPause(voice.preview_url, voice.voice_id)}
              className="w-full"
            >
              {playingAudio === voice.voice_id ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {playingAudio === voice.voice_id ? "Pause" : "Play"}
            </Button>
            <audio id={voice.voice_id} src={voice.preview_url} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
