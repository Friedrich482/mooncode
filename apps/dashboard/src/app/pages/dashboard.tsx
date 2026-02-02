import { lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ChartGroupWrapper } from "@/components/common/chart-group-wrapper";
import { FallBackRender } from "@/components/errors/error-boundary";
import { SuspenseBoundary } from "@/components/errors/suspense-boundary";
import { DashboardTitle } from "@/features/dashboard-title/components/dashboard-title";
import { GeneralStatsChart } from "@/features/general-stats-chart/components/general-stats-chart";
import { PeriodProjects } from "@/features/period-projects/components/period-projects";
import { usePageTitle } from "@/hooks/use-page-title";

const PeriodTimeChart = lazy(async () => ({
  default: (
    await import("@/features/period-time-chart/components/period-time-chart")
  ).PeriodTimeChart,
}));
const PeriodLanguagesChart = lazy(async () => ({
  default: (
    await import("@/features/period-languages-chart/components/period-languages-chart")
  ).PeriodLanguagesChart,
}));
const DayLanguagesChart = lazy(async () => ({
  default: (
    await import("@/features/day-languages-chart/components/day-languages-chart")
  ).DayLanguagesChart,
}));

export const Dashboard = () => {
  usePageTitle("Dashboard | Mooncode");

  return (
    <main className="flex flex-col gap-y-4 px-14 pb-4">
      <DashboardTitle />

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
            <SuspenseBoundary>
              <PeriodTimeChart />
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
            <SuspenseBoundary>
              <PeriodLanguagesChart />
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
            <SuspenseBoundary>
              <DayLanguagesChart />
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
            <SuspenseBoundary>
              <GeneralStatsChart />
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
                className="text-destructive max-chart:w-full relative z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
              />
            )}
          >
            <SuspenseBoundary className="max-chart:w-full h-96 w-full">
              <PeriodProjects />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>
      </div>
    </main>
  );
};
