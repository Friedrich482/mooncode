import { PERIODS_CONFIG } from "@/constants";
import { Period } from "@/types-schemas";
import getPeriodResolution from "@repo/common/getPeriodResolution";
import { GroupBy, PeriodResolution } from "@repo/common/types-schemas";

const correctGroupBy = (
  period: Period,
  customRange: {
    start: string;
    end: string;
    periodResolution: PeriodResolution;
  },
  groupBy: GroupBy,
): GroupBy => {
  const periodResolution =
    period === "Custom Range"
      ? customRange.periodResolution
      : getPeriodResolution(
          PERIODS_CONFIG[period].start,
          PERIODS_CONFIG[period].end,
        );

  if (periodResolution === "day") {
    return "days";
  }

  if (periodResolution === "week" && groupBy === "months") {
    return "weeks";
  }

  if (periodResolution === "month" && groupBy === "months") {
    return "weeks";
  }

  return groupBy;
};

export default correctGroupBy;
