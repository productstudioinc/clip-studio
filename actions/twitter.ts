'use server'

import { getTweet } from 'react-tweet/api'

export const fetchTweet = async (tweetId: string) => {
  const tweetData = await getTweet(tweetId)
  if (!tweetData) {
    return null
  }
  return tweetData
}
