import { Suspense } from "react";

import { Skeleton } from "@repo/ui/components/ui/skeleton";

const SuspenseBoundary = ({
  children,
  className = "max-chart:w-full h-96 w-[45%]",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Suspense fallback={<Skeleton className={className} />}>
      {children}
    </Suspense>
  );
};

export default SuspenseBoundary;
