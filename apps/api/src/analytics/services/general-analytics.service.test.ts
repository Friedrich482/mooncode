import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { DailyDataService } from "@/daily-data/daily-data.service";
import { LanguagesService } from "@/languages/languages.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import * as getDaysOfPeriodStatsGroupedByDaysUtils from "../utils/general/get-days-of-period-stats-grouped-by-days";
import * as getDaysOfPeriodStatsGroupedByMonthsUtils from "../utils/general/get-days-of-period-stats-grouped-by-months";
import * as getDaysOfPeriodStatsGroupedByWeeksUtils from "../utils/general/get-days-of-period-stats-grouped-by-weeks";
import * as getPeriodLanguagesGroupedByDaysUtils from "../utils/general/get-period-languages-grouped-by-days";
import * as getPeriodLanguagesGroupedByMonthsUtils from "../utils/general/get-period-languages-grouped-by-months";
import * as getPeriodLanguagesGroupedByWeeksUtils from "../utils/general/get-period-languages-grouped-by-weeks";
import { GeneralAnalyticsService } from "./general-analytics.service";

describe("GeneralAnalyticsService", () => {
  let generalAnalyticsService: GeneralAnalyticsService;

  let dailyDataService: {
    findRange: Mock<Procedure>;
    findOne: Mock<Procedure>;
  };
  let languagesService: { findAll: Mock<Procedure> };

  beforeEach(async () => {
    vi.clearAllMocks();

    dailyDataService = {
      findOne: vi.fn(),
      findRange: vi.fn(),
    };

    languagesService = {
      findAll: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GeneralAnalyticsService,
        { provide: DailyDataService, useValue: dailyDataService },
        { provide: LanguagesService, useValue: languagesService },
      ],
    }).compile();

    generalAnalyticsService = moduleRef.get(GeneralAnalyticsService);
  });

  describe("getTimeSpentOnPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      userId: "1",
    };

    const mockedPeriodData = [
      {
        id: "2",
        timeSpent: 4500,
        date: "2026-06-17",
      },
      {
        id: "3",
        timeSpent: 2500,
        date: "2026-06-18",
      },
      {
        id: "4",
        timeSpent: 12900,
        date: "2026-06-19",
      },
      {
        id: "5",
        timeSpent: 8200,
        date: "2026-06-20",
      },
      {
        id: "6",
        timeSpent: 6700,
        date: "2026-06-21",
      },
    ];

    it("should return the time spent coding on a period in seconds (rawTime)", async () => {
      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const { rawTime } =
        await generalAnalyticsService.getTimeSpentOnPeriod(mockedEntry);
      expect(rawTime).toBeDefined();
      expect(rawTime).toEqual(34800);
    });

    it("should return the time spent coding on a period in a formatted form (H hrs M mins)", async () => {
      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const { formattedTime } =
        await generalAnalyticsService.getTimeSpentOnPeriod(mockedEntry);
      expect(formattedTime).toBeDefined();
      expect(formattedTime).toEqual("9 hrs 40 mins");
    });

    it("should return 0 if there is no data found on the period", async () => {
      dailyDataService.findRange.mockResolvedValue([]);

      const { rawTime } =
        await generalAnalyticsService.getTimeSpentOnPeriod(mockedEntry);
      expect(rawTime).toBeDefined();
      expect(rawTime).toEqual(0);
    });
  });

  describe("getDaysOfPeriodStats", () => {
    const mockedPeriodData = [
      {
        id: "2",
        timeSpent: 4500,
        date: "2026-06-17",
      },
      {
        id: "3",
        timeSpent: 2500,
        date: "2026-06-18",
      },
      {
        id: "4",
        timeSpent: 12900,
        date: "2026-06-19",
      },
      {
        id: "5",
        timeSpent: 8200,
        date: "2026-06-20",
      },
      {
        id: "6",
        timeSpent: 6700,
        date: "2026-06-21",
      },
    ];

    it("should return an empty array if there is no data of the period selected", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
        userId: "1",
      };

      dailyDataService.findRange.mockResolvedValue([]);

      const data =
        await generalAnalyticsService.getDaysOfPeriodStats(mockedEntry);

      expect(data).toBeDefined();
      expect(data).toEqual([]);
    });

    it("should call the getDaysOfPeriodStatsGroupedByDays function when the groupBy is 'days'", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
        userId: "1",
      };

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const getDaysOfPeriodStatsGroupedByDays = vi.spyOn(
        getDaysOfPeriodStatsGroupedByDaysUtils,
        "getDaysOfPeriodStatsGroupedByDays",
      );

      await generalAnalyticsService.getDaysOfPeriodStats(mockedEntry);

      expect(getDaysOfPeriodStatsGroupedByDays).toHaveBeenCalled();
      expect(getDaysOfPeriodStatsGroupedByDays).toHaveBeenCalledWith(
        mockedPeriodData,
      );
    });

    it("should call the getDaysOfPeriodStatsGroupedByDays function when the groupBy is undefined", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        periodResolution: "day" as const,
        userId: "1",
      };

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const getDaysOfPeriodStatsGroupedByDaysSpy = vi.spyOn(
        getDaysOfPeriodStatsGroupedByDaysUtils,
        "getDaysOfPeriodStatsGroupedByDays",
      );

      await generalAnalyticsService.getDaysOfPeriodStats(mockedEntry);

      expect(getDaysOfPeriodStatsGroupedByDaysSpy).toHaveBeenCalled();
      expect(getDaysOfPeriodStatsGroupedByDaysSpy).toHaveBeenCalledWith(
        mockedPeriodData,
      );
    });

    it("should call the getDaysOfPeriodStatsGroupedByWeeks when the groupBy is 'weeks'", async () => {
      const mockedEntry = {
        start: "2026-06-12",
        end: "2026-06-21",
        groupBy: "weeks" as const,
        periodResolution: "week" as const,
        userId: "1",
      };

      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-06-12",
        },
        {
          id: "3",
          timeSpent: 1500,
          date: "2026-06-13",
        },
        {
          id: "4",
          timeSpent: 3800,
          date: "2026-06-14",
        },
        {
          id: "5",
          timeSpent: 14500,
          date: "2026-06-15",
        },
        {
          id: "6",
          timeSpent: 5900,
          date: "2026-06-16",
        },
        {
          id: "7",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "8",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "9",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "10",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "11",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const getDaysOfPeriodStatsGroupedByWeeksSpy = vi.spyOn(
        getDaysOfPeriodStatsGroupedByWeeksUtils,
        "getDaysOfPeriodStatsGroupedByWeeks",
      );

      await generalAnalyticsService.getDaysOfPeriodStats(mockedEntry);

      expect(getDaysOfPeriodStatsGroupedByWeeksSpy).toHaveBeenCalled();
      expect(getDaysOfPeriodStatsGroupedByWeeksSpy).toHaveBeenCalledWith(
        mockedPeriodData,
        "week",
      );
    });

    it("should call the getDaysOfPeriodStatsGroupedByMonths function when the groupBy is 'months'", async () => {
      const mockedEntry = {
        start: "2026-05-12",
        end: "2026-06-21",
        groupBy: "months" as const,
        periodResolution: "month" as const,
        userId: "1",
      };

      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-05-12",
        },
        {
          id: "3",
          timeSpent: 1500,
          date: "2026-06-13",
        },
        {
          id: "4",
          timeSpent: 3800,
          date: "2026-06-14",
        },
        {
          id: "5",
          timeSpent: 14500,
          date: "2026-06-15",
        },
        {
          id: "6",
          timeSpent: 5900,
          date: "2026-06-16",
        },
        {
          id: "7",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "8",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "9",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "10",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "11",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const getDaysOfPeriodStatsGroupedByMonthsSpy = vi.spyOn(
        getDaysOfPeriodStatsGroupedByMonthsUtils,
        "getDaysOfPeriodStatsGroupedByMonths",
      );

      await generalAnalyticsService.getDaysOfPeriodStats(mockedEntry);

      expect(getDaysOfPeriodStatsGroupedByMonthsSpy).toHaveBeenCalled();
      expect(getDaysOfPeriodStatsGroupedByMonthsSpy).toHaveBeenCalledWith(
        mockedPeriodData,
      );
    });
  });

  describe("getPeriodLanguagesTime", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      userId: "1",
    };

    it("should return the time spent per language on the period, with some stats such as the percentage", async () => {
      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "3",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "4",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "5",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "6",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      const mockedOutput = [
        {
          languageSlug: "javascript",
          time: 1000,
          value: "16 mins",
          percentage: 2.87,
        },
        {
          languageSlug: "html",
          time: 1000,
          value: "16 mins",
          percentage: 2.87,
        },
        {
          languageSlug: "css",
          time: 1000,
          value: "16 mins",
          percentage: 2.87,
        },
        {
          languageSlug: "python",
          time: 1500,
          value: "25 mins",
          percentage: 4.31,
        },
        {
          languageSlug: "json",
          time: 2000,
          value: "33 mins",
          percentage: 5.75,
        },
        {
          languageSlug: "go",
          time: 2000,
          value: "33 mins",
          percentage: 5.75,
        },
        {
          languageSlug: "rust",
          percentage: 7.18,
          time: 2500,
          value: "41 mins",
        },
        {
          languageSlug: "docker",
          time: 5000,
          value: "1 hr 23 mins",
          percentage: 14.37,
        },
        {
          languageSlug: "yaml",
          time: 5900,
          value: "1 hr 38 mins",
          percentage: 16.95,
        },
        {
          languageSlug: "typescript",
          time: 12900,
          value: "3 hrs 35 mins",
          percentage: 37.07,
        },
      ];

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      languagesService.findAll
        .mockResolvedValueOnce({ rust: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ javascript: 1000, python: 1500 })
        .mockResolvedValueOnce({ json: 2000, docker: 5000, yaml: 5900 })
        .mockResolvedValueOnce({ go: 2000, typescript: 6200 })
        .mockResolvedValueOnce({ typescript: 4700, html: 1000, css: 1000 });

      const periodLanguagesTime =
        await generalAnalyticsService.getPeriodLanguagesTime(mockedEntry);

      expect(periodLanguagesTime).toBeDefined();
      expect(periodLanguagesTime).toEqual(mockedOutput);
    });

    it("should return an empty array when there is no data on the period", async () => {
      dailyDataService.findRange.mockResolvedValue([]);
      const periodLanguagesTime =
        await generalAnalyticsService.getPeriodLanguagesTime(mockedEntry);

      expect(periodLanguagesTime).toBeDefined();
      expect(periodLanguagesTime).toEqual([]);
    });
  });

  describe("getPeriodLanguagesPerDay", () => {
    it("should return an empty array if there is no data on the selected period", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
        userId: "1",
      };

      dailyDataService.findRange.mockResolvedValue([]);

      const periodLanguagesPerDay =
        await generalAnalyticsService.getPeriodLanguagesPerDay(mockedEntry);

      expect(periodLanguagesPerDay).toBeDefined();
      expect(periodLanguagesPerDay).toEqual([]);
    });

    it("should call the getPeriodLanguagesGroupedByDays function if the groupBy is 'days'", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
        userId: "1",
      };

      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "3",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "4",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "5",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "6",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      languagesService.findAll
        .mockResolvedValueOnce({ rust: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ javascript: 1000, python: 1500 })
        .mockResolvedValueOnce({ json: 2000, docker: 5000, yaml: 5900 })
        .mockResolvedValueOnce({ go: 2000, typescript: 6200 })
        .mockResolvedValueOnce({ typescript: 4700, html: 1000, css: 1000 });

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const getPeriodLanguagesGroupedByDaysSpy = vi.spyOn(
        getPeriodLanguagesGroupedByDaysUtils,
        "getPeriodLanguagesGroupedByDays",
      );

      await generalAnalyticsService.getPeriodLanguagesPerDay(mockedEntry);

      expect(getPeriodLanguagesGroupedByDaysSpy).toHaveBeenCalled();
    });

    it("should call the getPeriodLanguagesGroupedByDays function if the groupBy is undefined", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        periodResolution: "day" as const,
        userId: "1",
      };
      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "3",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "4",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "5",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "6",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      languagesService.findAll
        .mockResolvedValueOnce({ rust: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ javascript: 1000, python: 1500 })
        .mockResolvedValueOnce({ json: 2000, docker: 5000, yaml: 5900 })
        .mockResolvedValueOnce({ go: 2000, typescript: 6200 })
        .mockResolvedValueOnce({
          typescript: 4700,
          html: 1000,
          css: 1000,
        });

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      const getPeriodLanguagesGroupedByDaysSpy = vi.spyOn(
        getPeriodLanguagesGroupedByDaysUtils,
        "getPeriodLanguagesGroupedByDays",
      );

      await generalAnalyticsService.getPeriodLanguagesPerDay(mockedEntry);

      expect(getPeriodLanguagesGroupedByDaysSpy).toHaveBeenCalled();
    });

    it("should call the getPeriodLanguagesGroupedByWeeks function when the groupBy is 'weeks'", async () => {
      const mockedEntry = {
        start: "2026-06-12",
        end: "2026-06-21",
        groupBy: "weeks" as const,
        periodResolution: "week" as const,
        userId: "1",
      };

      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-06-12",
        },
        {
          id: "3",
          timeSpent: 1500,
          date: "2026-06-13",
        },
        {
          id: "4",
          timeSpent: 3800,
          date: "2026-06-14",
        },
        {
          id: "5",
          timeSpent: 14500,
          date: "2026-06-15",
        },
        {
          id: "6",
          timeSpent: 5900,
          date: "2026-06-16",
        },
        {
          id: "7",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "8",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "9",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "10",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "11",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      languagesService.findAll
        .mockResolvedValueOnce({ rust: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ javascript: 1500 })
        .mockResolvedValueOnce({ javascript: 1800, python: 2000 })
        .mockResolvedValueOnce({ json: 4000, docker: 5000, yaml: 5500 })
        .mockResolvedValueOnce({ yaml: 5900 })
        .mockResolvedValueOnce({ c: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ sql: 2500 })
        .mockResolvedValueOnce({ json: 4000, docker: 5000, yaml: 3900 })
        .mockResolvedValueOnce({ go: 2000, typescript: 6200 })
        .mockResolvedValueOnce({
          typescript: 4700,
          html: 1000,
          css: 1000,
        });

      const getPeriodLanguagesGroupedByWeeksSpy = vi.spyOn(
        getPeriodLanguagesGroupedByWeeksUtils,
        "getPeriodLanguagesGroupedByWeeks",
      );

      await generalAnalyticsService.getPeriodLanguagesPerDay(mockedEntry);

      expect(getPeriodLanguagesGroupedByWeeksSpy).toHaveBeenCalled();
    });

    it("should call the getPeriodLanguagesGroupedByMonths function when the groupBy is 'months'", async () => {
      const mockedEntry = {
        start: "2026-05-12",
        end: "2026-06-21",
        groupBy: "months" as const,
        periodResolution: "month" as const,
        userId: "1",
      };

      const mockedPeriodData = [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-05-12",
        },
        {
          id: "3",
          timeSpent: 4500,
          date: "2026-06-12",
        },
        {
          id: "4",
          timeSpent: 1500,
          date: "2026-06-13",
        },
        {
          id: "5",
          timeSpent: 3800,
          date: "2026-06-14",
        },
        {
          id: "6",
          timeSpent: 14500,
          date: "2026-06-15",
        },
        {
          id: "7",
          timeSpent: 5900,
          date: "2026-06-16",
        },
        {
          id: "8",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "9",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "10",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "11",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "12",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ];

      dailyDataService.findRange.mockResolvedValue(mockedPeriodData);

      languagesService.findAll
        .mockResolvedValueOnce({ rust: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ zig: 2500, java: 2000 })
        .mockResolvedValueOnce({ javascript: 1500 })
        .mockResolvedValueOnce({ javascript: 1800, python: 2000 })
        .mockResolvedValueOnce({ json: 4000, docker: 5000, yaml: 5500 })
        .mockResolvedValueOnce({ yaml: 5900 })
        .mockResolvedValueOnce({ c: 2500, typescript: 2000 })
        .mockResolvedValueOnce({ sql: 2500 })
        .mockResolvedValueOnce({ json: 4000, docker: 5000, yaml: 3900 })
        .mockResolvedValueOnce({ go: 2000, typescript: 6200 })
        .mockResolvedValueOnce({
          typescript: 4700,
          html: 1000,
          css: 1000,
        });

      const getPeriodLanguagesGroupedByMonthsSpy = vi.spyOn(
        getPeriodLanguagesGroupedByMonthsUtils,
        "getPeriodLanguagesGroupedByMonths",
      );

      await generalAnalyticsService.getPeriodLanguagesPerDay(mockedEntry);

      expect(getPeriodLanguagesGroupedByMonthsSpy).toHaveBeenCalled();
    });
  });

  describe("getDailyStats", () => {
    const mockedEntry = {
      userId: "1",
      dateString: "2026-06-23",
    };

    it("should return the time spent per language on that day with other information such as the percentage", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 4500,
        date: "2026-05-23",
      });

      languagesService.findAll.mockResolvedValue({
        rust: 2000,
        typescript: 2500,
      });

      const mockedOutput = [
        {
          languageSlug: "typescript",
          timeSpent: 2500,
          formattedValue: "41 mins",
          percentage: 55.56,
        },
        {
          languageSlug: "rust",
          timeSpent: 2000,
          formattedValue: "33 mins",
          percentage: 44.44,
        },
      ];

      const { languagesStatsOnDay } =
        await generalAnalyticsService.getDailyStats(mockedEntry);

      expect(languagesStatsOnDay).toBeDefined();
      expect(languagesStatsOnDay).toEqual(mockedOutput);
    });

    it("should return the time spent coding on the day in a formatted shape", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 4500,
        date: "2026-05-23",
      });

      languagesService.findAll.mockResolvedValue({
        rust: 2000,
        typescript: 2500,
      });

      const { formattedTotalTimeSpent } =
        await generalAnalyticsService.getDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("1 hr 15 mins");
    });

    it("should return an empty state if there is no data found on the day", async () => {
      dailyDataService.findOne.mockResolvedValue(null);

      const { formattedTotalTimeSpent, languagesStatsOnDay } =
        await generalAnalyticsService.getDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("0 secs");

      expect(languagesStatsOnDay).toBeDefined();
      expect(languagesStatsOnDay).toEqual([]);
    });

    it("should return an empty state if there the time spent on the day is zero", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 0,
        date: "2026-05-23",
      });

      const { formattedTotalTimeSpent, languagesStatsOnDay } =
        await generalAnalyticsService.getDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("0 secs");

      expect(languagesStatsOnDay).toBeDefined();
      expect(languagesStatsOnDay).toEqual([]);
    });
  });
});
