import CustomRangeDatesSelector from "../CustomRangeDatesSelector";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "../suspense/ErrorFallback";
import GroupByDropDown from "./GroupByDropDown";
import PeriodDropDown from "./PeriodDropDown";
import SuspenseBoundary from "../suspense/SuspenseBoundary";
import TimeSpentOnPeriod from "./TimeSpentOnPeriod";
import { TriangleAlert } from "lucide-react";

const DashboardTitle = () => (
  <div
    className="rounded-md border p-3 text-center text-2xl"
    role="heading"
    aria-level={1}
  >
    <div className="float-left mb-4 mr-4 flex flex-col gap-2">
      <PeriodDropDown />
      <GroupByDropDown />
    </div>

    <div className="text-balance text-start">
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <ErrorFallBack error={error}>
            <h3 className="inline-block space-x-1 text-destructive">
              <TriangleAlert className="inline size-8 shrink-0 -translate-y-1 max-xl:size-6" />
              <span>Error</span>
            </h3>
          </ErrorFallBack>
        )}
      >
        <SuspenseBoundary fallBackClassName="h-9 w-44 inline-block align-top">
          <TimeSpentOnPeriod />
        </SuspenseBoundary>
      </ErrorBoundary>

      <CustomRangeDatesSelector />
    </div>
  </div>
);

export default DashboardTitle;
