import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import dynamic from "next/dynamic";
import { HighlightInit } from "@highlight-run/next/client";
import { Dashboard } from "@/components/dashboard";
import { getUser } from "@/utils/actions/user";
import { PHProvider } from "./_analytics/provider";

const PostHogPageView = dynamic(() => import("./_analytics/PostHogPageView"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Clip Studio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getUser();
  return (
    <>
      <HighlightInit
        projectId={process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
        serviceName="clip-studio"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
        }}
        debug
      />
      <html lang="en">
        <PHProvider>
          <body className={GeistSans.className}>
            <PostHogPageView />
            <ThemeProvider attribute="class" defaultTheme="light">
              <Dashboard user={user}>{children}</Dashboard>
              <Toaster position="top-right" />
            </ThemeProvider>
          </body>
        </PHProvider>
      </html>
    </>
  );
}
