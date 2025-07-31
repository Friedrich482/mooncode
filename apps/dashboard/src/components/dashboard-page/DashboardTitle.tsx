import CustomRangeDatesSelector from "../CustomRangeDatesSelector";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallBack from "../suspense/ErrorFallback";
import PeriodDropDown from "./PeriodDropDown";
import SuspenseBoundary from "../suspense/SuspenseBoundary";
import TimeSpentOnPeriod from "./TimeSpentOnPeriod";
import { TriangleAlert } from "lucide-react";

const DashboardTitle = () => (
  <h1 className="flex flex-row items-start justify-start pt-2 text-2xl max-[34.375rem]:flex-col max-[25.625rem]:text-base">
    <div className="flex flex-wrap items-center gap-2 text-center">
      <PeriodDropDown />{" "}
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
  </h1>
);

export default DashboardTitle;
