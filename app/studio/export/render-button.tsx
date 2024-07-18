import { Button } from "@/components/ui/button";
import { CloudLightning, Loader2 } from "lucide-react";

interface RenderState {
  status: "init" | "invoking" | "rendering" | "done" | "error";
  error?: { message: string };
}

export const RenderButton: React.FC<{
  renderMedia: () => void;
  state: RenderState;
}> = ({ renderMedia, state }) => {
  const isLoading =
    state.status === "init" ||
    state.status === "invoking" ||
    state.status === "rendering";

  return (
    <Button
      variant={"ghost"}
      disabled={isLoading || state.status === "done"}
      onClick={renderMedia}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CloudLightning className="mr-2 h-4 w-4" />
      )}
      Render
    </Button>
  );
};
