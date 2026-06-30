import { NAString } from "@/analytics/dto/common";
import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";
import { PeriodResolution } from "@repo/common/types-schemas";

import { countStrictWeeks } from "../count-strict-weeks";
import { getProjectPerDayOfPeriodGroupedByWeeks } from "./get-project-per-day-of-period-grouped-by-weeks";

export const getProjectGeneralStatsOnPeriodGroupedByWeeks = ({
  start,
  end,
  totalTimeSpentOnPeriod,
  timeSpentOnProjectTodaysWeek,
  projectPerDayOfPeriod,
  periodResolution,
}: {
  start: string;
  end: string;
  totalTimeSpentOnPeriod: number;
  timeSpentOnProjectTodaysWeek: number;
  projectPerDayOfPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >;
  periodResolution: PeriodResolution;
}) => {
  const numberOfWeeks = countStrictWeeks(start, end);

  const mean = totalTimeSpentOnPeriod / numberOfWeeks;

  const projectWeeklyDataForPeriod = getProjectPerDayOfPeriodGroupedByWeeks(
    projectPerDayOfPeriod,
    periodResolution,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat(
          (((timeSpentOnProjectTodaysWeek - mean) / mean) * 100).toFixed(2),
        );

  const maxTimeSpentPerWeek = Math.max(
    ...projectWeeklyDataForPeriod.map((week) => week.timeSpent),
  );

  const mostActiveWeek: NAString =
    maxTimeSpentPerWeek === 0
      ? "N/A"
      : (projectWeeklyDataForPeriod.find(
          (week) => week.timeSpent === maxTimeSpentPerWeek,
        )?.originalDate ?? convertToISODate(new Date(start)));

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveWeek,
  };
};
