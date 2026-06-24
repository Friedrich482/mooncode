import { NAString } from "@/analytics/dto/common";
import { GeneralAnalyticsService } from "@/analytics/services/general-analytics.service";

export const getMostUsedLanguageOnPeriod = (
  periodLanguagesTime: Awaited<
    ReturnType<GeneralAnalyticsService["getPeriodLanguagesTime"]>
  >,
) => {
  const mostUsedLanguageTime = periodLanguagesTime
    .map((language) => language.time)
    .reduce((max, curr) => (curr > max ? curr : max), 0);

  const mostUsedLanguageSlug: NAString =
    periodLanguagesTime.find(
      (language) => language.time === mostUsedLanguageTime,
    )?.languageSlug ?? "N/A";

  return mostUsedLanguageSlug;
};
