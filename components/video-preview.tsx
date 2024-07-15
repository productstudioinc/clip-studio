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
      component={CompositionComponent}
      inputProps={inputProps}
      durationInFrames={durationInFrames}
      fps={30}
      compositionHeight={1280}
      compositionWidth={720}
      style={{ width: "100%", backgroundColor: "bg-muted" }}
      controls
      autoPlay
      loop
      initiallyMuted
    />
  );
};
