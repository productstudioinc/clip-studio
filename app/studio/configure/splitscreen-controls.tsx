import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generatePresignedUrl } from "@/utils/actions/generatePresignedUrl";
import { z } from "zod";
import { SplitScreenProps, useTemplateStore } from "@/stores/templatestore";
import { getVideoMetadata } from "@remotion/media-utils";
import { toast } from "sonner";

export const SplitScreenControls: React.FC = ({}) => {
  const { splitScreenState, setSplitScreenState } = useTemplateStore(
    (state) => ({
      splitScreenState: state.splitScreenState,
      setSplitScreenState: state.setSplitScreenState,
    })
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files === null) {
      return;
    }

    const file = event.target.files[0];

    const MAX_FILE_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 200mb");
      return;
    }

    const blobUrl = URL.createObjectURL(file);

    setSplitScreenState({
      ...splitScreenState,
      type: "blob",
      videoUrl: blobUrl,
    });

    const contentType = file.type || "application/octet-stream";
    const arrayBuffer = await file.arrayBuffer();
    const contentLength = arrayBuffer.byteLength;

    const { presignedUrl, readUrl } = await generatePresignedUrl(
      contentType,
      contentLength
    );

    await fetch(presignedUrl, {
      method: "PUT",
      body: arrayBuffer,
      headers: {
        "Content-Type": contentType,
      },
    });

    const { durationInSeconds } = await getVideoMetadata(readUrl);

    setSplitScreenState({
      ...splitScreenState,
      type: "cloud",
      videoUrl: readUrl,
      durationInFrames: Math.floor(durationInSeconds * 30),
      transcriptionId: "",
      transcription: {
        text: "",
        chunks: [],
      },
    });

    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
      <Label htmlFor="video">Your Video</Label>
      <p className="text-sm text-muted-foreground">Max 200mb</p>
      <Input
        id="video"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
