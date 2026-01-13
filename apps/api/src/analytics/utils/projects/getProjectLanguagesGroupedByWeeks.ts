import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { ProjectsAnalyticsService } from "src/analytics/services/projects-analytics.service";
import formatShortDate from "src/common/utils/formatShortDate";

import convertToISODate from "@repo/common/convertToISODate";
import { PeriodResolution } from "@repo/common/types-schemas";

const getProjectLanguagesGroupedByWeeks = async (
  data: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
  periodResolution: PeriodResolution,
  languagesTimesPerDayOfPeriod: Record<string, Record<string, number>>
) => {
  if (data.length === 0) return [];
  const weeklyMap = new Map<
    string,
    {
      weekRange: string;
      timeSpent: number;
      startDate: Date;
      endDate: Date;
      languages: Record<string, number>;
    }
  >();

  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);

  const entriesWithLanguages = data.map((entry) => ({
    ...entry,
    languages: languagesTimesPerDayOfPeriod[entry.date] || {},
  }));

  for (const [, entry] of entriesWithLanguages.entries()) {
    const date = new Date(entry.date);
    let weekStart = startOfWeek(date);
    let weekEnd = endOfWeek(date);

    if (periodResolution === "month") {
      // Adjust week boundaries to ensure they don't extend beyond the month start/end
      const monthStart = startOfMonth(startDate);
      const monthEnd = endOfMonth(endDate);
      weekStart = weekStart < monthStart ? monthStart : weekStart;
      weekEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
    }
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

    const weekKey = convertToISODate(weekStart);

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        weekRange: `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`,
        timeSpent: 0,
        startDate: weekStart,
        endDate: weekEnd,
        languages: {},
      });
    }

    const weekEntry = weeklyMap.get(weekKey) as {
      weekRange: string;
      timeSpent: number;
      startDate: Date;
      endDate: Date;
      languages: Record<string, number>;
    };
    weekEntry.timeSpent += entry.timeSpent;

    for (const [lang, time] of Object.entries(entry.languages)) {
      weekEntry.languages[lang] = (weekEntry.languages[lang] || 0) + time;
    }
  }

  const projectLanguagesGroupedByWeeks = Array.from(weeklyMap.values()).map(
    ({ languages, timeSpent, ...rest }) => ({
      timeSpent,
      ...languages,
      originalDate: rest.weekRange,
      date: rest.weekRange,
    })
  );

  return projectLanguagesGroupedByWeeks;
};

export default getProjectLanguagesGroupedByWeeks;
