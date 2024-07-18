"use client";
import { useTemplateStore } from "@/stores/templatestore";
import { useRendering } from "@/utils/helpers/use-rendering";
import React from "react";
import { RenderButton } from "./render-button";
import { ProgressComponent } from "./progress-component";

export const RenderControls: React.FC = () => {
  const {
    selectedTemplate,
    splitScreenState,
    redditState,
    twitterThreadState,
  } = useTemplateStore((state) => ({
    selectedTemplate: state.selectedTemplate,
    splitScreenState: state.splitScreenState,
    redditState: state.redditState,
    twitterThreadState: state.twitterThreadState,
  }));

  const inputProps =
    selectedTemplate === "SplitScreen"
      ? splitScreenState
      : selectedTemplate === "Reddit"
      ? redditState
      : twitterThreadState;

  const { renderMedia, state, undo } = useRendering(
    selectedTemplate,
    inputProps
  );

  return (
    <div>
      <RenderButton renderMedia={renderMedia} state={state} />
      <ProgressComponent state={state} undo={undo} />
    </div>
  );
};
