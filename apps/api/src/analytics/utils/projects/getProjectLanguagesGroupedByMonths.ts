import { endOfMonth, startOfMonth } from "date-fns";
import { ProjectsAnalyticsService } from "src/analytics/services/projects-analytics.service";
import formatShortDate from "src/common/utils/formatShortDate";

import convertToISODate from "@repo/common/convertToISODate";

const getProjectLanguageGroupedByMonths = (
  data: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
  languagesTimesPerDayOfPeriod: Record<string, Record<string, number>>
) => {
  if (data.length === 0) return [];

  const monthlyMap = new Map<
    string,
    {
      month: string;
      timeSpent: number;
      startDate: Date;
      endDate: Date;
      languages: Record<string, number>;
    }
  >();

  const lastEntry = data.at(-1);
  if (!lastEntry) {
    return [];
  }

  const endDate = new Date(lastEntry.date);

  const entriesWithLanguages = data.map((entry) => ({
    ...entry,
    languages: languagesTimesPerDayOfPeriod[entry.date] || {},
  }));

  for (const [, entry] of entriesWithLanguages.entries()) {
    const date = new Date(entry.date);
    let monthEnd = endOfMonth(date);
    const monthStart = startOfMonth(date);
    monthEnd = endDate < monthEnd ? endDate : monthEnd;

    const monthKey = convertToISODate(monthStart);

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: `${formatShortDate(monthStart)} - ${formatShortDate(monthEnd)}`,
        timeSpent: 0,
        startDate: monthStart,
        endDate: monthEnd,
        languages: {},
      });
    }

    const monthEntry = monthlyMap.get(monthKey) as {
      month: string;
      timeSpent: number;
      startDate: Date;
      endDate: Date;
      languages: Record<string, number>;
    };
    monthEntry.timeSpent += entry.timeSpent;

    for (const [lang, time] of Object.entries(entry.languages)) {
      monthEntry.languages[lang] = (monthEntry.languages[lang] || 0) + time;
    }
  }

  const projectLanguagesGroupedByMonths = Array.from(monthlyMap.values()).map(
    ({ languages, timeSpent, ...rest }) => ({
      timeSpent,
      ...languages,
      originalDate: rest.month,
      date: rest.month,
    })
  );

  return projectLanguagesGroupedByMonths;
};

export default getProjectLanguageGroupedByMonths;
