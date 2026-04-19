import { NAString } from "@/analytics/dto/common";
import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";

export const getProjectMostUsedLanguageOnPeriod = async (
  projectsAnalyticsService: ProjectsAnalyticsService,
  name: string,
  userId: string,
  start: string,
  end: string,
) => {
  const projectLanguagesTimeOnPeriod =
    await projectsAnalyticsService.getLanguagesTimeOnPeriod({
      name,
      start,
      end,
      userId,
    });

  const mostUsedLanguageTime = Math.max(
    ...Object.entries(projectLanguagesTimeOnPeriod).map(
      ([, timeSpent]) => timeSpent,
    ),
  );

  const mostUsedLanguageSlug: NAString =
    Object.entries(projectLanguagesTimeOnPeriod)
      .map(([languageSlug, timeSpent]) => ({ languageSlug, timeSpent }))
      .find(({ timeSpent }) => timeSpent === mostUsedLanguageTime)
      ?.languageSlug || "N/A";

  return mostUsedLanguageSlug;
};
