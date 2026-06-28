import { differenceInMonths } from "date-fns";

import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

import { getProjectPerDayOfPeriodGroupedByMonths } from "./get-project-per-day-of-period-grouped-by-months";

export const getProjectGeneralStatsOnPeriodGroupedByMonths = ({
  start,
  end,
  totalTimeSpentOnPeriod,
  timeSpentOnProjectTodaysMonth,
  projectPerDayOfPeriod,
}: {
  start: string;
  end: string;
  totalTimeSpentOnPeriod: number;
  timeSpentOnProjectTodaysMonth: number;
  projectPerDayOfPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >;
}) => {
  const numberOfMonths = differenceInMonths(end, start) + 1;

  const mean = totalTimeSpentOnPeriod / numberOfMonths;

  const projectMonthlyDataForPeriod = getProjectPerDayOfPeriodGroupedByMonths(
    projectPerDayOfPeriod,
  ).map((entry) => ({
    timeSpent: entry.timeSpentBar,
    originalDate: entry.originalDate,
  }));

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat(
          (((timeSpentOnProjectTodaysMonth - mean) / mean) * 100).toFixed(2),
        );

  const maxTimeSpentPerMonth = Math.max(
    ...projectMonthlyDataForPeriod.map((month) => month.timeSpent),
  );

  const mostActiveMonth =
    maxTimeSpentPerMonth === 0
      ? "N/A"
      : (projectMonthlyDataForPeriod.find(
          (month) => month.timeSpent === maxTimeSpentPerMonth,
        )?.originalDate ?? convertToISODate(new Date(start)));

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate: mostActiveMonth,
  };
};
