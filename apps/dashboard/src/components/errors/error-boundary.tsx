import { useEffect } from "react";
import { isAfter } from "date-fns";
import { TriangleAlert } from "lucide-react";

import { usePeriodStore } from "@/stores/period/period-store";
import { AppRouter } from "@repo/trpc/router";
import { onlineManager } from "@tanstack/react-query";
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

  // ! reset the error boundary only:
  // ! if the range is reset properly (start date before end date or period is not a custom range period)
  // ! or if the server was unreachable and is now available
  // ! don't reset the error boundary if the server is unreachable
  const isFetchFailure =
    error.message === "Failed to fetch" ||
    error.cause?.message === "Failed to fetch";
  const errorMessage = isFetchFailure
    ? `${error.message}. Please check your internet connection`
    : error.message;

  useEffect(() => {
    if (
      (!isAfter(customRange.start, customRange.end) ||
        period !== "Custom Range") &&
      !isFetchFailure
    ) {
      resetErrorBoundary();
    }
  }, [
    customRange.start,
    customRange.end,
    period,
    isFetchFailure,
    resetErrorBoundary,
  ]);

  useEffect(() => {
    if (!isFetchFailure) {
      return;
    }

    return onlineManager.subscribe((isOnline) => {
      if (isOnline) {
        resetErrorBoundary();
      }
    });
  }, [isFetchFailure, resetErrorBoundary]);

  return rest.hasCustomChildren ? (
    rest.customChildren(errorMessage)
  ) : (
    <BaseErrorComponent
      className={rest.className}
      errorMessage={errorMessage}
    />
  );
};
