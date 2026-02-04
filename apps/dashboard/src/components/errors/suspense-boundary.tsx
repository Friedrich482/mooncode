import { Suspense } from "react";

import { Skeleton } from "@repo/ui/components/ui/skeleton";

type CustomSkeletonProps = {
  skeleton: React.ReactNode;
  children: React.ReactNode;
  hasCustomSkeleton: true;
};

type WithoutCustomSkeletonProps = {
  className?: string;
  children: React.ReactNode;
  hasCustomSkeleton: false;
};

type Props = CustomSkeletonProps | WithoutCustomSkeletonProps;

export const SuspenseBoundary = ({ children, ...rest }: Props) => {
  return rest.hasCustomSkeleton ? (
    <Suspense fallback={rest.skeleton}>{children}</Suspense>
  ) : (
    <Suspense
      fallback={
        <Skeleton
          className={rest.className || "max-chart:w-full h-96 w-[45%]"}
        />
      }
    >
      {children}
    </Suspense>
  );
};
