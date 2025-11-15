import { lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

import usePageTitle from "@/hooks/usePageTitle";

import ChartGroupWrapper from "../common/ChartGroupWrapper";
import FallBackRender from "../suspense-error-boundaries/ErrorBoundary";
import SuspenseBoundary from "../suspense-error-boundaries/SuspenseBoundary";
import GeneralStatsChart from "./charts/GeneralStatsChart";
import DashboardTitle from "./DashboardTitle";
import PeriodProjects from "./PeriodProjects";

const PeriodTimeChart = lazy(() => import("./charts/PeriodTimeChart"));
const PeriodLanguagesChart = lazy(
  () => import("./charts/PeriodLanguagesChart"),
);
const DayLanguagesChart = lazy(
  () => import("./charts/dayLanguagesChart/DayLanguagesChart"),
);

const Dashboard = () => {
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

export default Dashboard;
