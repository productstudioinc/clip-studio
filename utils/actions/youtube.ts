"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import youtubeAuthClient from "../youtube";

export type YoutubeVideoStats = "private" | "public";

export const connectYoutubeAccount = async () => {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];

  const state = randomBytes(32).toString("hex");
  const authUrl = youtubeAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state: state,
    prompt: "consent", // Forces consent screen to appear — necessary b/c google only issues refresh on initial auth
  });

  redirect(authUrl);
};
