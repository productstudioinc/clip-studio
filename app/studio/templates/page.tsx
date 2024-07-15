import { getTemplates } from "@/utils/actions/getTemplates";
import { TemplateSelect } from "./template-select";
export default async function TemplatesPage() {
  const templates = await getTemplates();
  return <TemplateSelect templates={templates} />;
}
