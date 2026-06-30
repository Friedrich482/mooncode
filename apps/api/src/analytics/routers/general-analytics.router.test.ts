import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { DailyDataModule } from "@/daily-data/daily-data.module";
import { LanguagesModule } from "@/languages/languages.module";
import { TrpcModule } from "@/trpc/trpc.module";
import { TrpcService } from "@/trpc/trpc.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { GeneralAnalyticsService } from "../services/general-analytics.service";
import { GeneralAnalyticsRouter } from "./general-analytics.router";

describe("GeneralAnalyticsRouter", () => {
  let generalAnalyticsRouter: GeneralAnalyticsRouter;
  let trpcService: TrpcService;

  let generalAnalyticsService: {
    getTimeSpentOnPeriod: Mock<Procedure>;
    getDaysOfPeriodStats: Mock<Procedure>;
    getPeriodLanguagesTime: Mock<Procedure>;
    getPeriodLanguagesPerDay: Mock<Procedure>;
    getDailyStats: Mock<Procedure>;
    getPeriodGeneralStats: Mock<Procedure>;
  };

  const mockedCtx = {
    req: {
      headers: {
        "x-forwarded-for": "",
      } as Record<string, string>,
    } as Request,

    res: {
      cookie: vi.fn() as Function,
      clearCookie: vi.fn() as Function,
    } as Response,
  };

  const mockedPayload = {
    sub: "01kv1aqeffy49vc8bzq19nwvhh",
    iat: 1780458967,
    exp: 1782878167,
  };

  let caller: ReturnType<
    ReturnType<GeneralAnalyticsRouter["procedures"]>["general"]["createCaller"]
  >;

  beforeEach(async () => {
    vi.clearAllMocks();

    generalAnalyticsService = {
      getTimeSpentOnPeriod: vi.fn(),
      getDaysOfPeriodStats: vi.fn(),
      getPeriodLanguagesTime: vi.fn(),
      getPeriodLanguagesPerDay: vi.fn(),
      getDailyStats: vi.fn(),
      getPeriodGeneralStats: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [TrpcModule, DailyDataModule, LanguagesModule],
      providers: [
        GeneralAnalyticsRouter,
        {
          provide: GeneralAnalyticsService,
          useValue: generalAnalyticsService,
        },
      ],
    }).compile();

    generalAnalyticsRouter = moduleRef.get(GeneralAnalyticsRouter);
    trpcService = moduleRef.get(TrpcService);

    caller = trpcService.trpc.createCallerFactory(
      generalAnalyticsRouter.procedures().general,
    )(mockedCtx);

    vi.spyOn(trpcService, "getPayload").mockResolvedValue(mockedPayload);
  });

  describe("getTimeSpentOnPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      rawTime: 34800,
      formattedTime: "9 hrs 40 mins",
    };

    it("should call the getTimeSpentOnPeriod method of the GeneralAnalyticsService", async () => {
      generalAnalyticsService.getTimeSpentOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      await caller.getTimeSpentOnPeriod(mockedEntry);

      expect(generalAnalyticsService.getTimeSpentOnPeriod).toHaveBeenCalled();
      expect(generalAnalyticsService.getTimeSpentOnPeriod).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return an object containing the expected properties", async () => {
      generalAnalyticsService.getTimeSpentOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      const { formattedTime, rawTime } =
        await caller.getTimeSpentOnPeriod(mockedEntry);

      expect(rawTime).toBeDefined();
      expect(rawTime).toEqual(mockedOutput.rawTime);

      expect(formattedTime).toBeDefined();
      expect(formattedTime).toEqual(mockedOutput.formattedTime);
    });
  });

  describe("getDaysOfPeriodStats", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      groupBy: "days" as const,
      periodResolution: "day" as const,
      userId: mockedPayload.sub,
    };

    const mockedOutput = [
      {
        timeSpentLine: 4500,
        originalDate: "Wed Jun 17 2026",
        date: "Wednesday",
        timeSpentBar: 4500,
        timeSpentArea: 4500,
        value: "1 hr 15 mins",
      },
      {
        timeSpentLine: 2500,
        originalDate: "Thu Jun 18 2026",
        date: "Thursday",
        timeSpentBar: 2500,
        timeSpentArea: 2500,
        value: "41 mins",
      },
      {
        timeSpentLine: 12900,
        originalDate: "Fri Jun 19 2026",
        date: "Friday",
        timeSpentBar: 12900,
        timeSpentArea: 12900,
        value: "3 hrs 35 mins",
      },
      {
        timeSpentLine: 8200,
        originalDate: "Sat Jun 20 2026",
        date: "Saturday",
        timeSpentBar: 8200,
        timeSpentArea: 8200,
        value: "2 hrs 16 mins",
      },
      {
        timeSpentLine: 6700,
        originalDate: "Sun Jun 21 2026",
        date: "Sunday",
        timeSpentBar: 6700,
        timeSpentArea: 6700,
        value: "1 hr 51 mins",
      },
    ];

    it("should call the getDaysOfPeriodStats method of the GeneralAnalyticsService", async () => {
      generalAnalyticsService.getDaysOfPeriodStats.mockResolvedValue(
        mockedOutput,
      );

      await caller.getDaysOfPeriodStats(mockedEntry);

      expect(generalAnalyticsService.getDaysOfPeriodStats).toHaveBeenCalled();
      expect(generalAnalyticsService.getDaysOfPeriodStats).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return the expected data", async () => {
      generalAnalyticsService.getDaysOfPeriodStats.mockResolvedValue(
        mockedOutput,
      );

      const daysOfPeriodStats = await caller.getDaysOfPeriodStats(mockedEntry);

      expect(daysOfPeriodStats).toBeDefined();
      expect(daysOfPeriodStats).toEqual(mockedOutput);
    });
  });

  describe("getPeriodLanguagesTime", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      userId: mockedPayload.sub,
    };

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

    it("should call the getPeriodLanguagesTime method of the GeneralAnalyticsService", async () => {
      generalAnalyticsService.getPeriodLanguagesTime.mockResolvedValue(
        mockedOutput,
      );

      await caller.getPeriodLanguagesTime(mockedEntry);

      expect(generalAnalyticsService.getPeriodLanguagesTime).toHaveBeenCalled();
      expect(
        generalAnalyticsService.getPeriodLanguagesTime,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the expected data", async () => {
      generalAnalyticsService.getPeriodLanguagesTime.mockResolvedValue(
        mockedOutput,
      );

      const periodLanguagesTime =
        await caller.getPeriodLanguagesTime(mockedEntry);

      expect(periodLanguagesTime).toBeDefined();
      expect(periodLanguagesTime).toEqual(mockedOutput);
    });
  });

  describe("getPeriodLanguagesPerDay", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      groupBy: "days" as const,
      userId: mockedPayload.sub,
    };

    const mockedOutput = [
      {
        date: "Wednesday",
        originalDate: "Wed Jun 17 2026",
        rust: 2500,
        timeSpent: 4500,
        typescript: 2000,
      },
      {
        date: "Thursday",
        javascript: 1000,
        originalDate: "Thu Jun 18 2026",
        python: 1500,
        timeSpent: 2500,
      },
      {
        date: "Friday",
        docker: 5000,
        json: 2000,
        originalDate: "Fri Jun 19 2026",
        timeSpent: 12900,
        yaml: 5900,
      },
      {
        date: "Saturday",
        go: 2000,
        originalDate: "Sat Jun 20 2026",
        timeSpent: 8200,
        typescript: 6200,
      },
      {
        css: 1000,
        date: "Sunday",
        html: 1000,
        originalDate: "Sun Jun 21 2026",
        timeSpent: 6700,
        typescript: 4700,
      },
    ];

    it("should call the getPeriodLanguagesPerDay method of the GeneralAnalyticsService", async () => {
      generalAnalyticsService.getPeriodLanguagesPerDay.mockResolvedValue(
        mockedOutput,
      );

      await caller.getPeriodLanguagesPerDay(mockedEntry);

      expect(
        generalAnalyticsService.getPeriodLanguagesPerDay,
      ).toHaveBeenCalled();
      expect(
        generalAnalyticsService.getPeriodLanguagesPerDay,
      ).toHaveBeenCalledWith({ ...mockedEntry, periodResolution: "day" });
    });

    it("should return the expected data", async () => {
      generalAnalyticsService.getPeriodLanguagesPerDay.mockResolvedValue(
        mockedOutput,
      );

      const periodLanguagesPerDay =
        await caller.getPeriodLanguagesPerDay(mockedEntry);

      expect(periodLanguagesPerDay).toBeDefined();
      expect(periodLanguagesPerDay).toEqual(mockedOutput);
    });
  });

  describe("getDailyStats", () => {
    const mockedEntry = {
      userId: mockedPayload.sub,
      dateString: "2026-06-23",
    };

    const mockedOutput = {
      formattedTotalTimeSpent: "1 hr 15 mins",
      languagesStatsOnDay: [
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
      ],
    };

    it("should call the getDailyStats method of the GeneralAnalyticsService", async () => {
      generalAnalyticsService.getDailyStats.mockResolvedValue(mockedOutput);

      await caller.getDailyStats(mockedEntry);

      expect(generalAnalyticsService.getDailyStats).toHaveBeenCalled();
      expect(generalAnalyticsService.getDailyStats).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return an object containing the expected fields", async () => {
      generalAnalyticsService.getDailyStats.mockResolvedValue(mockedOutput);

      const { formattedTotalTimeSpent, languagesStatsOnDay } =
        await caller.getDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual(
        mockedOutput.formattedTotalTimeSpent,
      );

      expect(languagesStatsOnDay).toBeDefined();
      expect(languagesStatsOnDay).toEqual(mockedOutput.languagesStatsOnDay);
    });
  });

  describe("getPeriodGeneralStats", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      groupBy: "days" as const,
      todaysDateString: "2026-06-23",
      periodResolution: "day" as const,
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      avgTime: "4 hrs 50 mins",
      mostActiveDate: "Fri Jun 19 2026",
      percentageToAvg: -48.85,
      mostUsedLanguageSlug: "typescript",
    };

    it("should call the getPeriodGeneralStats method of the GeneralAnalyticsService", async () => {
      generalAnalyticsService.getPeriodGeneralStats.mockResolvedValue(
        mockedOutput,
      );

      await caller.getPeriodGeneralStats(mockedEntry);

      expect(generalAnalyticsService.getPeriodGeneralStats).toHaveBeenCalled();
      expect(
        generalAnalyticsService.getPeriodGeneralStats,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return an object containing the expected fields", async () => {
      generalAnalyticsService.getPeriodGeneralStats.mockResolvedValue(
        mockedOutput,
      );

      const { avgTime, mostActiveDate, mostUsedLanguageSlug, percentageToAvg } =
        await caller.getPeriodGeneralStats(mockedEntry);

      expect(avgTime).toBeDefined();
      expect(avgTime).toEqual(mockedOutput.avgTime);

      expect(mostActiveDate).toBeDefined();
      expect(mostActiveDate).toEqual(mockedOutput.mostActiveDate);

      expect(mostUsedLanguageSlug).toBeDefined();
      expect(mostUsedLanguageSlug).toEqual(mockedOutput.mostUsedLanguageSlug);

      expect(percentageToAvg).toBeDefined();
      expect(percentageToAvg).toEqual(mockedOutput.percentageToAvg);
    });
  });
});
