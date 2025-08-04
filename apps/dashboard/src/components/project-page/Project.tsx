import ChartGroupWrapper from "../ChartGroupWrapper";
import CustomRangeDatesSelector from "../CustomRangeDatesSelector";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "../suspense/ErrorFallback";
import FilesCirclePackingChart from "./charts/FilesCirclePackingChart";
import FilesList from "./files-list/FilesList";
import GroupByDropDown from "../dashboard-page/GroupByDropDown";
import { Navigate } from "react-router";
import PeriodDropDown from "../dashboard-page/PeriodDropDown";
import ProjectLanguagesTimeOnPeriodChart from "./charts/ProjectLanguagesTimeOnPeriodChart";
import ProjectTimeOnPeriodChart from "./charts/ProjectTimeOnPeriodChart";
import ProjectTitle from "./ProjectTitle";
import SuspenseBoundary from "../suspense/SuspenseBoundary";
import { TRPCClientError } from "@trpc/client";
import TimeSpentOnProject from "./TimeSpentOnProject";

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

const Project = () => (
  <main className="flex flex-col gap-y-4 px-14 pb-4">
    <section className="flex flex-col gap-4">
      <ProjectTitleErrorBoundary>
        <SuspenseBoundary fallBackClassName="h-9 w-52">
          <ProjectTitle />
        </SuspenseBoundary>
      </ProjectTitleErrorBoundary>

      <div className="flex flex-nowrap items-start gap-2 rounded-md border p-3 text-center text-2xl max-[25.625rem]:text-base">
        <div className="flex flex-col gap-2">
          <PeriodDropDown />
          <GroupByDropDown />
        </div>
        <ProjectTitleErrorBoundary>
          <SuspenseBoundary fallBackClassName="h-9 w-44">
            <TimeSpentOnProject />
          </SuspenseBoundary>
        </ProjectTitleErrorBoundary>
        <CustomRangeDatesSelector />
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
          <SuspenseBoundary fallBackClassName="h-[24rem] w-full max-chart:w-full">
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
