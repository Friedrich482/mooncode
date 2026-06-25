import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { ProjectsService } from "@/projects/projects.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { ProjectsAnalyticsService } from "./projects-analytics.service";

describe("ProjectsAnalyticsService", () => {
  let projectsAnalyticsService: ProjectsAnalyticsService;

  let dailyDataService: {
    findRange: Mock<Procedure>;
    findOne: Mock<Procedure>;
  };
  let projectsService: {
    create: Mock<Procedure>;
    checkExists: Mock<Procedure>;
  };

  let mockedDrizzle: MockedDrizzle;

  beforeEach(async () => {
    vi.clearAllMocks();

    dailyDataService = {
      findOne: vi.fn(),
      findRange: vi.fn(),
    };

    projectsService = {
      create: vi.fn(),
      checkExists: vi.fn(),
    };

    mockedDrizzle = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      orderBy: vi.fn(),
      innerJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      as: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsAnalyticsService,
        { provide: DailyDataService, useValue: dailyDataService },
        { provide: ProjectsService, useValue: projectsService },
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    projectsAnalyticsService = moduleRef.get(ProjectsAnalyticsService);
  });

  describe("findProjectByNameOnRange", () => {
    const mockedEntry = {
      userId: "1",
      name: "mooncode",
      start: "2026-06-17",
      end: "2026-06-21",
    };

    it("should return an array containing the time spent on the project for each day", async () => {
      const mockedTimeSpentPerDayOnProject = [
        {
          date: "2026-06-17",
          timeSpent: 4500,
        },
        {
          date: "2026-06-18",
          timeSpent: 7500,
        },
        {
          date: "2026-06-19",
          timeSpent: 12000,
        },
        {
          date: "2026-06-20",
          timeSpent: 9800,
        },
        {
          date: "2026-06-21",
          timeSpent: 15000,
        },
      ];

      mockedDrizzle.groupBy.mockResolvedValue(mockedTimeSpentPerDayOnProject);

      const projectOnDaysOnPeriod =
        await projectsAnalyticsService.findProjectByNameOnRange(mockedEntry);

      expect(projectOnDaysOnPeriod).toBeDefined();
      expect(projectOnDaysOnPeriod).toEqual(mockedTimeSpentPerDayOnProject);
    });

    it("should add empty states for dates where there is no data for the project", async () => {
      const mockedTimeSpentPerDayOnProject = [
        {
          date: "2026-06-17",
          timeSpent: 4500,
        },
        {
          date: "2026-06-20",
          timeSpent: 9800,
        },
        {
          date: "2026-06-21",
          timeSpent: 15000,
        },
      ];

      mockedDrizzle.groupBy.mockResolvedValue(mockedTimeSpentPerDayOnProject);

      const projectOnDaysOnPeriod =
        await projectsAnalyticsService.findProjectByNameOnRange(mockedEntry);

      expect(projectOnDaysOnPeriod).toBeDefined();
      expect(projectOnDaysOnPeriod).toEqual([
        {
          date: "2026-06-17",
          timeSpent: 4500,
        },
        {
          date: "2026-06-18",
          timeSpent: 0,
        },
        {
          date: "2026-06-19",
          timeSpent: 0,
        },
        {
          date: "2026-06-20",
          timeSpent: 9800,
        },
        {
          date: "2026-06-21",
          timeSpent: 15000,
        },
      ]);
    });
  });

  describe("getLanguagesTimeOnPeriod", () => {
    it("should return an object containing the time spent per language on the period for the project", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
      };

      mockedDrizzle.orderBy.mockResolvedValue([
        {
          languageSlug: "typescript",
          totalTime: 5000,
        },
        {
          languageSlug: "javascript",
          totalTime: 2000,
        },
        {
          languageSlug: "css",
          totalTime: 7000,
        },
        {
          languageSlug: "python",
          totalTime: 1500,
        },
        {
          languageSlug: "rust",
          totalTime: 15200,
        },
      ]);

      const mockedOutput = {
        typescript: 5000,
        javascript: 2000,
        css: 7000,
        python: 1500,
        rust: 15200,
      };

      const languagesTimesOnPeriod =
        await projectsAnalyticsService.getLanguagesTimeOnPeriod(mockedEntry);

      expect(languagesTimesOnPeriod).toBeDefined();
      expect(languagesTimesOnPeriod).toEqual(mockedOutput);
    });
  });

  describe("getLanguagesTimePerDayOfPeriod", () => {
    it("should return an object containing the time spent per language by date", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
      };

      mockedDrizzle.where.mockResolvedValue([
        { languageSlug: "typescript", timeSpent: 375, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 702, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 484, date: "2026-06-17" },
        { languageSlug: "ignore", timeSpent: 7, date: "2026-06-17" },
        { languageSlug: "html", timeSpent: 8, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 18, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 27, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 67, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 332, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 124, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 197, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 130, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 579, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 249, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 366, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 87, date: "2026-06-17" },
        { languageSlug: "json", timeSpent: 12, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 13, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 1058, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 544, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 658, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 15, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 49, date: "2026-06-17" },
        { languageSlug: "json", timeSpent: 1388, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 783, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 27, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 118, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 218, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 4918, date: "2026-06-17" },
        { languageSlug: "typescript", timeSpent: 6847, date: "2026-06-19" },
        { languageSlug: "json", timeSpent: 175, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 18, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 3, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 543, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 49, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 183, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 2, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 101, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 215, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 7, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 1200, date: "2026-06-19" },
        { languageSlug: "gitignore", timeSpent: 1, date: "2026-06-19" },
        { languageSlug: "gitignore", timeSpent: 31, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 10, date: "2026-06-19" },
        { languageSlug: "json", timeSpent: 126, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 4, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 187, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 788, date: "2026-06-19" },
        { languageSlug: "typescript", timeSpent: 16, date: "2026-06-20" },
        { languageSlug: "typescript", timeSpent: 3307, date: "2026-06-20" },
        { languageSlug: "typescript", timeSpent: 744, date: "2026-06-20" },
        { languageSlug: "typescript", timeSpent: 479, date: "2026-06-20" },
        { languageSlug: "typescript", timeSpent: 11, date: "2026-06-20" },
        { languageSlug: "typescript", timeSpent: 7, date: "2026-06-20" },
        { languageSlug: "typescript", timeSpent: 10, date: "2026-06-20" },
      ]);

      const mockedOutput = {
        "2026-06-17": {
          html: 8,
          ignore: 7,
          json: 1400,
          typescript: 12138,
        },
        "2026-06-19": {
          gitignore: 32,
          json: 301,
          typescript: 10157,
        },
        "2026-06-20": {
          typescript: 4574,
        },
      };

      const languagesPerDayOfPeriod =
        await projectsAnalyticsService.getLanguagesTimePerDayOfPeriod(
          mockedEntry,
        );

      expect(languagesPerDayOfPeriod).toBeDefined();
      expect(languagesPerDayOfPeriod).toEqual(mockedOutput);
    });
  });

  describe("checkProjectExists", () => {
    it("should call the checkProjectExists method of the projectService", async () => {
      const mockedEntry = {
        name: "mooncode",
        userId: "1",
      };

      await projectsAnalyticsService.checkProjectExists(mockedEntry);

      expect(projectsService.checkExists).toHaveBeenCalled();
      expect(projectsService.checkExists).toHaveBeenCalledWith(mockedEntry);
    });
  });
});
