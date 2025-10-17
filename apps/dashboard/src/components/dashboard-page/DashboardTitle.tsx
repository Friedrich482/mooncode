import CustomRangeDatesSelector from "../common/CustomRangeDatesSelector";
import { ErrorBoundary } from "react-error-boundary";
import FallBackRender from "../suspense-error-boundaries/ErrorBoundary";
import GroupByDropDown from "./GroupByDropDown";
import PeriodDropDown from "./PeriodDropDown";
import SuspenseBoundary from "../suspense-error-boundaries/SuspenseBoundary";
import TimeSpentOnPeriod from "./TimeSpentOnPeriod";
import { TriangleAlert } from "lucide-react";

const DashboardTitle = () => (
  <div
    className="rounded-md border p-3 text-center text-2xl"
    role="heading"
    aria-level={1}
  >
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
        <SuspenseBoundary className="inline-block h-9 w-44 align-top">
          <TimeSpentOnPeriod />
        </SuspenseBoundary>
      </ErrorBoundary>

      <CustomRangeDatesSelector />
    </div>
  </div>
);

export default DashboardTitle;
