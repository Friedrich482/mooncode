import { endOfMonth, startOfMonth } from "date-fns";
import formatShortDate from "src/common/utils/formatShortDate";
import { DailyDataService } from "src/daily-data/daily-data.service";

import convertToISODate from "@repo/common/convertToISODate";
import formatDuration from "@repo/common/formatDuration";

const getDaysOfPeriodStatsGroupByMonths = (
  data: Awaited<ReturnType<DailyDataService["findRangeDailyData"]>>
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

  return Array.from(monthlyMap.values()).map(({ timeSpent, month }) => ({
    timeSpentLine: timeSpent,
    originalDate: month,
    date: month,
    timeSpentBar: timeSpent,
    timeSpentArea: timeSpent,
    value: formatDuration(timeSpent),
  }));
};

export default getDaysOfPeriodStatsGroupByMonths;
