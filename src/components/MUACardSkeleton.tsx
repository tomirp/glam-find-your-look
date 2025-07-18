// src/components/MUACardSkeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const MUACardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        <Skeleton className="aspect-square w-full rounded-t-lg rounded-b-none" />
        <div className="p-3 md:p-4 flex flex-col flex-grow space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MUACardSkeleton;