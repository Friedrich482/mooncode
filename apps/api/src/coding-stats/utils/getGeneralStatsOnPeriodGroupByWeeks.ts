import { endOfWeek, startOfWeek } from "date-fns";
import { CodingStatsDashboardService } from "../coding-stats-dashboard.service";
import { DailyDataService } from "src/daily-data/daily-data.service";
import { PeriodResolution } from "@repo/common/types";
import convertToISODate from "@repo/common/convertToISODate";
import countStrictWeeks from "src/common/utils/countStrictWeeks";
import formatDuration from "@repo/common/formatDuration";
import getDaysOfPeriodStatsGroupByWeeks from "./getDaysOfPeriodStatsGroupByWeeks";
import getMostUsedLanguageOnPeriod from "./getMostUsedLanguageOnPeriod";

const getGeneralStatsOnPeriodGroupByWeeks = async (
  userId: string,
  start: string,
  end: string,
  codingStatsDashboardService: CodingStatsDashboardService,
  dailyDataForPeriod: Awaited<
    ReturnType<DailyDataService["findRangeDailyData"]>
  >,
  periodResolution: PeriodResolution,
) => {
  const numberOfWeeks = countStrictWeeks(new Date(start), new Date(end));

  const timeSpentOnPeriod = (
    await codingStatsDashboardService.getTimeSpentOnPeriod({
      userId,
      start,
      end,
    })
  ).rawTime;

  const mean = timeSpentOnPeriod / numberOfWeeks;

  const weeklyDataForPeriod = getDaysOfPeriodStatsGroupByWeeks(
    dailyDataForPeriod,
    periodResolution,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const timeSpentOnTodaySWeek = (
    await codingStatsDashboardService.getTimeSpentOnPeriod({
      userId,
      start: convertToISODate(startOfWeek(new Date())),
      end: convertToISODate(endOfWeek(new Date())),
    })
  ).rawTime;

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat((((timeSpentOnTodaySWeek - mean) / mean) * 100).toFixed(2));

  const maxTimeSpentPerWeek =
    weeklyDataForPeriod.length > 0
      ? Math.max(...weeklyDataForPeriod.map((week) => week.timeSpent))
      : 0;
  const mostActiveWeek =
    maxTimeSpentPerWeek === 0
      ? "N/A"
      : weeklyDataForPeriod.find(
          (week) => week.timeSpent === maxTimeSpentPerWeek,
        )?.originalDate || convertToISODate(new Date(start));

  const mostUsedLanguageSlug = await getMostUsedLanguageOnPeriod(
    codingStatsDashboardService,
    userId,
    start,
    end,
  );

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveWeek,
    mostUsedLanguageSlug,
  };
};
export default getGeneralStatsOnPeriodGroupByWeeks;
