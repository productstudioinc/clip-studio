import { getBackgrounds, getTemplates } from "@/utils/actions/getData";
import { TemplateSelect } from "./template-select";
export default async function TemplatesPage() {
  const templates = await getTemplates();
  const backgrounds = await getBackgrounds();
  return <TemplateSelect templates={templates} />;
}
