"use server";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AwsRegion, getAwsClient } from "@remotion/lambda/client";
import { v4 } from "uuid";
export const generatePresignedUrl = async (
  contentType: string,
  contentLength: number
): Promise<{ presignedUrl: string; readUrl: string }> => {
  if (contentLength > 1024 * 1024 * 200) {
    throw new Error(
      `File may not be over 200MB. Yours is ${contentLength} bytes.`
    );
  }
  const { client, sdk } = getAwsClient({
    region: process.env.REMOTION_AWS_REGION as AwsRegion,
    service: "s3",
  });
  const key = v4();
  const command = new sdk.PutObjectCommand({
    Bucket: "videogen-user-files",
    Key: key,
    ContentLength: contentLength,
    ContentType: contentType,
  });
  const presignedUrl = await getSignedUrl(client, command, {
    expiresIn: 1800,
  });
  // The location of the asset after the upload
  const readUrl = `https://videogen-user-files.s3.${process.env.REMOTION_AWS_REGION}.amazonaws.com/${key}`;
  return { presignedUrl, readUrl };
};
