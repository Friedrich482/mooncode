import ChartGroupWrapper from "../ChartGroupWrapper";
import DashboardTitle from "./DashboardTitle";
import DayLanguagesChart from "./charts/dayLanguagesChart/DayLanguagesChart";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "../suspense/ErrorFallback";
import GeneralStatsChart from "./charts/GeneralStatsChart";
import PeriodLanguagesChart from "./charts/PeriodLanguagesChart";
import PeriodProjects from "./charts/PeriodProjects";
import PeriodTimeChart from "./charts/PeriodTimeChart";
import SuspenseBoundary from "../suspense/SuspenseBoundary";

const Dashboard = () => {
  document.title = "MoonCode | Dashboard";
  return (
    <main className="flex flex-col gap-x-10 gap-y-12 px-14 pb-4">
      <DashboardTitle />

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
              className="relative z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl text-destructive max-xl:text-xl max-chart:w-full max-[30rem]:text-lg"
            />
          )}
        >
          <SuspenseBoundary fallBackClassName="h-[24rem] w-full max-chart:w-full">
            <PeriodProjects />
          </SuspenseBoundary>
        </ErrorBoundary>
      </ChartGroupWrapper>
    </main>
  );
};

export default Dashboard;
