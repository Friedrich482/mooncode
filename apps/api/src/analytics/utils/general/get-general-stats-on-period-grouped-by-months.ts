import { differenceInMonths, endOfMonth, startOfMonth } from "date-fns";
import { NAString } from "src/analytics/dto/common";
import { GeneralAnalyticsService } from "src/analytics/services/general-analytics.service";
import { DailyDataService } from "src/daily-data/daily-data.service";

import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

import { getDaysOfPeriodStatsGroupedByMonths } from "./get-days-of-period-stats-grouped-by-months";
import { getMostUsedLanguageOnPeriod } from "./get-most-used-language-on-period";

export const getGeneralStatsOnPeriodGroupedByMonths = async (
  userId: string,
  start: string,
  end: string,
  todaysDateString: string,
  generalAnalyticsService: GeneralAnalyticsService,
  dailyDataForPeriod: Awaited<ReturnType<DailyDataService["findRange"]>>,
) => {
  const numberOfMonths = differenceInMonths(end, start) + 1;
  const timeSpentOnPeriod = (
    await generalAnalyticsService.getTimeSpentOnPeriod({
      userId,
      start,
      end,
    })
  ).rawTime;
  const mean = timeSpentOnPeriod / numberOfMonths;

  const monthlyDataForPeriod = getDaysOfPeriodStatsGroupedByMonths(
    dailyDataForPeriod,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const timeSpentOnTodaySMonth = (
    await generalAnalyticsService.getTimeSpentOnPeriod({
      userId,
      start: convertToISODate(startOfMonth(new Date(todaysDateString))),
      end: convertToISODate(endOfMonth(new Date(todaysDateString))),
    })
  ).rawTime;

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

  const mostUsedLanguageSlug = await getMostUsedLanguageOnPeriod(
    generalAnalyticsService,
    userId,
    start,
    end,
  );

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveMonth,
    mostUsedLanguageSlug,
  };
};
