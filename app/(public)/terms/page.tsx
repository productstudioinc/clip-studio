import { allPages } from "@/.content-collections/generated";
import LegalPage from "@/components/legal-page";
import { constructMetadata } from "@/lib/seo-utils";
import { Metadata } from "next";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Service | Clip Studio",
});

export default function Terms() {
  const post = allPages.find((post) => post.slug === "terms")!;
  return <LegalPage page={post} />;
}
