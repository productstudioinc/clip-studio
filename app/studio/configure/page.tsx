import { getBackgrounds } from "@/utils/actions/getData";
import { BackgroundSelect } from "./background-select";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const BackgroundSelectWrapper = async () => {
  const backgrounds = await getBackgrounds();
  return <BackgroundSelect backgrounds={backgrounds} />;
};

export default function ConfigurePage() {
  return (
    <Suspense fallback={<BackgroundSelectSkeleton />}>
      <BackgroundSelectWrapper />
    </Suspense>
  );
}

const BackgroundSelectSkeleton: React.FC = () => {
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
};
