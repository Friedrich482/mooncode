import { lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ChartGroupWrapper } from "@/components/common/chart-group-wrapper";
import { FallBackRender } from "@/components/errors/error-boundary";
import { SuspenseBoundary } from "@/components/errors/suspense-boundary";
import { FilesList } from "@/features/files-list/components/files-list";
import { ProjectGeneralStatsChart } from "@/features/project-general-stats-charts/components/project-general-stats-chart";
import { ProjectTitle } from "@/features/project-title/components/project-title";

const ProjectTimeOnPeriodChart = lazy(async () => ({
  default: (
    await import("@/features/project-time-on-period-chart/components/project-time-on-period-chart")
  ).ProjectTimeOnPeriodChart,
}));
const ProjectLanguagesTimeOnPeriodChart = lazy(async () => ({
  default: (
    await import("@/features/project-languages-time-on-period-chart/components/project-languages-time-on-period-chart")
  ).ProjectLanguagesTimeOnPeriodChart,
}));
const ProjectDayLanguagesChart = lazy(async () => ({
  default: (
    await import("@/features/project-day-languages-chart/components/project-day-languages-chart")
  ).ProjectDayLanguagesChart,
}));
const FilesCirclePackingChart = lazy(async () => ({
  default: (
    await import("@/features/files-circle-packing-chart/components/files-circle-packing-chart")
  ).FilesCirclePackingChart,
}));

export const Project = () => {
  return (
    <main className="flex flex-col gap-y-4 px-14 pb-4">
      <ProjectTitle />

      <div className="flex flex-col gap-x-10 gap-y-12 rounded-md border p-3 pt-14">
        <ChartGroupWrapper>
          <ErrorBoundary
            FallbackComponent={({ error, resetErrorBoundary }) => (
              <FallBackRender
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                hasCustomChildren={false}
              />
            )}
          >
            <SuspenseBoundary hasCustomSkeleton={false}>
              <ProjectTimeOnPeriodChart />
            </SuspenseBoundary>
          </ErrorBoundary>

          <ErrorBoundary
            FallbackComponent={({ error, resetErrorBoundary }) => (
              <FallBackRender
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                hasCustomChildren={false}
              />
            )}
          >
            <SuspenseBoundary hasCustomSkeleton={false}>
              <ProjectLanguagesTimeOnPeriodChart />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>

        <ChartGroupWrapper>
          <ErrorBoundary
            FallbackComponent={({ error, resetErrorBoundary }) => (
              <FallBackRender
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                hasCustomChildren={false}
              />
            )}
          >
            <SuspenseBoundary hasCustomSkeleton={false}>
              <ProjectDayLanguagesChart />
            </SuspenseBoundary>
          </ErrorBoundary>
          <ErrorBoundary
            FallbackComponent={({ error, resetErrorBoundary }) => (
              <FallBackRender
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                hasCustomChildren={false}
              />
            )}
          >
            <SuspenseBoundary hasCustomSkeleton={false}>
              <ProjectGeneralStatsChart />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>

        <ChartGroupWrapper>
          <ErrorBoundary
            FallbackComponent={({ error, resetErrorBoundary }) => (
              <FallBackRender
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                hasCustomChildren={false}
                className="text-destructive max-chart:w-full z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
              />
            )}
          >
            <SuspenseBoundary
              hasCustomSkeleton={false}
              className="h-182 w-full"
            >
              <FilesCirclePackingChart />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>

        <ChartGroupWrapper>
          <FilesList />
        </ChartGroupWrapper>
      </div>
    </main>
  );
};
