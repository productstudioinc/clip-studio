import { Button } from "@/components/ui/button";
import { CloudLightning } from "lucide-react";

interface RenderState {
  status: "init" | "invoking" | "rendering" | "done" | "error";
  error?: { message: string };
}

export const RenderButton: React.FC<{
  renderMedia: () => void;
  state: RenderState;
}> = ({ renderMedia, state }) => {
  return (
    <Button
      variant={"ghost"}
      disabled={
        (state.status === "init",
        state.status === "invoking" ||
          state.status === "rendering" ||
          state.status === "done")
      }
      onClick={renderMedia}
    >
      <CloudLightning className="mr-2 h-4 w-4" />
      Render
    </Button>
  );
};
