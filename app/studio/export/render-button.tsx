import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface RenderState {
  status: "init" | "invoking" | "rendering" | "done" | "error";
  error?: { message: string };
}

export const RenderButton: React.FC<{
  renderMedia: () => void;
  state: RenderState;
}> = ({ renderMedia, state }) => {
  useEffect(() => {
    if (state.status === "error") {
      toast.error(state.error?.message || "An error occurred");
    }
  }, [state.status, state.error]);

  return (
    <Button
      disabled={state.status === "invoking" || state.status === "rendering"}
      onClick={renderMedia}
      className="w-full"
    >
      {state.status === "invoking" ||
        (state.status === "rendering" && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ))}
      Render video
    </Button>
  );
};
