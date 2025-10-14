import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Suspense } from "react";

const SuspenseBoundary = ({
  children,
  className,
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
