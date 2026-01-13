import { endOfMonth, startOfMonth } from "date-fns";
import formatShortDate from "src/common/utils/formatShortDate";
import { DailyDataService } from "src/daily-data/daily-data.service";

import convertToISODate from "@repo/common/convertToISODate";
import formatDuration from "@repo/common/formatDuration";

const getDaysOfPeriodStatsGroupedByMonths = (
  data: Awaited<ReturnType<DailyDataService["findRange"]>>
) => {
  const monthlyMap = new Map<
    string,
    { month: string; timeSpent: number; startDate: Date; endDate: Date }
  >();
  const lastEntry = data.at(-1);
  if (!lastEntry) return [];

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

  const daysOfPeriodStatsGroupedByMonths = Array.from(monthlyMap.values()).map(
    ({ timeSpent, month }) => ({
      originalDate: month,
      date: month,
      timeSpentLine: timeSpent,
      timeSpentBar: timeSpent,
      timeSpentArea: timeSpent,
      value: formatDuration(timeSpent),
    })
  );

  return daysOfPeriodStatsGroupedByMonths;
};

export default getDaysOfPeriodStatsGroupedByMonths;
