import { Button } from "@/components/ui/button";
import { fetchUserConnectSocialMediaAccounts } from "@/utils/actions/socialMediaAccounts";
import { getUser } from "@/utils/actions/user";
import { connectYoutubeAccount } from "@/utils/actions/youtube";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProfilePage() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }
  const { youtubeChannels } = await fetchUserConnectSocialMediaAccounts(
    user.id
  );
  return (
    <main className="flex flex-col">
      <div>connected accs</div>
      <div>youtube channels</div>
      <form action={connectYoutubeAccount}>
        <Button>Connect YouTube</Button>
      </form>
      <div>youtubeChannels</div>
      {youtubeChannels.map((channel) => (
        <div key={channel.id}>
          <img src={channel.profile_picture_path} />
          <div>{channel.channelCustomUrl}</div>
          <div>{channel.error}</div>
        </div>
      ))}
    </main>
  );
}
