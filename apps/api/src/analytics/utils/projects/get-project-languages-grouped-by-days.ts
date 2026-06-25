import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";
import { getWeekDayName } from "@/common/utils/get-weekday-name";

export const getProjectLanguagesGroupedByDays = (
  data: Awaited<
    ReturnType<ProjectsAnalyticsService["findProjectByNameOnRange"]>
  >,
  languagesTimesPerDayOfPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["getLanguagesTimePerDayOfPeriod"]>
  >,
) => {
  const periodLanguagesPerDayOfPeriod = data.map(({ timeSpent, date }) => ({
    timeSpent,
    originalDate: new Date(date).toDateString(),
    date: getWeekDayName(date),
    ...(languagesTimesPerDayOfPeriod[date] ?? {}),
  }));

  return periodLanguagesPerDayOfPeriod;
};
