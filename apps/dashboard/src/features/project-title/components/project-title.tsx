import { ErrorBoundary } from "react-error-boundary";
import { TriangleAlert } from "lucide-react";

import { CustomRangeDatesSelector } from "@/components/common/custom-range-dates-selector";
import { GroupByDropDown } from "@/components/common/groupby-dropdown";
import { PeriodDropDown } from "@/components/common/period-dropdown";
import { FallBackRender } from "@/components/errors/error-boundary";
import { SuspenseBoundary } from "@/components/errors/suspense-boundary";

import { ProjectName } from "./project-name";
import { TimeSpentOnProject } from "./time-spent-on-project";

export const ProjectTitle = () => (
  <section className="flex flex-col gap-4">
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <FallBackRender
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          hasCustomChildren={true}
          customChildren={
            <h3 className="text-destructive inline-block space-x-1">
              <TriangleAlert className="inline size-8 shrink-0 -translate-y-1 max-xl:size-6" />
              <span className="text-2xl">Error</span>
            </h3>
          }
        />
      )}
    >
      <SuspenseBoundary
        hasCustomSkeleton={false}
        className="bg-accent h-9 w-52"
      >
        <ProjectName />
      </SuspenseBoundary>
    </ErrorBoundary>

    <div className="rounded-md border p-3 text-center text-2xl">
      <div className="float-left mr-4 mb-4 flex flex-col gap-2">
        <PeriodDropDown />
        <GroupByDropDown />
      </div>

      <div className="text-start text-balance">
        <ErrorBoundary
          FallbackComponent={({ error, resetErrorBoundary }) => (
            <FallBackRender
              error={error}
              resetErrorBoundary={resetErrorBoundary}
              hasCustomChildren={true}
              customChildren={
                <h3 className="text-destructive inline-block space-x-1">
                  <TriangleAlert className="inline size-8 shrink-0 -translate-y-1 max-xl:size-6" />
                  <span className="text-2xl">Error</span>
                </h3>
              }
            />
          )}
        >
          <SuspenseBoundary
            hasCustomSkeleton={false}
            className="inline-block h-9 w-44 align-top"
          >
            <TimeSpentOnProject />
          </SuspenseBoundary>
        </ErrorBoundary>
        <CustomRangeDatesSelector />
      </div>
    </div>
  </section>
);
