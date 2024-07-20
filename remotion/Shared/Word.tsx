import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["700"],
});

export const Word: React.FC<{
  enterProgress: number;
  text: string;
  stroke: boolean;
}> = ({ enterProgress, text, stroke }) => {
  const { width } = useVideoConfig();
  const desiredFontSize = 64;

  const splitText = (text: string, maxWordsPerLine: number) => {
    const words = text.split(" ");
    const lines = [];
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      lines.push(words.slice(i, i + maxWordsPerLine).join(" "));
    }
    return lines;
  };

  const textLines = splitText(text, 5);

  const fontSizes = textLines.map(
    (line) =>
      fitText({
        fontFamily,
        text: line,
        withinWidth: width * 0.7,
      }).fontSize
  );

  const minFontSize = Math.min(desiredFontSize, ...fontSizes);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        top: undefined,
        bottom: 350,
        height: 150,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {textLines.map((line, index) => (
        <div
          key={index}
          style={{
            fontSize: minFontSize,
            color: "white",
            WebkitTextStroke: stroke ? "10px black" : undefined,
            transform: makeTransform([
              scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
              translateY(interpolate(enterProgress, [0, 1], [50, 0])),
            ]),
            fontFamily,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};
