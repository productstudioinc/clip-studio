"use server";

import { db } from "@/db";
import { youtubeChannels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getYoutubeChannelInfo } from "./youtube";
import { Credentials } from "google-auth-library";

export const fetchUserConnectSocialMediaAccounts = async (userId: string) => {
  const youtubeChannelsResponse = await db
    .select()
    .from(youtubeChannels)
    .where(eq(youtubeChannels.userId, userId));

  const youtubeChannelsWithSignedUrl = youtubeChannels
    ? await Promise.all(
        youtubeChannelsResponse?.map(async (channel) => {
          const channelInfo = await getYoutubeChannelInfo(
            channel.credentials as Credentials
          );
          return {
            ...channel,
            profile_picture_path: channelInfo?.thumbnail,
            min_video_duration: 3,
            max_video_duration: 60,
            max_video_size: 1024 * 1024 * 1024 * 256,
            error: channelInfo ? "" : "Please reconnect your Youtube Channel",
          };
        })
      )
    : [];
  return {
    youtubeChannels: youtubeChannelsWithSignedUrl,
  };
};
