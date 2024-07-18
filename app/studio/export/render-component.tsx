"use client";

import AnimatedCircularProgressBar from "@/components/magicui/animated-circular-progress-bar";
import { RenderButton } from "./render-button";
import { useTemplateStore } from "@/stores/templatestore";
import { useRendering } from "@/utils/helpers/use-rendering";
import { Separator } from "@/components/ui/separator";
import { ExportComponent } from "./export-component";

export function RenderControls() {
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
    <div className="flex flex-row h-40">
      <AnimatedCircularProgressBar
        max={100}
        min={0}
        state={state}
        undo={undo}
        className="w-56"
      >
        <RenderButton renderMedia={renderMedia} state={state} />
      </AnimatedCircularProgressBar>
      <Separator orientation="vertical" className="mx-4 h-full" />
      <ExportComponent state={state} undo={undo} />
    </div>
  );
}
