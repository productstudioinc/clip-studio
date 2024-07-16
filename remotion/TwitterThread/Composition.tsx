import { TwitterThreadProps } from "../../stores/templatestore";
import { Tweet } from "../../components/tweet/tweet";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Video,
} from "remotion";
import { z } from "zod";

export const TwitterThreadComposition = ({
  tweetIds,
  durationInFrames,
  backgroundVideo,
}: z.infer<typeof TwitterThreadProps> & { backgroundVideo: string }) => {
  const validTweetIds = Array.isArray(tweetIds) ? tweetIds : [];

  const frame = useCurrentFrame();
  const totalTweets = validTweetIds.length;

  const currentTweetIndex = Math.floor(
    interpolate(frame, [0, durationInFrames], [0, totalTweets], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const progress = spring({
    frame,
    fps: 30,
    config: {
      damping: 200,
      stiffness: 100,
    },
  });

  if (!validTweetIds || validTweetIds.length === 0) {
    return null;
  }

  return (
    <AbsoluteFill>
      <Video
        src="https://pub-4c7f268d86c44653aa9fcccd6761a834.r2.dev/mc.mp4"
        startFrom={0}
        endAt={durationInFrames}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        muted
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {validTweetIds.map((tweetId, index) =>
            index === currentTweetIndex ? (
              <div
                key={tweetId}
                style={{
                  width: "90%",
                  height: "90%",
                  maxWidth: "600px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: progress,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Tweet id={tweetId} />
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
