import { differenceInDays } from "date-fns";

import { NAString } from "@/analytics/dto/common";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

export const getGeneralStatsOnPeriodGroupedByDays = ({
  start,
  end,
  timeSpentOnPeriod,
  timeSpentToday,
  dailyDataForPeriod,
}: {
  start: string;
  end: string;
  timeSpentOnPeriod: number;
  timeSpentToday: number;
  dailyDataForPeriod: Awaited<ReturnType<DailyDataService["findRange"]>>;
}) => {
  const numberOfDays = differenceInDays(end, start) + 1;

  const mean = Math.floor(timeSpentOnPeriod / numberOfDays);

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat((((timeSpentToday - mean) / mean) * 100).toFixed(2));

  const maxTimeSpentPerDay =
    dailyDataForPeriod.length > 0
      ? Math.max(...dailyDataForPeriod.map((day) => day.timeSpent))
      : 0;

  const mostActiveDate: NAString =
    maxTimeSpentPerDay === 0
      ? "N/A"
      : new Date(
          dailyDataForPeriod.find((day) => day.timeSpent === maxTimeSpentPerDay)
            ?.date ?? convertToISODate(new Date(start)),
        ).toDateString();

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate,
  };
};
