import { useEffect } from "react";
import { Navigate } from "react-router";
import { isAfter } from "date-fns";
import { TriangleAlert } from "lucide-react";

import { usePeriodStore } from "@/stores/period/period-store";
import { TRPCClientError } from "@trpc/client";

type BaseErrorProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

type WithChildrenProps = BaseErrorProps & {
  hasCustomChildren: true;
  customChildren: React.ReactNode;
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
}) => {
  return (
    <div className={className}>
      <p className="flex gap-2">
        <TriangleAlert className="size-8 shrink-0 self-start max-xl:size-6" />
        <span>{errorMessage}</span>
      </p>
    </div>
  );
};

export const FallBackRender = ({
  error,
  resetErrorBoundary,
  ...rest
}: FallBackRenderProps) => {
  const customRange = usePeriodStore((state) => state.customRange);

  // reset the error boundary only if the range is reset properly (start date before end date)
  useEffect(() => {
    if (!isAfter(customRange.start, customRange.end)) resetErrorBoundary();
  }, [customRange.start, customRange.end]);

  // navigate to not-found, useful for projects not found
  if (error instanceof TRPCClientError && error.data?.code === "NOT_FOUND") {
    return <Navigate to="/not-found" />;
  }

  try {
    const parsedErrors = JSON.parse(error.message);

    if (Array.isArray(parsedErrors)) {
      const errorMessages = parsedErrors.map((err) => err.message);
      return rest.hasCustomChildren ? (
        rest.customChildren
      ) : (
        <BaseErrorComponent
          className={rest.className}
          errorMessage={errorMessages[0]}
        />
      );
    }

    return rest.hasCustomChildren ? (
      rest.customChildren
    ) : (
      <BaseErrorComponent
        className={rest.className}
        errorMessage={error.message}
      />
    );
  } catch {
    return rest.hasCustomChildren ? (
      rest.customChildren
    ) : (
      <BaseErrorComponent
        className={rest.className}
        errorMessage={error.message}
      />
    );
  }
};
