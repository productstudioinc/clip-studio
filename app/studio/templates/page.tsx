import { getTemplates } from "@/utils/actions/getData";
import { TemplateSelect } from "./template-select";
import PostHogClient from "@/lib/posthog";
import { getUser } from "@/utils/actions/user";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const [templates, user] = await Promise.all([getTemplates(), getUser()]);

  if (searchParams?.login === "true" && user) {
    const posthog = PostHogClient();
    posthog.identify({
      distinctId: user.user?.id as string,
      properties: { email: user.user?.email },
    });
    await posthog.shutdown();
  }

  return <TemplateSelect templates={templates} />;
}
