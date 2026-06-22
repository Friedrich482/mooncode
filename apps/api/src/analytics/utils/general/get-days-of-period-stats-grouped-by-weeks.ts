import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

import { formatShortDate } from "@/common/utils/format-short-date";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";
import { PeriodResolution } from "@repo/common/types-schemas";

export const getDaysOfPeriodStatsGroupedByWeeks = (
  data: Awaited<ReturnType<DailyDataService["findRange"]>>,
  periodResolution: PeriodResolution,
) => {
  const weeklyMap = new Map<
    string,
    {
      weekRange: string;
      timeSpent: number;
      startDate: Date;
      endDate: Date;
    }
  >();
  const startDate = new Date(data[0].date);
  const lastEntry = data.at(-1);
  if (!lastEntry) {
    return [];
  }

  const endDate = new Date(lastEntry.date);

  data.forEach((entry, index) => {
    const date = new Date(entry.date);

    let weekStart = startOfWeek(date);
    let weekEnd = endOfWeek(date);

    if (periodResolution === "week") {
      // adjust week boundaries to make sure that the first "week" starts with the first day of the range
      // and the last "week" ends with the last day of the range

      if (date <= endOfWeek(startDate)) {
        weekStart = startDate;
      }

      if (date >= startOfWeek(endDate)) {
        weekEnd = endDate;
      }
    }

    if (periodResolution === "month") {
      const monthStart = startOfMonth(startDate);
      const monthEnd = endOfMonth(endDate);
      weekStart = weekStart < monthStart ? monthStart : weekStart;
      weekEnd =
        weekEnd > monthEnd
          ? monthEnd
          : index >= data.length - 6
            ? endDate
            : weekEnd;
    }

    if (periodResolution === "year") {
      weekEnd = index >= data.length - 6 ? endDate : weekEnd;
    }

    const weekKey = convertToISODate(weekStart);

    const existing = weeklyMap.get(weekKey) ?? {
      weekRange: `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`,
      timeSpent: 0,
      startDate: weekStart,
      endDate: weekEnd,
    };

    weeklyMap.set(weekKey, {
      ...existing,
      timeSpent: existing.timeSpent + entry.timeSpent,
    });
  });

  const daysOfPeriodStatsGroupedByWeeks = Array.from(weeklyMap.values()).map(
    ({ timeSpent, weekRange }) => ({
      timeSpentLine: timeSpent,
      originalDate: weekRange,
      date: weekRange,
      timeSpentBar: timeSpent,
      timeSpentArea: timeSpent,
      value: formatDuration(timeSpent),
    }),
  );

  return daysOfPeriodStatsGroupedByWeeks;
};
