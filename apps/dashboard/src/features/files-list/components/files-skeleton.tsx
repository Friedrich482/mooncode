import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";

import { Icon } from "@repo/ui/components/ui/icon";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const FilesSkeleton = () => {
  return (
    <div className="flex h-239 flex-1 flex-col items-start justify-start gap-4 max-[42rem]:gap-8">
      <Skeleton className="max-chart:w-full h-225 w-full" />
      <div className="mt-auto flex items-center justify-start gap-2">
        <Icon
          Icon={ChevronsLeft}
          className="hover:bg-background hover:text-foreground cursor-not-allowed"
        />
        <Icon
          Icon={ChevronLeft}
          className="hover:bg-background hover:text-foreground cursor-not-allowed"
        />
        <Icon
          Icon={ChevronRight}
          className="hover:bg-background hover:text-foreground cursor-not-allowed"
        />
      </div>
    </div>
  );
};
