import { useTemplateStore } from "@/stores/templatestore";
import { SplitScreenControls } from "./splitscreen-controls";
import { getBackgrounds } from "@/utils/actions/getData";
import { BackgroundSelect } from "./background-select";

export default async function ConfigurePage() {
  const backgrounds = await getBackgrounds();

  return <BackgroundSelect backgrounds={backgrounds} />;
}
