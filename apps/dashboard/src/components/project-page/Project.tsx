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
import { TriangleAlert } from "lucide-react";
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

      return (
        <h3 className="text-destructive inline-block space-x-1">
          <TriangleAlert className="inline size-8 shrink-0 -translate-y-1 max-xl:size-6" />
          <span className="text-2xl">Error</span>
        </h3>
      );
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
        <div className="float-left mr-4 mb-4 flex flex-col gap-2">
          <PeriodDropDown />
          <GroupByDropDown />
        </div>

        <div className="text-start text-balance">
          <ProjectTitleErrorBoundary>
            <SuspenseBoundary fallBackClassName="h-9 w-44 inline-block align-top">
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
        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <ErrorFallBack
              error={error}
              className="text-destructive max-chart:w-full z-0 flex min-h-96 w-full items-center justify-center rounded-md border px-1.5 text-2xl max-xl:text-xl max-[30rem]:text-lg"
            />
          )}
        >
          <SuspenseBoundary fallBackClassName="h-[45.5rem] w-full">
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
