import { PERIODS_CONFIG } from "@/stores/period/constants";
import { Period } from "@/types-schemas";
import { getPeriodResolution } from "@repo/common/get-period-resolution";
import { GroupBy } from "@repo/common/types-schemas";

export const correctGroupBy = (
  period: Period,
  customRange: {
    start: string;
    end: string;
  },
  groupBy: GroupBy,
): GroupBy => {
  const periodResolution =
    period === "Custom Range"
      ? getPeriodResolution(customRange.start, customRange.end)
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

  return groupBy;
};
