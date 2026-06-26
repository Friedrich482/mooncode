import { differenceInDays } from "date-fns";

import { NAString } from "@/analytics/dto/common";
import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

export const getProjectGeneralStatsOnPeriodGroupedByDays = ({
  start,
  end,
  totalTimeSpentOnPeriod,
  timeSpentOnProjectToday,
  projectPerDayOfPeriod,
}: {
  start: string;
  end: string;
  totalTimeSpentOnPeriod: number;
  timeSpentOnProjectToday: number;
  projectPerDayOfPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >;
}) => {
  const numberOfDays = differenceInDays(end, start) + 1;

  const mean = Math.floor(totalTimeSpentOnPeriod / numberOfDays);

  const percentageToAvg =
    mean === 0
      ? 0
      : parseFloat(
          (((timeSpentOnProjectToday - mean) / mean) * 100).toFixed(2),
        );

  const maxTimeSpentPerDay =
    projectPerDayOfPeriod.length > 0
      ? Math.max(...projectPerDayOfPeriod.map((day) => day.timeSpent))
      : 0;

  const mostActiveDate: NAString =
    maxTimeSpentPerDay === 0
      ? "N/A"
      : new Date(
          projectPerDayOfPeriod.find(
            (day) => day.timeSpent === maxTimeSpentPerDay,
          )?.date ?? convertToISODate(new Date(start)),
        ).toDateString();

  return {
    avgTime: formatDuration(mean),
    percentageToAvg,
    mostActiveDate,
  };
};
