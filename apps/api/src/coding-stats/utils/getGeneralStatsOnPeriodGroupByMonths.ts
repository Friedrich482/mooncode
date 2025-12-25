import { differenceInMonths, endOfMonth, startOfMonth } from "date-fns";
import { NAString } from "src/common/dto";
import { DailyDataService } from "src/daily-data/daily-data.service";

import convertToISODate from "@repo/common/convertToISODate";
import formatDuration from "@repo/common/formatDuration";

import { CodingStatsDashboardService } from "../coding-stats-dashboard.service";
import getDaysOfPeriodStatsGroupByMonths from "./getDaysOfPeriodStatsGroupByMonths";
import getMostUsedLanguageOnPeriod from "./getMostUsedLanguageOnPeriod";

const getGeneralStatsOnPeriodGroupByMonths = async (
  userId: string,
  start: string,
  end: string,
  todaysDateString: string,
  codingStatsDashboardService: CodingStatsDashboardService,
  dailyDataForPeriod: Awaited<ReturnType<DailyDataService["findRange"]>>
) => {
  const numberOfMonths = differenceInMonths(end, start) + 1;
  const timeSpentOnPeriod = (
    await codingStatsDashboardService.getTimeSpentOnPeriod({
      userId,
      start,
      end,
    })
  ).rawTime;
  const mean = timeSpentOnPeriod / numberOfMonths;

  const monthlyDataForPeriod = getDaysOfPeriodStatsGroupByMonths(
    dailyDataForPeriod
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const timeSpentOnTodaySMonth = (
    await codingStatsDashboardService.getTimeSpentOnPeriod({
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
          (month) => month.timeSpent === maxTimeSpentPerMonth
        )?.originalDate || convertToISODate(new Date(start));

  const mostUsedLanguageSlug = await getMostUsedLanguageOnPeriod(
    codingStatsDashboardService,
    userId,
    start,
    end
  );

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveMonth,
    mostUsedLanguageSlug,
  };
};

export default getGeneralStatsOnPeriodGroupByMonths;
