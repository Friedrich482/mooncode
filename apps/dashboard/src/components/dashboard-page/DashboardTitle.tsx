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
    className="flex flex-nowrap items-start gap-2 rounded-md border p-3 text-center text-2xl max-[25.625rem]:text-base"
    role="heading"
    aria-level={1}
  >
    <div className="flex flex-col gap-2">
      <PeriodDropDown />
      <GroupByDropDown />
    </div>
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallBack error={error}>
          <h3 className="flex h-9 items-center justify-center gap-2 p-1 text-destructive">
            <TriangleAlert className="size-8 shrink-0 max-xl:size-6" />
            <span>Error</span>
          </h3>
        </ErrorFallBack>
      )}
    >
      <SuspenseBoundary fallBackClassName="h-9 w-44">
        <TimeSpentOnPeriod />
      </SuspenseBoundary>
    </ErrorBoundary>
    <CustomRangeDatesSelector />
  </div>
);

export default DashboardTitle;
