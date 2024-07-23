import { getUser } from "@/utils/actions/user";

export default async function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getUser();
  return <>{children}</>;
}
