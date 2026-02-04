import { differenceInMonths, endOfMonth, startOfMonth } from "date-fns";
import { ProjectsAnalyticsService } from "src/analytics/services/projects-analytics.service";

import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

import { getProjectMostUsedLanguageOnPeriod } from "./get-project-most-used-language-on-period";
import { getProjectPerDayOfPeriodGroupedByMonths } from "./get-project-per-day-of-period-grouped-by-months";

export const getProjectGeneralStatsOnPeriodGroupedByMonths = async (
  userId: string,
  start: string,
  end: string,
  todaysDateString: string,
  name: string,
  projectsAnalyticsService: ProjectsAnalyticsService,
  projectPerDayOfPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
) => {
  const numberOfMonths = differenceInMonths(end, start) + 1;

  const { totalTimeSpent: totalTimeSpentOnPeriod } =
    await projectsAnalyticsService.getProjectOnPeriod({
      userId,
      start,
      end,
      name,
    });

  const mean = totalTimeSpentOnPeriod / numberOfMonths;

  const projectMonthlyDataForPeriod = getProjectPerDayOfPeriodGroupedByMonths(
    projectPerDayOfPeriod,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const timeSpentOnProjectTodaysMonth = (
    await projectsAnalyticsService.getProjectOnPeriod({
      userId,
      name,
      start: convertToISODate(startOfMonth(new Date(todaysDateString))),
      end: convertToISODate(endOfMonth(new Date(todaysDateString))),
    })
  ).totalTimeSpent;

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat(
          (((timeSpentOnProjectTodaysMonth - mean) / mean) * 100).toFixed(2),
        );

  const maxTimeSpentPerMonth =
    projectMonthlyDataForPeriod.length > 0
      ? Math.max(...projectMonthlyDataForPeriod.map((month) => month.timeSpent))
      : 0;
  const mostActiveMonth =
    maxTimeSpentPerMonth === 0
      ? "N/A"
      : projectMonthlyDataForPeriod.find(
          (month) => month.timeSpent === maxTimeSpentPerMonth,
        )?.originalDate || convertToISODate(new Date(start));

  const mostUsedLanguageSlug = await getProjectMostUsedLanguageOnPeriod(
    projectsAnalyticsService,
    name,
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
