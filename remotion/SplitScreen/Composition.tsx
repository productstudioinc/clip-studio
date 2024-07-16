import { useCallback, useEffect, useState, CSSProperties } from "react";
import {
  AbsoluteFill,
  Sequence,
  delayRender,
  continueRender,
  cancelRender,
  OffthreadVideo,
} from "remotion";
import { z } from "zod";
import { SplitScreenProps } from "../../stores/templatestore";
import Subtitle from "../Shared/Subtitle";

export type SubtitleProp = {
  startFrame: number;
  endFrame: number;
  text: string;
};

const FPS = 30;
const OFFSET_FRAMES = -5; // Adjust this value to synchronize subtitles better

export const SplitScreenComposition = ({
  videoUrl,
  type,
  backgroundUrl,
  transcription,
}: z.infer<typeof SplitScreenProps>) => {
  const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
  const [handle] = useState(() => delayRender());

  const generateSubtitles = useCallback(() => {
    try {
      const { chunks } = transcription;
      const subtitlesData: SubtitleProp[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const { timestamp, text } = chunks[i];
        const startFrame = Math.floor(timestamp[0] * FPS) + OFFSET_FRAMES;
        const endFrame = Math.floor(timestamp[1] * FPS) + OFFSET_FRAMES;

        subtitlesData.push({
          startFrame,
          endFrame,
          text,
        });
      }

      setSubtitles(subtitlesData);
      continueRender(handle);
    } catch (e) {
      console.error("Error in generateSubtitles:", e);
      cancelRender(e);
    }
  }, [transcription, handle]);

  useEffect(() => {
    generateSubtitles();
  }, [generateSubtitles]);

  const videoStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: type === "blob" ? 0.5 : 1,
  };

  const subtitleStyle: CSSProperties = {
    position: "absolute",
    bottom: "10%",
    width: "100%",
    textAlign: "center",
    fontSize: "24px",
    color: "white",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: "50%",
        }}
      >
        <OffthreadVideo src={videoUrl} style={videoStyle} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "50%",
        }}
      >
        <OffthreadVideo src={backgroundUrl} style={videoStyle} muted />
      </div>
      {subtitles.map((subtitle, index) =>
        subtitle.startFrame < subtitle.endFrame ? (
          <Sequence
            from={subtitle.startFrame}
            durationInFrames={subtitle.endFrame - subtitle.startFrame}
            key={index}
          >
            <div style={subtitleStyle}>
              <Subtitle text={subtitle.text} />
            </div>
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
};
