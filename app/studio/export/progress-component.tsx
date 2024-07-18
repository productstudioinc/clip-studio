import React from "react";
import { State } from "@/utils/helpers/use-rendering";
import { ProgressBar } from "./progress-bar";
import { DownloadButton } from "./download-button";

export const ProgressComponent: React.FC<{
  state: State;
  undo: () => void;
}> = ({ state, undo }) => {
  return (
    <>
      {state.status === "rendering" || state.status === "done" ? (
        <>
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <DownloadButton undo={undo} state={state} />
        </>
      ) : null}
    </>
  );
};
