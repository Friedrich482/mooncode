import { NAString } from "@/analytics/dto/common";
import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";

export const getProjectMostUsedLanguageOnPeriod = async (
  projectLanguagesTimeOnPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["getLanguagesTimeOnPeriod"]>
  >,
) => {
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
