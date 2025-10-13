import ChartGroupWrapper from "../ChartGroupWrapper";
import DashboardTitle from "./DashboardTitle";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "../suspense/ErrorFallback";
import GeneralStatsChart from "./charts/GeneralStatsChart";
import PeriodProjects from "./PeriodProjects";
import SuspenseBoundary from "../suspense/SuspenseBoundary";
import { lazy } from "react";
import usePageTitle from "@/hooks/usePageTitle";

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
          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <SuspenseBoundary>
              <PeriodTimeChart />
            </SuspenseBoundary>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <SuspenseBoundary>
              <PeriodLanguagesChart />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>

        <ChartGroupWrapper>
          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <SuspenseBoundary>
              <DayLanguagesChart />
            </SuspenseBoundary>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={ErrorFallBack}>
            <SuspenseBoundary>
              <GeneralStatsChart />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>

        <ChartGroupWrapper>
          <ErrorBoundary
            FallbackComponent={({ error }) => (
              <ErrorFallBack
                error={error}
                className="text-destructive max-chart:w-full relative z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
              />
            )}
          >
            <SuspenseBoundary fallBackClassName="h-[24rem] w-full max-chart:w-full">
              <PeriodProjects />
            </SuspenseBoundary>
          </ErrorBoundary>
        </ChartGroupWrapper>
      </div>
    </main>
  );
};

export default Dashboard;
