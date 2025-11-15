import { NAString } from "src/common/dto";

import { CodingStatsDashboardService } from "../coding-stats-dashboard.service";

const getMostUsedLanguageOnPeriod = async (
  codingStatsDashboardService: CodingStatsDashboardService,
  userId: string,
  start: string,
  end: string,
) => {
  const periodLanguagesTime =
    await codingStatsDashboardService.getPeriodLanguagesTime({
      userId,
      start,
      end,
    });

  const mostUsedLanguageTime = periodLanguagesTime
    .map((language) => language.time)
    .reduce((max, curr) => (curr > max ? curr : max), 0);

  const mostUsedLanguageSlug: NAString =
    periodLanguagesTime.find(
      (language) => language.time === mostUsedLanguageTime,
    )?.languageSlug || "N/A";

  return mostUsedLanguageSlug;
};

export default getMostUsedLanguageOnPeriod;
