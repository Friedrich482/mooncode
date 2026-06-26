import { endOfMonth, startOfMonth } from "date-fns";

import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";
import { formatShortDate } from "@/common/utils/format-short-date";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

export const getProjectPerDayOfPeriodGroupedByMonths = (
  data: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
) => {
  const monthlyMap = new Map<
    string,
    { month: string; timeSpent: number; startDate: Date; endDate: Date }
  >();
  const lastEntry = data.at(-1);
  if (!lastEntry) {
    return [];
  }

  const endDate = new Date(lastEntry.date);
  data.forEach((entry) => {
    const date = new Date(entry.date);
    let monthEnd = endOfMonth(date);
    const monthStart = startOfMonth(date);
    monthEnd = endDate < monthEnd ? endDate : monthEnd;

    const monthKey = convertToISODate(monthStart);
    const existing = monthlyMap.get(monthKey) || {
      month: `${formatShortDate(monthStart)} - ${formatShortDate(monthEnd)}`,
      timeSpent: 0,
      startDate: monthStart,
      endDate: monthEnd,
    };

    monthlyMap.set(monthKey, {
      ...existing,
      timeSpent: existing.timeSpent + entry.timeSpent,
    });
  });

  const projectPerDayOfPeriodGroupedByMonths = Array.from(
    monthlyMap.values(),
  ).map(({ timeSpent, month }) => ({
    timeSpentLine: timeSpent,
    timeSpentBar: timeSpent,
    timeSpentArea: timeSpent,
    originalDate: month,
    date: month,
    value: formatDuration(timeSpent),
  }));

  return projectPerDayOfPeriodGroupedByMonths;
};
