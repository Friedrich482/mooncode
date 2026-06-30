import { DailyDataService } from "@/daily-data/daily-data.service";
import { LanguagesService } from "@/languages/languages.service";

import { getWeekDayName } from "../get-weekday-name";

export const getPeriodLanguagesGroupedByDays = (
  data: (Awaited<ReturnType<DailyDataService["findRange"]>>[number] & {
    languages: Awaited<ReturnType<LanguagesService["findAll"]>>;
  })[],
) => {
  const periodLanguagesPerDay = data.map(({ date, timeSpent, languages }) => ({
    originalDate: new Date(date).toDateString(),
    date: getWeekDayName(date),
    timeSpent,
    ...languages,
  }));

  return periodLanguagesPerDay;
};
