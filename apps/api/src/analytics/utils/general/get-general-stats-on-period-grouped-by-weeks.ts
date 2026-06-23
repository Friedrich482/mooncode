import { NAString } from "@/analytics/dto/common";
import { countStrictWeeks } from "@/common/utils/count-strict-weeks";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";
import { PeriodResolution } from "@repo/common/types-schemas";

import { getDaysOfPeriodStatsGroupedByWeeks } from "./get-days-of-period-stats-grouped-by-weeks";

export const getGeneralStatsOnPeriodGroupedByWeeks = ({
  start,
  end,
  timeSpentOnPeriod,
  timeSpentOnTodaySWeek,
  dailyDataForPeriod,
  periodResolution,
}: {
  start: string;
  end: string;
  timeSpentOnPeriod: number;
  timeSpentOnTodaySWeek: number;
  dailyDataForPeriod: Awaited<ReturnType<DailyDataService["findRange"]>>;
  periodResolution: PeriodResolution;
}) => {
  const numberOfWeeks = countStrictWeeks(new Date(start), new Date(end));

  const mean = timeSpentOnPeriod / numberOfWeeks;

  const weeklyDataForPeriod = getDaysOfPeriodStatsGroupedByWeeks(
    dailyDataForPeriod,
    periodResolution,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat((((timeSpentOnTodaySWeek - mean) / mean) * 100).toFixed(2));

  const maxTimeSpentPerWeek =
    weeklyDataForPeriod.length > 0
      ? Math.max(...weeklyDataForPeriod.map((week) => week.timeSpent))
      : 0;

  const mostActiveWeek: NAString =
    maxTimeSpentPerWeek === 0
      ? "N/A"
      : (weeklyDataForPeriod.find(
          (week) => week.timeSpent === maxTimeSpentPerWeek,
        )?.originalDate ?? convertToISODate(new Date(start)));

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveWeek,
  };
};
