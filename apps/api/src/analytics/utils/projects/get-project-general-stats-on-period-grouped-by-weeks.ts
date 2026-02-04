import { endOfWeek, startOfWeek } from "date-fns";
import { ProjectsAnalyticsService } from "src/analytics/services/projects-analytics.service";
import { countStrictWeeks } from "src/common/utils/count-strict-weeks";

import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";
import { PeriodResolution } from "@repo/common/types-schemas";

import { getProjectMostUsedLanguageOnPeriod } from "./get-project-most-used-language-on-period";
import { getProjectPerDayOfPeriodGroupedByWeeks } from "./get-project-per-day-of-period-grouped-by-weeks";

export const getProjectGeneralStatsOnPeriodGroupedByWeeks = async (
  userId: string,
  start: string,
  end: string,
  todaysDateString: string,
  name: string,
  projectsAnalyticsService: ProjectsAnalyticsService,
  projectPerDayOfPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
  periodResolution: PeriodResolution,
) => {
  const numberOfWeeks = countStrictWeeks(new Date(start), new Date(end));

  const { totalTimeSpent: totalTimeSpentOnPeriod } =
    await projectsAnalyticsService.getProjectOnPeriod({
      userId,
      start,
      end,
      name,
    });

  const mean = totalTimeSpentOnPeriod / numberOfWeeks;

  const projectWeeklyDataForPeriod = getProjectPerDayOfPeriodGroupedByWeeks(
    projectPerDayOfPeriod,
    periodResolution,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const timeSpentOnProjectTodaysWeek = (
    await projectsAnalyticsService.getProjectOnPeriod({
      userId,
      name,
      start: convertToISODate(startOfWeek(new Date(todaysDateString))),
      end: convertToISODate(endOfWeek(new Date(todaysDateString))),
    })
  ).totalTimeSpent;

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat(
          (((timeSpentOnProjectTodaysWeek - mean) / mean) * 100).toFixed(2),
        );

  const maxTimeSpentPerWeek =
    projectWeeklyDataForPeriod.length > 0
      ? Math.max(...projectWeeklyDataForPeriod.map((week) => week.timeSpent))
      : 0;
  const mostActiveWeek =
    maxTimeSpentPerWeek === 0
      ? "N/A"
      : projectWeeklyDataForPeriod.find(
          (week) => week.timeSpent === maxTimeSpentPerWeek,
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
    mostActiveDate: mostActiveWeek,
    mostUsedLanguageSlug,
  };
};
