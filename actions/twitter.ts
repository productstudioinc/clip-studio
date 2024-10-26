'use server'

import { getTweet } from 'react-tweet/api'

export const fetchTweet = async (tweetId: string) => {
  const tweetData = await getTweet(tweetId)
  console.log('tweetData', tweetData)
  return {
    name: tweetData.user.name,
  }
}
