"use client";

import { Player } from "@remotion/player";
import React from "react";
import useTemplateConfig from "../stores/templateConfig";

export const VideoPreview = () => {
  const {
    component: CompositionComponent,
    state: inputProps,
    durationInFrames,
  } = useTemplateConfig();

  return (
    <Player
      component={CompositionComponent as any}
      inputProps={inputProps}
      durationInFrames={durationInFrames}
      fps={30}
      compositionHeight={1280}
      compositionWidth={720}
      style={{ width: "100%" }}
      controls
      autoPlay
      loop
      initiallyMuted
    />
  );
};
