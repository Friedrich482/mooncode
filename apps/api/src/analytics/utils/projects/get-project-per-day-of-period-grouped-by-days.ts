import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";
import { formatDuration } from "@repo/common/format-duration";

import { getWeekDayName } from "../get-weekday-name";

export const getProjectPerDayOfPeriodGroupedByDays = (
  data: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
) => {
  const projectsPerDayOfPeriod = data.map(({ timeSpent, date }) => ({
    timeSpentLine: timeSpent,
    timeSpentBar: timeSpent,
    timeSpentArea: timeSpent,
    value: formatDuration(timeSpent),
    originalDate: new Date(date).toDateString(),
    date: getWeekDayName(date),
  }));

  return projectsPerDayOfPeriod;
};
