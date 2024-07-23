import { getTemplates } from "@/utils/actions/getData";
import { TemplateSelect } from "./template-select";
import HeroWrapper from "@/components/ui/hero-wrapper";

export default async function TemplatesPage() {
  const [templates] = await Promise.all([getTemplates()]);

  return (
    <>
      <HeroWrapper />
      <TemplateSelect templates={templates} />
    </>
  );
}
