import { isDeepStrictEqual } from "node:util";

export const hasLanguagesDataChanged = (
  oldTimeSpentPerLanguage: {
    [languageSlug: string]: number;
  },
  newTimeSpentPerLanguage: { [languageSlug: string]: number },
) => !isDeepStrictEqual(oldTimeSpentPerLanguage, newTimeSpentPerLanguage);
