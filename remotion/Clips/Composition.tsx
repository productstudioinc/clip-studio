import { AbsoluteFill, OffthreadVideo } from "remotion";
import { z } from "zod";
import { AspectRatio, ClipsVideoSchema } from "../../stores/templatestore";
import Subtitle from "../Shared/Subtitle";

type ClipsCompositionProps = z.infer<typeof ClipsVideoSchema>;

export const ClipsComposition = ({
  videoUrl,
  type,
  videoPosition,
  titlePosition,
  subtitlePosition,
  videoScale,
  title,
  subtitle,
  aspectRatio,
  captionStyle,
}: ClipsCompositionProps) => {
  return (
    <div className="bg-black relative w-full h-full">
      {/* Background Blurred Video */}
      <OffthreadVideo
        src={videoUrl}
        className="absolute w-full h-full object-cover"
        style={{
          filter: "blur(10px) brightness(75%)",
          transform: "scale(1.1)",
        }}
      />
      {/* Clips Video */}
      <AbsoluteFill className="justify-center items-center overflow-hidden">
        <div
          style={{
            width: `${videoScale}%`,
            height: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${videoPosition - 50}%)`,
          }}
        >
          <OffthreadVideo
            src={videoUrl}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Title */}
      {title && (
        <Subtitle
          text={title}
          captionStyle={captionStyle}
          className={`absolute ${aspectRatio === AspectRatio.Vertical ? "text-2xl" : "text-4xl"}`}
          style={{
            top: `${titlePosition}%`,
          }}
        />
      )}

      {/* Subtitle - Positioned at the bottom */}
      {subtitle && (
        <Subtitle
          text={subtitle}
          captionStyle={captionStyle}
          className={`absolute ${aspectRatio === AspectRatio.Vertical ? "text-2xl" : "text-4xl"}`}
          style={{
            bottom: `${100 - subtitlePosition}%`,
          }}
        />
      )}

      {type === "blob" && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="text-4xl font-bold text-white">
            Uploading video...
          </div>
        </div>
      )}
    </div>
  );
};
