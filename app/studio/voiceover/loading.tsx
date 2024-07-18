import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function VoiceoverLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-secondary p-4 rounded-lg">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between pb-4 px-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(3)].map((_, badgeIndex) => (
                  <Skeleton
                    key={badgeIndex}
                    className="h-6 w-16 rounded-full"
                  />
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
