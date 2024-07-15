import { Dashboard } from "@/components/dashboard";

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Dashboard>{children}</Dashboard>
    </>
  );
}
