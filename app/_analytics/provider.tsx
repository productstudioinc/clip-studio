// app/providers.tsx
"use client";
import { getUser } from "@/utils/actions/user";
import { User } from "@supabase/supabase-js";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true, // Enable pageleave capture
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PostHogProvider>
  );
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.app_metadata.full_name,
      });
    } else {
      posthog.reset();
    }
  }, [user]);

  return <>{children}</>;
}
