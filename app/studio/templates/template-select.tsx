"use client";
import React from "react";
import { SelectTemplates } from "@/db/schema";
import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useTemplateStore } from "@/stores/templatestore";
import { useRouter } from "next/navigation";

interface TemplateSelectProps {
  templates: SelectTemplates[];
}

export const TemplateSelect: FC<TemplateSelectProps> = ({ templates }) => {
  // const router = useRouter();
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore(
    (state) => ({
      selectedTemplate: state.selectedTemplate,
      setSelectedTemplate: state.setSelectedTemplate,
    })
  );

  const handleSelect = (value: string) => {
    setSelectedTemplate(value as "SplitScreen" | "Reddit" | "TwitterThread");

    // router.push(`?template=${value}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div
          key={template.value}
          onClick={() => handleSelect(template.value)}
          className="cursor-pointer"
        >
          <Card
            className={`h-full transition-all duration-300 ${
              selectedTemplate === template.value
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="relative w-full pt-[56.25%]">
                <Image
                  src={template.previewUrl}
                  alt={template.name}
                  layout="fill"
                  className="rounded-lg"
                  unoptimized
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
