"use client";

import { useTemplateStore } from "@/stores/templatestore";
import { SplitScreenControls } from "./splitscreen-controls";

export default function ConfigurePage() {
  const { selectedTemplate, splitScreenState, setSplitScreenState } =
    useTemplateStore((state) => ({
      selectedTemplate: state.selectedTemplate,
      splitScreenState: state.splitScreenState,
      setSplitScreenState: state.setSplitScreenState,
    }));

  return (
    <>
      {selectedTemplate === "SplitScreen" && (
        <SplitScreenControls
          splitScreenState={splitScreenState}
          setSplitScreenState={setSplitScreenState}
        />
      )}
    </>
  );
}
