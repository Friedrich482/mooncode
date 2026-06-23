import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";

import {
  GetDailyStatsDtoType,
  GetDaysOfPeriodStatsDtoType,
  GetPeriodGeneralStatsDtoType,
  GetPeriodLanguagesPerDayDtoType,
  GetPeriodLanguagesTimeDtoType,
  GetTimeSpentOnPeriodDtoType,
} from "@/analytics/dto/general-analytics.dto";
import { getDaysOfPeriodStatsGroupedByMonths } from "@/analytics/utils/general/get-days-of-period-stats-grouped-by-months";
import { getDaysOfPeriodStatsGroupedByWeeks } from "@/analytics/utils/general/get-days-of-period-stats-grouped-by-weeks";
import { getGeneralStatsOnPeriodGroupedByMonths } from "@/analytics/utils/general/get-general-stats-on-period-grouped-by-months";
import { getGeneralStatsOnPeriodGroupedByWeeks } from "@/analytics/utils/general/get-general-stats-on-period-grouped-by-weeks";
import { getMostUsedLanguageOnPeriod } from "@/analytics/utils/general/get-most-used-language-on-period";
import { getPeriodLanguagesGroupedByMonths } from "@/analytics/utils/general/get-period-languages-grouped-by-months";
import { getPeriodLanguagesGroupedByWeeks } from "@/analytics/utils/general/get-period-languages-grouped-by-weeks";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { LanguagesService } from "@/languages/languages.service";
import { Injectable } from "@nestjs/common";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";

import { NAString } from "../dto/common";
import { getDaysOfPeriodStatsGroupedByDays } from "../utils/general/get-days-of-period-stats-grouped-by-days";
import { getGeneralStatsOnPeriodGroupedByDays } from "../utils/general/get-general-stats-on-period-grouped-by-days";
import { getPeriodLanguagesGroupedByDays } from "../utils/general/get-period-languages-grouped-by-days";

@Injectable()
export class GeneralAnalyticsService {
  constructor(
    private readonly dailyDataService: DailyDataService,
    private readonly languagesService: LanguagesService,
  ) {}

  async getTimeSpentOnPeriod(
    getTimeSpentOnPeriodDto: GetTimeSpentOnPeriodDtoType,
  ) {
    const { userId, start, end } = getTimeSpentOnPeriodDto;

    const dailyDataForPeriod = await this.dailyDataService.findRange({
      userId,
      start,
      end,
    });

    const timeSpent = dailyDataForPeriod
      .map((day) => day.timeSpent)
      .reduce((acc, curr) => acc + curr, 0);

    return { rawTime: timeSpent, formattedTime: formatDuration(timeSpent) };
  }

  async getDaysOfPeriodStats(
    getDaysOfPeriodStatsDto: GetDaysOfPeriodStatsDtoType,
  ) {
    const { userId, start, end, groupBy, periodResolution } =
      getDaysOfPeriodStatsDto;

    const dailyDataForPeriod = await this.dailyDataService.findRange({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) {
      return [];
    }

    switch (groupBy) {
      case "days":
        return getDaysOfPeriodStatsGroupedByDays(dailyDataForPeriod);

      case "weeks":
        return getDaysOfPeriodStatsGroupedByWeeks(
          dailyDataForPeriod,
          periodResolution,
        );

      case "months":
        return getDaysOfPeriodStatsGroupedByMonths(dailyDataForPeriod);

      case undefined:
        return getDaysOfPeriodStatsGroupedByDays(dailyDataForPeriod);

      default:
        throw groupBy satisfies never;
    }
  }

  async getPeriodLanguagesTime(
    getPeriodLanguagesTimeDto: GetPeriodLanguagesTimeDtoType,
  ) {
    const { userId, start, end } = getPeriodLanguagesTimeDto;

    const dailyDataForPeriod = await this.dailyDataService.findRange({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) {
      return [];
    }

    const totalTimeSpentOnPeriod = (
      await this.getTimeSpentOnPeriod({ userId, start, end })
    ).rawTime;

    const kVLangTime = (
      await Promise.all(
        dailyDataForPeriod.map(({ id }) =>
          this.languagesService.findAll({ dailyDataId: id }),
        ),
      )
    ).reduce((acc, dayStats) => {
      Object.keys(dayStats).forEach((languageSlug) => {
        acc[languageSlug] = (acc[languageSlug] || 0) + dayStats[languageSlug];
      });
      return acc;
    }, {});

    const periodLanguagesTime = Object.entries(kVLangTime)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        time: timeSpent,
        value: formatDuration(timeSpent),
        percentage: parseFloat(
          ((timeSpent * 100) / totalTimeSpentOnPeriod).toFixed(2),
        ),
      }))
      .sort((a, b) => a.time - b.time);

    return periodLanguagesTime;
  }

  async getPeriodLanguagesPerDay(
    getPeriodLanguagesPerDayDto: GetPeriodLanguagesPerDayDtoType,
  ) {
    const { userId, start, end, groupBy, periodResolution } =
      getPeriodLanguagesPerDayDto;

    const dailyDataForPeriod = await this.dailyDataService.findRange({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) {
      return [];
    }

    const entriesWithLanguages = await Promise.all(
      dailyDataForPeriod.map(async (entry) => ({
        ...entry,
        languages: await this.languagesService.findAll({
          dailyDataId: entry.id,
        }),
      })),
    );

    switch (groupBy) {
      case "days":
        return getPeriodLanguagesGroupedByDays(entriesWithLanguages);

      case "weeks":
        return getPeriodLanguagesGroupedByWeeks(
          entriesWithLanguages,
          periodResolution,
        );

      case "months":
        return getPeriodLanguagesGroupedByMonths(entriesWithLanguages);

      case undefined:
        return getPeriodLanguagesGroupedByDays(entriesWithLanguages);

      default:
        throw groupBy satisfies never;
    }
  }

  async getDailyStats(getDailyStatsDto: GetDailyStatsDtoType) {
    const { userId, dateString } = getDailyStatsDto;

    const dayData = await this.dailyDataService.findOne({
      userId,
      date: dateString,
    });

    if (!dayData || dayData.timeSpent === 0)
      return {
        formattedTotalTimeSpent: formatDuration(0),
        languagesStatsOnDay: [],
      };

    const dayLanguagesTime = await this.languagesService.findAll({
      dailyDataId: dayData.id,
    });

    const totalTimeSpent = dayData.timeSpent;

    const languagesStatsOnDay = Object.entries(dayLanguagesTime)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        timeSpent,
        formattedValue: formatDuration(timeSpent),
        percentage: parseFloat(((timeSpent * 100) / totalTimeSpent).toFixed(2)),
      }))
      .sort((a, b) => b.timeSpent - a.timeSpent);

    const formattedTotalTimeSpent = formatDuration(totalTimeSpent);

    return {
      languagesStatsOnDay,
      formattedTotalTimeSpent,
    };
  }

  async getPeriodGeneralStats(
    getPeriodGeneralStatsDto: GetPeriodGeneralStatsDtoType,
  ): Promise<{
    avgTime: string;
    percentageToAvg: number;
    mostActiveDate: NAString;
    mostUsedLanguageSlug: NAString;
  }> {
    const { userId, start, end, todaysDateString, groupBy, periodResolution } =
      getPeriodGeneralStatsDto;

    const dailyDataForPeriod = await this.dailyDataService.findRange({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) {
      return {
        avgTime: formatDuration(0),
        percentageToAvg: 0,
        mostActiveDate: "N/A",
        mostUsedLanguageSlug: "N/A",
      };
    }

    const timeSpentOnPeriod = (
      await this.getTimeSpentOnPeriod({
        userId,
        start,
        end,
      })
    ).rawTime;

    const periodLanguagesTime = await this.getPeriodLanguagesTime({
      userId,
      start,
      end,
    });

    const mostUsedLanguageSlug =
      await getMostUsedLanguageOnPeriod(periodLanguagesTime);

    const timeSpentToday =
      (
        await this.dailyDataService.findOne({
          userId,
          date: todaysDateString,
        })
      )?.timeSpent ?? 0;

    switch (groupBy) {
      case "days":
        return {
          ...getGeneralStatsOnPeriodGroupedByDays({
            start,
            end,
            timeSpentOnPeriod,
            timeSpentToday,
            dailyDataForPeriod,
          }),
          mostUsedLanguageSlug,
        };

      case "weeks":
        const timeSpentOnTodaySWeek = (
          await this.getTimeSpentOnPeriod({
            userId,
            start: convertToISODate(startOfWeek(new Date(todaysDateString))),
            end: convertToISODate(endOfWeek(new Date(todaysDateString))),
          })
        ).rawTime;

        return {
          ...getGeneralStatsOnPeriodGroupedByWeeks({
            start,
            end,
            timeSpentOnPeriod,
            timeSpentOnTodaySWeek,
            dailyDataForPeriod,
            periodResolution,
          }),
          mostUsedLanguageSlug,
        };

      case "months":
        const timeSpentOnTodaySMonth = (
          await this.getTimeSpentOnPeriod({
            userId,
            start: convertToISODate(startOfMonth(new Date(todaysDateString))),
            end: convertToISODate(endOfMonth(new Date(todaysDateString))),
          })
        ).rawTime;

        return {
          ...getGeneralStatsOnPeriodGroupedByMonths({
            start,
            end,
            timeSpentOnPeriod,
            timeSpentOnTodaySMonth,
            dailyDataForPeriod,
          }),
          mostUsedLanguageSlug,
        };

      case undefined:
        return {
          ...getGeneralStatsOnPeriodGroupedByDays({
            start,
            end,
            timeSpentOnPeriod,
            timeSpentToday,
            dailyDataForPeriod,
          }),
          mostUsedLanguageSlug,
        };

      default:
        throw groupBy satisfies never;
    }
  }
}
