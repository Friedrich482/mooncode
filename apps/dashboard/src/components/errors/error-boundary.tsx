import { useEffect } from "react";
import { isAfter } from "date-fns";
import { TriangleAlert } from "lucide-react";

import { usePeriodStore } from "@/stores/period/period-store";
import { AppRouter } from "@repo/trpc/router";
import { TRPCClientError } from "@trpc/client";

type BaseErrorProps = {
  error: TRPCClientError<AppRouter>;
  resetErrorBoundary: () => void;
};

type WithChildrenProps = BaseErrorProps & {
  hasCustomChildren: true;
  customChildren: (errorMessage: string) => React.ReactNode;
};

type WithoutChildrenProps = BaseErrorProps & {
  hasCustomChildren: false;
  className?: string;
};

type FallBackRenderProps = WithChildrenProps | WithoutChildrenProps;

const BaseErrorComponent = ({
  errorMessage,
  className = "text-destructive max-chart:w-full relative z-0 flex min-h-96 w-[45%] items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg",
}: {
  errorMessage: string;
  className?: string;
}) => (
  <div className={className}>
    <p className="flex gap-2">
      <TriangleAlert className="size-8 shrink-0 self-start max-xl:size-6" />
      <span>{errorMessage}</span>
    </p>
  </div>
);

export const FallBackRender = ({
  error,
  resetErrorBoundary,
  ...rest
}: FallBackRenderProps) => {
  const customRange = usePeriodStore((state) => state.customRange);
  const period = usePeriodStore((state) => state.period);

  useEffect(() => {
    if (error.data?.code === "UNAUTHORIZED") {
      window.location.replace("/login");
    }
  }, [error.data?.code]);

  // reset the error boundary only if the range is reset properly (start date before end date or period changes)
  useEffect(() => {
    if (
      !isAfter(customRange.start, customRange.end) ||
      period !== "Custom Range"
    ) {
      resetErrorBoundary();
    }
  }, [customRange.start, customRange.end, period]);

  return rest.hasCustomChildren ? (
    rest.customChildren(error.message)
  ) : (
    <BaseErrorComponent
      className={rest.className}
      errorMessage={error.message}
    />
  );
};
