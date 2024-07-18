import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="h-full">
          <CardHeader className="p-4">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-4 px-4">
            <div className="relative w-full pt-[60%]">
              <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
