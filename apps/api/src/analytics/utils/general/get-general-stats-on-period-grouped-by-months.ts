import { differenceInMonths } from "date-fns";

import { NAString } from "@/analytics/dto/common";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

import { getDaysOfPeriodStatsGroupedByMonths } from "./get-days-of-period-stats-grouped-by-months";

export const getGeneralStatsOnPeriodGroupedByMonths = ({
  start,
  end,
  timeSpentOnPeriod,
  timeSpentOnTodaySMonth,
  dailyDataForPeriod,
}: {
  start: string;
  end: string;
  timeSpentOnPeriod: number;
  timeSpentOnTodaySMonth: number;
  dailyDataForPeriod: Awaited<ReturnType<DailyDataService["findRange"]>>;
}) => {
  const numberOfMonths = differenceInMonths(end, start) + 1;

  const mean = timeSpentOnPeriod / numberOfMonths;

  const monthlyDataForPeriod = getDaysOfPeriodStatsGroupedByMonths(
    dailyDataForPeriod,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat((((timeSpentOnTodaySMonth - mean) / mean) * 100).toFixed(2));

  const maxTimeSpentPerMonth =
    monthlyDataForPeriod.length > 0
      ? Math.max(...monthlyDataForPeriod.map((month) => month.timeSpent))
      : 0;

  const mostActiveMonth: NAString =
    maxTimeSpentPerMonth === 0
      ? "N/A"
      : monthlyDataForPeriod.find(
          (month) => month.timeSpent === maxTimeSpentPerMonth,
        )?.originalDate || convertToISODate(new Date(start));

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveMonth,
  };
};
