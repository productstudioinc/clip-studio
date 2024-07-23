import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="h-full">
            <CardContent className="p-1">
              <div className="relative w-full pt-[56.25%]">
                <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
