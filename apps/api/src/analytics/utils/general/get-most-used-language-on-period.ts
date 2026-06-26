import { NAString } from "@/analytics/dto/common";
import { GeneralAnalyticsService } from "@/analytics/services/general-analytics.service";

export const getMostUsedLanguageOnPeriod = (
  periodLanguagesTime: Awaited<
    ReturnType<GeneralAnalyticsService["getPeriodLanguagesTime"]>
  >,
) => {
  const mostUsedLanguageTime = Math.max(
    ...periodLanguagesTime.map((language) => language.time),
  );

  const mostUsedLanguageSlug: NAString =
    periodLanguagesTime.find(
      (language) => language.time === mostUsedLanguageTime,
    )?.languageSlug ?? "N/A";

  return mostUsedLanguageSlug;
};
