"use client";
import { SelectBackgroundWithParts } from "@/db/schema";
import type { FC } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BackgroundSelectProps = {
  backgrounds: SelectBackgroundWithParts[];
};

export const BackgroundSelect: FC<BackgroundSelectProps> = ({
  backgrounds,
}) => {
  return (
    <>
      <h2 className="text-2xl font-semibold leading-none tracking-tight pt-2 pb-6">
        Select a background
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {backgrounds.map((background) => (
          <div key={background.id} className="cursor-pointer">
            <Card className="h-full transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">{background.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="relative w-full pt-[56.25%]">
                  <Image
                    src={background.previewUrl}
                    alt={background.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    unoptimized
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};
