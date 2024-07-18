/* eslint-disable @next/next/no-img-element */
"use client";
import { SelectBackgroundWithParts } from "@/db/schema";
import type { FC } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useTemplateStore } from "@/stores/templatestore";

type BackgroundSelectProps = {
  backgrounds: SelectBackgroundWithParts[];
};

export const BackgroundSelect: FC<BackgroundSelectProps> = ({
  backgrounds,
}) => {
  const { backgroundTheme, setBackgroundTheme, setBackgroundUrls } =
    useTemplateStore((state) => ({
      backgroundTheme: state.backgroundTheme,
      setBackgroundTheme: state.setBackgroundTheme,
      setBackgroundUrls: state.setBackgroundUrls,
    }));

  const handleSelect = (background: SelectBackgroundWithParts) => {
    setBackgroundTheme(background.name as "Minecraft" | "GTA" | "Satisfying");
    setBackgroundUrls(background.backgroundParts.map((part) => part.partUrl));
  };

  return (
    <>
      <h2 className="text-2xl font-semibold leading-none tracking-tight pt-2 pb-6">
        Select a background
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {backgrounds.map((background) => (
          <div
            key={background.id}
            onClick={() => handleSelect(background)}
            className="cursor-pointer"
          >
            <Card
              className={`h-full transition-all duration-300 ${
                backgroundTheme === background.name
                  ? "ring-2 ring-primary"
                  : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-1">
                <div className="relative w-full pt-[56.25%]">
                  <img
                    src={background.previewUrl}
                    alt={background.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
