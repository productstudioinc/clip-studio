import { redirect } from 'next/navigation'
import { getUser } from '@/actions/auth/user'
import { fetchUserConnectSocialMediaAccounts } from '@/actions/db/social-media-queries'
import { connectTiktokAccount } from '@/actions/tiktok'
import { connectYoutubeAccount } from '@/actions/youtube'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from '@/components/forms/profile'
import { Icons } from '@/components/icons'

import {
  DeleteAccount,
  DeleteTikTokAccount,
  DeleteYoutubeAccount
} from './delete-account'

export default async function Account() {
  const { user } = await getUser()

  if (!user) {
    redirect('/')
  }

  const { youtubeChannels, tiktokAccounts } =
    await fetchUserConnectSocialMediaAccounts(user.id)

  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Account</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
        <nav className="grid gap-4 text-sm text-muted-foreground xl:hidden">
          <h2 className="font-semibold text-primary text-xl">General</h2>
        </nav>
        <div className="grid gap-6">
          {/* <nav className="hidden xl:grid gap-4 text-sm text-muted-foreground">
							<Link href="#" className="font-semibold text-primary text-xl">
								General
							</Link>
						</nav> */}
          <div className="grid gap-6">
            <ProfileForm user={user} />
            <Separator />
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4">
                <Card className="border-dashed min-h-[200px] flex flex-col text-balance text-center w-[250px] flex-shrink-0">
                  <CardHeader>
                    <CardTitle>Connect YouTube</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1">
                    <form
                      action={connectYoutubeAccount}
                      className="w-full flex items-end"
                    >
                      <Button size="sm" className="w-full">
                        <Icons.youtube className="size-9 mr-2" />
                        Connect Youtube
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                {youtubeChannels.map((channel) => (
                  <Card
                    key={channel.id}
                    className="justify-center min-h-[200px] text-center w-[250px] flex-shrink-0"
                  >
                    <CardHeader>
                      <CardTitle>{channel.channelCustomUrl}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 justify-center">
                        <Avatar className="size-20">
                          <AvatarImage
                            src={channel.profile_picture_path as string}
                            alt={`${channel.channelCustomUrl} profile`}
                          />
                          <AvatarFallback>
                            {channel.channelCustomUrl[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {channel.error && (
                            <p className="text-red-500">{channel.error}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <DeleteYoutubeAccount channelId={channel.id} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <Separator />
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4">
                <Card className="border-dashed min-h-[200px] flex flex-col text-balance text-center w-[250px] flex-shrink-0">
                  <CardHeader>
                    <CardTitle>Connect TikTok</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1">
                    <form
                      action={connectTiktokAccount}
                      className="w-full flex items-end"
                    >
                      <Button size="sm" className="w-full">
                        <Icons.tiktok className="size-6 mr-2" />
                        Connect TikTok
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                {tiktokAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className="justify-center min-h-[200px] text-center w-[250px] flex-shrink-0"
                  >
                    <CardHeader>
                      <CardTitle>{account.account_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 justify-center">
                        <Avatar className="size-20">
                          <AvatarImage
                            src={account.profile_picture_path as string}
                            alt={`${account.account_name} profile`}
                          />
                          <AvatarFallback>
                            {account.account_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {account.error && (
                            <p className="text-red-500">{account.error}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <DeleteTikTokAccount accountId={account.id} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold">Danger Zone</h2>
              <DeleteAccount />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
