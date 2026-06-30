import { NAString } from "@/analytics/dto/common";
import { ProjectsAnalyticsService } from "@/analytics/services/projects-analytics.service";

export const getProjectMostUsedLanguageOnPeriod = (
  projectLanguagesTimeOnPeriod: Awaited<
    ReturnType<ProjectsAnalyticsService["getLanguagesTimeOnPeriod"]>
  >,
) => {
  const mostUsedLanguageTime = Math.max(
    ...Object.values(projectLanguagesTimeOnPeriod).map((entry) => entry),
  );

  const mostUsedLanguageSlug: NAString =
    Object.entries(projectLanguagesTimeOnPeriod)
      .map(([languageSlug, timeSpent]) => ({ languageSlug, timeSpent }))
      .find(({ timeSpent }) => timeSpent === mostUsedLanguageTime)
      ?.languageSlug ?? "N/A";

  return mostUsedLanguageSlug;
};
