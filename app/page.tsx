import { getTemplates } from "@/utils/actions/getData";
import { TemplateSelect } from "./template-select";
import PostHogClient from "@/lib/posthog";
import { getUser } from "@/utils/actions/user";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Hero from "./hero";
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
