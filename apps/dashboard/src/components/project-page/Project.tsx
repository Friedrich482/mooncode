import ChartGroupWrapper from "../ChartGroupWrapper";
import CustomRangeDatesSelector from "../CustomRangeDatesSelector";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "../suspense/ErrorFallback";
import FilesList from "./files-list/FilesList";
import GroupByDropDown from "../dashboard-page/GroupByDropDown";
import { Navigate } from "react-router";
import PeriodDropDown from "../dashboard-page/PeriodDropDown";
import ProjectTitle from "./ProjectTitle";
import SuspenseBoundary from "../suspense/SuspenseBoundary";
import { TRPCClientError } from "@trpc/client";
import TimeSpentOnProject from "./TimeSpentOnProject";
import { lazy } from "react";

const ProjectTitleErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ErrorBoundary
    FallbackComponent={({ error }) => {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "NOT_FOUND"
      ) {
        return <Navigate to="/not-found" />;
      }

      return <div className="h-9 text-destructive">{error.message}</div>;
    }}
    children={children}
  />
);

const ProjectTimeOnPeriodChart = lazy(
  () => import("./charts/ProjectTimeOnPeriodChart"),
);
const ProjectLanguagesTimeOnPeriodChart = lazy(
  () => import("./charts/ProjectLanguagesTimeOnPeriodChart"),
);
const FilesCirclePackingChart = lazy(
  () => import("./charts/FilesCirclePackingChart"),
);

const Project = () => (
  <main className="flex flex-col gap-y-4 px-14 pb-4">
    <section className="flex flex-col gap-4">
      <ProjectTitleErrorBoundary>
        <SuspenseBoundary fallBackClassName="h-9 w-52">
          <ProjectTitle />
        </SuspenseBoundary>
      </ProjectTitleErrorBoundary>

      <div className="rounded-md border p-3 text-center text-2xl">
        <div className="float-left mb-4 mr-4 flex flex-col gap-2">
          <PeriodDropDown />
          <GroupByDropDown />
        </div>

        <div className="text-balance text-start">
          <ProjectTitleErrorBoundary>
            <SuspenseBoundary fallBackClassName="h-9 w-44 translate-x-[8.3rem]">
              <TimeSpentOnProject />
            </SuspenseBoundary>
          </ProjectTitleErrorBoundary>

          <CustomRangeDatesSelector />
        </div>
      </div>
    </section>

    <div className="flex flex-col gap-x-10 gap-y-12 rounded-md border p-3 pt-14">
      <ChartGroupWrapper>
        <ErrorBoundary FallbackComponent={ErrorFallBack}>
          <SuspenseBoundary>
            <ProjectTimeOnPeriodChart />
          </SuspenseBoundary>
        </ErrorBoundary>

        <ErrorBoundary FallbackComponent={ErrorFallBack}>
          <SuspenseBoundary>
            <ProjectLanguagesTimeOnPeriodChart />
          </SuspenseBoundary>
        </ErrorBoundary>
      </ChartGroupWrapper>

      <ChartGroupWrapper>
        <ErrorBoundary FallbackComponent={ErrorFallBack}>
          <SuspenseBoundary fallBackClassName="h-[45.5rem] w-full max-chart:w-full">
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

export default Project;
