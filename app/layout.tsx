import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { PHProvider } from "./provider";
import dynamic from "next/dynamic";
import { HighlightInit } from "@highlight-run/next/client";

const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Clip Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HighlightInit
        projectId={"memow6xd"}
        serviceName="clip-studio"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [],
        }}
      />
      <html lang="en">
        <PHProvider>
          <body className={GeistSans.className}>
            <PostHogPageView />
            <ThemeProvider attribute="class" defaultTheme="light">
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </body>
        </PHProvider>
      </html>
    </>
  );
}
