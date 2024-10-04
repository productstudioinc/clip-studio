export const parseS3Url = (url: string) => {
  const parsedUrl = new URL(url)

  if (!parsedUrl.hostname.includes('.amazonaws.com')) {
    throw new Error('Invalid S3 URL')
  }

  let bucketName, key

  // Check if the URL contains 's3' or 's3-region' in the hostname
  const hostnameParts = parsedUrl.hostname.split('.')
  if (hostnameParts[0] === 's3' || hostnameParts[1] === 's3') {
    // Format: s3.amazonaws.com/bucket-name/key or bucket-name.s3.amazonaws.com/key
    bucketName = parsedUrl.pathname.split('/')[1]
    key = parsedUrl.pathname.split('/').slice(2).join('/')
  } else {
    // Format: bucket-name.s3-region.amazonaws.com/key
    bucketName = hostnameParts[0]
    key = parsedUrl.pathname.slice(1) // Remove leading '/'
  }

  return { bucketName, key }
}
