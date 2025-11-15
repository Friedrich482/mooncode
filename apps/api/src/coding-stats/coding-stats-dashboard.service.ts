import { differenceInDays } from "date-fns";
import getDaysOfPeriodStatsGroupByWeeks from "src/coding-stats/utils/getDaysOfPeriodStatsGroupByWeeks";
import getPeriodLanguagesGroupByWeeks from "src/coding-stats/utils/getPeriodLanguagesGroupByWeeks";
import { NAString } from "src/common/dto";
import getWeekDayName from "src/common/utils/getWeekdayName";
import { DailyDataService } from "src/daily-data/daily-data.service";
import { LanguagesService } from "src/languages/languages.service";

import { Injectable } from "@nestjs/common";
import convertToISODate from "@repo/common/convertToISODate";
import formatDuration from "@repo/common/formatDuration";

import {
  GetDailyStatsForChartDtoType,
  GetDaysOfPeriodStatsDtoType,
  GetPeriodGeneralStatsDtoType,
  GetPeriodLanguagesPerDayDtoType,
  GetPeriodLanguagesTimeDtoType,
  GetTimeSpentOnPeriodDtoType,
} from "./coding-stats.dto";
import getDaysOfPeriodStatsGroupByMonths from "./utils/getDaysOfPeriodStatsGroupByMonths";
import getGeneralStatsOnPeriodGroupByMonths from "./utils/getGeneralStatsOnPeriodGroupByMonths";
import getGeneralStatsOnPeriodGroupByWeeks from "./utils/getGeneralStatsOnPeriodGroupByWeeks";
import getMostUsedLanguageOnPeriod from "./utils/getMostUsedLanguageOnPeriod";
import getPeriodLanguagesGroupByMonths from "./utils/getPeriodLanguagesGroupByMonths";

@Injectable()
export class CodingStatsDashboardService {
  constructor(
    private readonly dailyDataService: DailyDataService,
    private readonly languagesService: LanguagesService
  ) {}

  async getTimeSpentOnPeriod(
    getTimeSpentOnPeriodDto: GetTimeSpentOnPeriodDtoType
  ) {
    const { userId, start, end } = getTimeSpentOnPeriodDto;

    const dailyDataForPeriod = await this.dailyDataService.findRangeDailyData({
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
    getDaysOfPeriodStatsDto: GetDaysOfPeriodStatsDtoType
  ) {
    const { userId, start, end, groupBy, periodResolution } =
      getDaysOfPeriodStatsDto;

    const dailyDataForPeriod = await this.dailyDataService.findRangeDailyData({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) return [];

    switch (groupBy) {
      case "weeks":
        return getDaysOfPeriodStatsGroupByWeeks(
          dailyDataForPeriod,
          periodResolution
        );

      case "months":
        return getDaysOfPeriodStatsGroupByMonths(dailyDataForPeriod);

      default:
        break;
    }

    return dailyDataForPeriod.map(({ timeSpent, date }) => ({
      timeSpentLine: timeSpent,
      originalDate: new Date(date).toDateString(),
      date: getWeekDayName(date),
      timeSpentBar: timeSpent,
      timeSpentArea: timeSpent,
      value: formatDuration(timeSpent),
    }));
  }

  async getPeriodLanguagesTime(
    getPeriodLanguagesTimeDto: GetPeriodLanguagesTimeDtoType
  ) {
    const { userId, start, end } = getPeriodLanguagesTimeDto;

    const dailyDataForPeriod = await this.dailyDataService.findRangeDailyData({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) return [];

    const totalTimeSpentOnPeriod = (
      await this.getTimeSpentOnPeriod({ userId, start, end })
    ).rawTime;

    const kVLangTime = (
      await Promise.all(
        dailyDataForPeriod.map(({ id }) =>
          this.languagesService.findAllLanguages({ dailyDataId: id })
        )
      )
    ).reduce((acc, dayStats) => {
      Object.keys(dayStats).forEach((languageSlug) => {
        acc[languageSlug] = (acc[languageSlug] || 0) + dayStats[languageSlug];
      });
      return acc;
    }, {});

    const finalData = Object.entries(kVLangTime)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        time: timeSpent,
        value: formatDuration(timeSpent),
        percentage: parseFloat(
          ((timeSpent * 100) / totalTimeSpentOnPeriod).toFixed(2)
        ),
      }))
      .sort((a, b) => a.time - b.time);

    return finalData;
  }

  async getPeriodLanguagesPerDay(
    getPeriodLanguagesPerDayDto: GetPeriodLanguagesPerDayDtoType
  ) {
    const { userId, start, end, groupBy, periodResolution } =
      getPeriodLanguagesPerDayDto;

    const dailyDataForPeriod = await this.dailyDataService.findRangeDailyData({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0) return [];

    switch (groupBy) {
      case "weeks":
        return getPeriodLanguagesGroupByWeeks(
          dailyDataForPeriod,
          periodResolution,
          this.languagesService
        );

      case "months":
        return getPeriodLanguagesGroupByMonths(
          dailyDataForPeriod,
          this.languagesService
        );

      default:
        break;
    }

    const allLanguages = await Promise.all(
      dailyDataForPeriod.map(({ id }) =>
        this.languagesService.findAllLanguages({ dailyDataId: id })
      )
    );

    return dailyDataForPeriod.map(({ date, timeSpent }, index) => ({
      originalDate: new Date(date).toDateString(),
      date: getWeekDayName(date),
      timeSpent,
      ...allLanguages[index],
    }));
  }

  async getDailyStatsForChart(
    getDailyStatsForChartDto: GetDailyStatsForChartDtoType
  ) {
    const { userId, dateString } = getDailyStatsForChartDto;

    const dayData = await this.dailyDataService.findOneDailyData({
      userId,
      date: dateString,
    });

    if (!dayData || dayData.timeSpent === 0)
      return {
        formattedTotalTimeSpent: formatDuration(0),
        finalData: [],
      };

    const dayLanguagesTime = await this.languagesService.findAllLanguages({
      dailyDataId: dayData.id,
    });

    const totalTimeSpent = dayData.timeSpent;

    const finalData = Object.entries(dayLanguagesTime)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        timeSpent,
        formattedValue: formatDuration(timeSpent),
        percentage: parseFloat(((timeSpent * 100) / totalTimeSpent).toFixed(2)),
      }))
      .sort((a, b) => b.timeSpent - a.timeSpent);

    const formattedTotalTimeSpent = formatDuration(totalTimeSpent);

    return {
      finalData,
      formattedTotalTimeSpent,
    };
  }

  async getPeriodGeneralStats(
    getPeriodGeneralStatsDto: GetPeriodGeneralStatsDtoType
  ) {
    const { userId, start, end, todaysDateString, groupBy, periodResolution } =
      getPeriodGeneralStatsDto;

    const dailyDataForPeriod = await this.dailyDataService.findRangeDailyData({
      userId,
      start,
      end,
    });

    if (dailyDataForPeriod.length === 0)
      return {
        avgTime: formatDuration(0),
        percentageToAvg: 0,
        mostActiveDate: "N/A",
        mostUsedLanguageSlug: "N/A",
      };

    switch (groupBy) {
      case "weeks":
        return getGeneralStatsOnPeriodGroupByWeeks(
          userId,
          start,
          end,
          todaysDateString,
          this,
          dailyDataForPeriod,
          periodResolution
        );

      case "months":
        return getGeneralStatsOnPeriodGroupByMonths(
          userId,
          start,
          end,
          todaysDateString,
          this,
          dailyDataForPeriod
        );

      default:
        break;
    }

    const numberOfDays = differenceInDays(end, start) + 1;
    const timeSpentOnPeriod = (
      await this.getTimeSpentOnPeriod({
        userId,
        start,
        end,
      })
    ).rawTime;

    const mean = Math.floor(timeSpentOnPeriod / numberOfDays);

    const timeSpentToday =
      (
        await this.dailyDataService.findOneDailyData({
          userId,
          date: todaysDateString,
        })
      )?.timeSpent || 0;

    const percentageToAvg =
      mean === 0
        ? 0
        : parseFloat((((timeSpentToday - mean) / mean) * 100).toFixed(2));

    const maxTimeSpentPerDay =
      dailyDataForPeriod.length > 0
        ? Math.max(...dailyDataForPeriod.map((day) => day.timeSpent))
        : 0;

    const mostActiveDate: NAString =
      maxTimeSpentPerDay === 0
        ? "N/A"
        : new Date(
            dailyDataForPeriod.find(
              (day) => day.timeSpent === maxTimeSpentPerDay
            )?.date || convertToISODate(new Date(start))
          ).toDateString();

    const mostUsedLanguageSlug = await getMostUsedLanguageOnPeriod(
      this,
      userId,
      start,
      end
    );

    return {
      avgTime: formatDuration(mean),
      percentageToAvg,
      mostActiveDate,
      mostUsedLanguageSlug,
    };
  }
}
