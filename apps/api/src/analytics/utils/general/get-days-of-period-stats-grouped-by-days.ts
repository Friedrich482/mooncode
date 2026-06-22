import { getWeekDayName } from "@/common/utils/get-weekday-name";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { formatDuration } from "@repo/common/format-duration";

export const getDaysOfPeriodStatsGroupedByDays = (
  data: Awaited<ReturnType<DailyDataService["findRange"]>>,
) => {
  const daysOfPeriodStats = data.map(({ timeSpent, date }) => ({
    timeSpentLine: timeSpent,
    originalDate: new Date(date).toDateString(),
    date: getWeekDayName(date),
    timeSpentBar: timeSpent,
    timeSpentArea: timeSpent,
    value: formatDuration(timeSpent),
  }));

  return daysOfPeriodStats;
};
