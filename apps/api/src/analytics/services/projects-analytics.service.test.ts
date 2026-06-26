import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import * as getProjectGeneralStatsOnPeriodGroupedByDaysUtils from "@/analytics/utils/projects/get-project-general-stats-on-period-grouped-by-days";
import * as getProjectGeneralStatsOnPeriodGroupedByMonthsUtils from "@/analytics/utils/projects/get-project-general-stats-on-period-grouped-by-months";
import * as getProjectGeneralStatsOnPeriodGroupedByWeeksUtils from "@/analytics/utils/projects/get-project-general-stats-on-period-grouped-by-weeks";
import * as getProjectLanguagesGroupedByDaysUtils from "@/analytics/utils/projects/get-project-languages-grouped-by-days";
import * as getProjectLanguagesGroupedByMonthsUtils from "@/analytics/utils/projects/get-project-languages-grouped-by-months";
import * as getProjectLanguagesGroupedByWeeksUtils from "@/analytics/utils/projects/get-project-languages-grouped-by-weeks";
import * as getProjectPerDayOfPeriodGroupedByDaysUtils from "@/analytics/utils/projects/get-project-per-day-of-period-grouped-by-days";
import * as getProjectPerDayOfPeriodGroupedByMonthsUtils from "@/analytics/utils/projects/get-project-per-day-of-period-grouped-by-months";
import * as getProjectPerDayOfPeriodGroupedByWeeksUtils from "@/analytics/utils/projects/get-project-per-day-of-period-grouped-by-weeks";
import { MockedDrizzle } from "@/common/tests/types";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { ProjectsService } from "@/projects/projects.service";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";
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
    findRange: Mock<Procedure>;
    findOne: Mock<Procedure>;
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
      findRange: vi.fn(),
      findOne: vi.fn(),
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

  describe("getPeriodProjects", () => {
    const mockedEntry = {
      userId: "1",
      start: "2026-06-17",
      end: "2026-06-21",
      page: 1,
    };

    it("should return an object containing the expected fields: periodProjects and hasNext", async () => {
      projectsService.findRange.mockResolvedValue({
        timeSpentPerProject: [
          {
            name: "mooncode",
            path: "/home/user/projects/mooncode",
            totalTimeSpent: 24000,
          },
          {
            name: "testing",
            path: "/home/user/projects/testing",
            totalTimeSpent: 5000,
          },
          {
            name: "api",
            path: "/home/user/projects/api",
            totalTimeSpent: 10000,
          },
        ],
        hasNext: false,
      });

      const mockedOutput = {
        periodProjects: [
          {
            percentage: 61.54,
            name: "mooncode",
            path: "/home/user/projects/mooncode",
            totalTimeSpent: 24000,
          },
          {
            name: "testing",
            path: "/home/user/projects/testing",
            totalTimeSpent: 5000,
            percentage: 12.82,
          },
          {
            name: "api",
            path: "/home/user/projects/api",
            totalTimeSpent: 10000,
            percentage: 25.64,
          },
        ],
        hasNext: false,
      };

      const { hasNext, periodProjects } =
        await projectsAnalyticsService.getPeriodProjects(mockedEntry);

      expect(periodProjects).toBeDefined();
      expect(periodProjects).toEqual(mockedOutput.periodProjects);

      expect(hasNext).toBeDefined();
      expect(hasNext).toEqual(mockedOutput.hasNext);
    });

    it("should set all percentages to zero if the total time spent on the period is zero", async () => {
      projectsService.findRange.mockResolvedValue({
        timeSpentPerProject: [
          {
            name: "mooncode",
            path: "/home/user/projects/mooncode",
            totalTimeSpent: 0,
          },
          {
            name: "testing",
            path: "/home/user/projects/testing",
            totalTimeSpent: 0,
          },
          {
            name: "api",
            path: "/home/user/projects/api",
            totalTimeSpent: 0,
          },
        ],
        hasNext: false,
      });

      const mockedOutput = {
        periodProjects: [
          {
            percentage: 0,
            name: "mooncode",
            path: "/home/user/projects/mooncode",
            totalTimeSpent: 0,
          },
          {
            name: "testing",
            path: "/home/user/projects/testing",
            totalTimeSpent: 0,
            percentage: 0,
          },
          {
            name: "api",
            path: "/home/user/projects/api",
            totalTimeSpent: 0,
            percentage: 0,
          },
        ],
        hasNext: false,
      };

      const { hasNext, periodProjects } =
        await projectsAnalyticsService.getPeriodProjects(mockedEntry);

      expect(periodProjects).toBeDefined();
      expect(periodProjects).toEqual(mockedOutput.periodProjects);

      expect(hasNext).toBeDefined();
      expect(hasNext).toEqual(mockedOutput.hasNext);
    });
  });

  describe("getProjectOnPeriod", () => {
    it("should return an object containing the expected fields: name, path and totalTimeSpent for the project", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
      };

      mockedDrizzle.limit.mockResolvedValue([
        {
          name: "mooncode",
          path: "/home/user/projects/mooncode",
        },
      ]);

      const mockedProjectAggregatedOnPeriod = {
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        totalTimeSpent: 24000,
      };

      mockedDrizzle.orderBy.mockResolvedValue([
        mockedProjectAggregatedOnPeriod,
      ]);

      const mockedOutput = mockedProjectAggregatedOnPeriod;

      const projectAggregatedOnPeriod =
        await projectsAnalyticsService.getProjectOnPeriod(mockedEntry);

      expect(projectAggregatedOnPeriod).toBeDefined();
      expect(projectAggregatedOnPeriod).toEqual(mockedOutput);
    });

    it("should return an empty state if the time spent on the project on that period is zero", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
      };

      mockedDrizzle.limit.mockResolvedValue([
        {
          name: "mooncode",
          path: "/home/user/projects/mooncode",
        },
      ]);

      mockedDrizzle.orderBy.mockResolvedValue([]);

      const mockedOutput = {
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        totalTimeSpent: 0,
      };

      const projectAggregatedOnPeriod =
        await projectsAnalyticsService.getProjectOnPeriod(mockedEntry);

      expect(projectAggregatedOnPeriod).toBeDefined();
      expect(projectAggregatedOnPeriod).toEqual(mockedOutput);
    });

    it("should throw an error if the user doesn't have any project ", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
      };

      mockedDrizzle.limit.mockResolvedValue([]);

      const error = await projectsAnalyticsService
        .getProjectOnPeriod(mockedEntry)
        .catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("NOT_FOUND");
      expect(error)
        .property("message")
        .match(/project/i);
    });
  });

  describe("getProjectPerDayOfPeriod", () => {
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

    it("should return an empty array if there is no data for the project of the period selected", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue([]);

      const data =
        await projectsAnalyticsService.getProjectPerDayOfPeriod(mockedEntry);

      expect(data).toBeDefined();
      expect(data).toEqual([]);
    });

    it("should call the getProjectPerDayOfPeriodGroupedByDays utility function if the groupBy is 'days'", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      const getProjectPerDayOfPeriodGroupedByDaysSpy = vi.spyOn(
        getProjectPerDayOfPeriodGroupedByDaysUtils,
        "getProjectPerDayOfPeriodGroupedByDays",
      );

      await projectsAnalyticsService.getProjectPerDayOfPeriod(mockedEntry);

      expect(getProjectPerDayOfPeriodGroupedByDaysSpy).toHaveBeenCalled();
      expect(getProjectPerDayOfPeriodGroupedByDaysSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
      );
    });

    it("should call the getProjectPerDayOfPeriodGroupedByDays utility function if the groupBy is undefined", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
        periodResolution: "day" as const,
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      const getProjectPerDayOfPeriodGroupedByDaysSpy = vi.spyOn(
        getProjectPerDayOfPeriodGroupedByDaysUtils,
        "getProjectPerDayOfPeriodGroupedByDays",
      );

      await projectsAnalyticsService.getProjectPerDayOfPeriod(mockedEntry);

      expect(getProjectPerDayOfPeriodGroupedByDaysSpy).toHaveBeenCalled();
      expect(getProjectPerDayOfPeriodGroupedByDaysSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
      );
    });

    it("should call the getDaysOfPeriodStatsGroupedByWeeks utility function if the groupBy is 'weeks'", async () => {
      const mockedEntry = {
        start: "2026-06-12",
        end: "2026-06-21",
        groupBy: "weeks" as const,
        periodResolution: "week" as const,
        userId: "1",
        name: "mooncode",
      };

      const mockedTimeSpentPerDayOnProject = [
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

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      const getDaysOfPeriodStatsGroupedByWeeksSpy = vi.spyOn(
        getProjectPerDayOfPeriodGroupedByWeeksUtils,
        "getProjectPerDayOfPeriodGroupedByWeeks",
      );

      await projectsAnalyticsService.getProjectPerDayOfPeriod(mockedEntry);

      expect(getDaysOfPeriodStatsGroupedByWeeksSpy).toHaveBeenCalled();
      expect(getDaysOfPeriodStatsGroupedByWeeksSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
        mockedEntry.periodResolution,
      );
    });

    it("should call the getProjectPerDayOfPeriodGroupedByMonths utility function if the groupBy is 'months'", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-05-12",
        end: "2026-06-21",
        groupBy: "months" as const,
        periodResolution: "month" as const,
      };

      const mockedTimeSpentPerDayOnProject = [
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

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      const getProjectPerDayOfPeriodGroupedByMonthsSpy = vi.spyOn(
        getProjectPerDayOfPeriodGroupedByMonthsUtils,
        "getProjectPerDayOfPeriodGroupedByMonths",
      );

      await projectsAnalyticsService.getProjectPerDayOfPeriod(mockedEntry);

      expect(getProjectPerDayOfPeriodGroupedByMonthsSpy).toHaveBeenCalled();
      expect(getProjectPerDayOfPeriodGroupedByMonthsSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
      );
    });
  });

  describe("getProjectLanguagesTimeOnPeriod", () => {
    const mockedEntry = {
      userId: "1",
      name: "mooncode",
      start: "2026-06-17",
      end: "2026-06-21",
    };

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

    it("should an array containing the stats for each language on the period", async () => {
      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getProjectOnPeriod",
      ).mockResolvedValue({
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        totalTimeSpent: 48800,
      });

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimeOnPeriod",
      ).mockResolvedValue({
        typescript: 12000,
        rust: 14000,
        python: 3000,
        go: 13000,
        yaml: 6800,
      });

      const mockedOutput = [
        {
          languageSlug: "python",
          percentage: 6.15,
          time: 3000,
          value: "50 mins",
        },
        {
          languageSlug: "yaml",
          percentage: 13.93,
          time: 6800,
          value: "1 hr 53 mins",
        },
        {
          languageSlug: "typescript",
          percentage: 24.59,
          time: 12000,
          value: "3 hrs 20 mins",
        },
        {
          languageSlug: "go",
          percentage: 26.64,
          time: 13000,
          value: "3 hrs 36 mins",
        },
        {
          languageSlug: "rust",
          percentage: 28.69,
          time: 14000,
          value: "3 hrs 53 mins",
        },
      ];

      const projectLanguagesTimeOnPeriod =
        await projectsAnalyticsService.getProjectLanguagesTimeOnPeriod(
          mockedEntry,
        );

      expect(projectLanguagesTimeOnPeriod).toBeDefined();
      expect(projectLanguagesTimeOnPeriod).toEqual(mockedOutput);
    });

    it("should return an empty array if there is no data for the project on the selected period", async () => {
      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue([]);

      const projectLanguagesTimeOnPeriod =
        await projectsAnalyticsService.getProjectLanguagesTimeOnPeriod(
          mockedEntry,
        );

      expect(projectLanguagesTimeOnPeriod).toBeDefined();
      expect(projectLanguagesTimeOnPeriod).toEqual([]);
    });

    it("should return an array of stats with all percentages at zero if the total time spent on the project on the period is zero", async () => {
      const mockedTimeSpentPerDayOnProject = [
        {
          date: "2026-06-17",
          timeSpent: 0,
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
          timeSpent: 0,
        },
        {
          date: "2026-06-21",
          timeSpent: 0,
        },
      ];

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getProjectOnPeriod",
      ).mockResolvedValue({
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        totalTimeSpent: 0,
      });

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimeOnPeriod",
      ).mockResolvedValue({
        typescript: 0,
        rust: 0,
        python: 0,
        go: 0,
        yaml: 0,
      });

      const mockedOutput = [
        {
          languageSlug: "typescript",

          percentage: 0,
          time: 0,
          value: "0 secs",
        },
        {
          languageSlug: "rust",
          percentage: 0,
          time: 0,
          value: "0 secs",
        },
        {
          languageSlug: "python",
          percentage: 0,
          time: 0,
          value: "0 secs",
        },
        {
          languageSlug: "go",
          percentage: 0,
          time: 0,
          value: "0 secs",
        },
        {
          languageSlug: "yaml",
          percentage: 0,
          time: 0,
          value: "0 secs",
        },
      ];

      const projectLanguagesTimeOnPeriod =
        await projectsAnalyticsService.getProjectLanguagesTimeOnPeriod(
          mockedEntry,
        );

      expect(projectLanguagesTimeOnPeriod).toBeDefined();
      expect(projectLanguagesTimeOnPeriod).toEqual(mockedOutput);
    });
  });

  describe("getProjectLanguagesPerDayOfPeriod", () => {
    it("should return an empty array if there is no data for the project of the period selected", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue([]);

      const data =
        await projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod(
          mockedEntry,
        );

      expect(data).toBeDefined();
      expect(data).toEqual([]);
    });

    it("should call the getProjectPerDayOfPeriodGroupedByDays utility function if the groupBy is 'days'", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        periodResolution: "day" as const,
      };

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

      const mockedLanguagesTimesPerDayOfPeriod = {
        "2026-06-17": {
          typescript: 2500,
          rust: 2000,
        },
        "2026-06-18": {
          javascript: 4000,
          typescript: 3500,
        },
        "2026-06-19": {
          javascript: 4000,
          python: 5000,
          html: 3000,
        },
        "2026-06-20": {
          go: 6000,
          yaml: 3800,
        },
        "2026-06-21": {
          go: 6000,
          docker: 9000,
        },
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimePerDayOfPeriod",
      ).mockResolvedValue(mockedLanguagesTimesPerDayOfPeriod);

      const getProjectLanguagesGroupedByDaysSpy = vi.spyOn(
        getProjectLanguagesGroupedByDaysUtils,
        "getProjectLanguagesGroupedByDays",
      );

      await projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod(
        mockedEntry,
      );

      expect(getProjectLanguagesGroupedByDaysSpy).toHaveBeenCalled();
      expect(getProjectLanguagesGroupedByDaysSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
        mockedLanguagesTimesPerDayOfPeriod,
      );
    });

    it("should call the getProjectPerDayOfPeriodGroupedByDays utility function if the groupBy is undefined", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-17",
        end: "2026-06-21",
        periodResolution: "day" as const,
      };

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

      const mockedLanguagesTimesPerDayOfPeriod = {
        "2026-06-17": {
          typescript: 2500,
          rust: 2000,
        },
        "2026-06-18": {
          javascript: 4000,
          typescript: 3500,
        },
        "2026-06-19": {
          javascript: 4000,
          python: 5000,
          html: 3000,
        },
        "2026-06-20": {
          go: 6000,
          yaml: 3800,
        },
        "2026-06-21": {
          go: 6000,
          docker: 9000,
        },
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimePerDayOfPeriod",
      ).mockResolvedValue(mockedLanguagesTimesPerDayOfPeriod);

      const getProjectLanguagesGroupedByDaysSpy = vi.spyOn(
        getProjectLanguagesGroupedByDaysUtils,
        "getProjectLanguagesGroupedByDays",
      );

      await projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod(
        mockedEntry,
      );

      expect(getProjectLanguagesGroupedByDaysSpy).toHaveBeenCalled();
      expect(getProjectLanguagesGroupedByDaysSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
        mockedLanguagesTimesPerDayOfPeriod,
      );
    });

    it("should call the getProjectPerDayOfPeriodGroupedByWeeks utility function if the groupBy is 'weeks'", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-06-12",
        end: "2026-06-21",
        groupBy: "weeks" as const,
        periodResolution: "week" as const,
      };

      const mockedTimeSpentPerDayOnProject = [
        { date: "2026-06-12", timeSpent: 4500 },
        { date: "2026-06-13", timeSpent: 1500 },
        { date: "2026-06-14", timeSpent: 3800 },
        { date: "2026-06-15", timeSpent: 14500 },
        { date: "2026-06-16", timeSpent: 5900 },
        { date: "2026-06-17", timeSpent: 4500 },
        { date: "2026-06-18", timeSpent: 7500 },
        { date: "2026-06-19", timeSpent: 12000 },
        { date: "2026-06-20", timeSpent: 9800 },
        { date: "2026-06-21", timeSpent: 15000 },
      ];

      const mockedLanguagesTimesPerDayOfPeriod = {
        "2026-06-12": { rust: 2500, typescript: 2000 },
        "2026-06-13": { javascript: 1500 },
        "2026-06-14": { javascript: 1800, python: 2000 },
        "2026-06-15": { json: 4000, docker: 5000, yaml: 5500 },
        "2026-06-16": { yaml: 5900 },
        "2026-06-17": { typescript: 2500, rust: 2000 },
        "2026-06-18": { javascript: 4000, typescript: 3500 },
        "2026-06-19": { javascript: 4000, python: 5000, html: 3000 },
        "2026-06-20": { go: 6000, yaml: 3800 },
        "2026-06-21": { go: 6000, docker: 9000 },
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimePerDayOfPeriod",
      ).mockResolvedValue(mockedLanguagesTimesPerDayOfPeriod);

      const getProjectLanguagesGroupedByWeeksSpy = vi.spyOn(
        getProjectLanguagesGroupedByWeeksUtils,
        "getProjectLanguagesGroupedByWeeks",
      );

      await projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod(
        mockedEntry,
      );

      expect(getProjectLanguagesGroupedByWeeksSpy).toHaveBeenCalled();
      expect(getProjectLanguagesGroupedByWeeksSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
        mockedEntry.periodResolution,
        mockedLanguagesTimesPerDayOfPeriod,
      );
    });

    it("should call the getProjectPerDayOfPeriodGroupedByMonths utility function if the groupBy is 'months'", async () => {
      const mockedEntry = {
        userId: "1",
        name: "mooncode",
        start: "2026-05-12",
        end: "2026-06-21",
        groupBy: "months" as const,
        periodResolution: "month" as const,
      };

      const mockedTimeSpentPerDayOnProject = [
        { date: "2026-05-12", timeSpent: 4500 },
        { date: "2026-05-13", timeSpent: 3200 },
        { date: "2026-05-14", timeSpent: 7800 },
        { date: "2026-05-15", timeSpent: 5100 },
        { date: "2026-05-16", timeSpent: 9300 },
        { date: "2026-05-17", timeSpent: 2700 },
        { date: "2026-05-18", timeSpent: 6400 },
        { date: "2026-05-19", timeSpent: 11200 },
        { date: "2026-05-20", timeSpent: 4800 },
        { date: "2026-05-21", timeSpent: 7600 },
        { date: "2026-05-22", timeSpent: 3300 },
        { date: "2026-05-23", timeSpent: 8900 },
        { date: "2026-05-24", timeSpent: 5500 },
        { date: "2026-05-25", timeSpent: 12100 },
        { date: "2026-05-26", timeSpent: 4200 },
        { date: "2026-05-27", timeSpent: 6800 },
        { date: "2026-05-28", timeSpent: 9700 },
        { date: "2026-05-29", timeSpent: 3600 },
        { date: "2026-05-30", timeSpent: 7100 },
        { date: "2026-05-31", timeSpent: 5400 },
        { date: "2026-06-01", timeSpent: 8300 },
        { date: "2026-06-02", timeSpent: 2900 },
        { date: "2026-06-03", timeSpent: 10500 },
        { date: "2026-06-04", timeSpent: 4600 },
        { date: "2026-06-05", timeSpent: 7300 },
        { date: "2026-06-06", timeSpent: 6100 },
        { date: "2026-06-07", timeSpent: 3800 },
        { date: "2026-06-08", timeSpent: 9200 },
        { date: "2026-06-09", timeSpent: 5700 },
        { date: "2026-06-10", timeSpent: 11800 },
        { date: "2026-06-11", timeSpent: 4100 },
        { date: "2026-06-12", timeSpent: 4500 },
        { date: "2026-06-13", timeSpent: 1500 },
        { date: "2026-06-14", timeSpent: 3800 },
        { date: "2026-06-15", timeSpent: 14500 },
        { date: "2026-06-16", timeSpent: 5900 },
        { date: "2026-06-17", timeSpent: 4500 },
        { date: "2026-06-18", timeSpent: 7500 },
        { date: "2026-06-19", timeSpent: 12000 },
        { date: "2026-06-20", timeSpent: 9800 },
        { date: "2026-06-21", timeSpent: 15000 },
      ];

      const mockedLanguagesTimesPerDayOfPeriod = {
        "2026-05-12": { rust: 2500, typescript: 2000 },
        "2026-05-13": { python: 3200 },
        "2026-05-14": { typescript: 4000, javascript: 3800 },
        "2026-05-15": { go: 2600, yaml: 2500 },
        "2026-05-16": { rust: 5000, typescript: 4300 },
        "2026-05-17": { sql: 2700 },
        "2026-05-18": { python: 3200, json: 3200 },
        "2026-05-19": { typescript: 6000, html: 2600, css: 2600 },
        "2026-05-20": { go: 4800 },
        "2026-05-21": { javascript: 4000, python: 3600 },
        "2026-05-22": { yaml: 3300 },
        "2026-05-23": { rust: 4500, c: 4400 },
        "2026-05-24": { typescript: 3000, sql: 2500 },
        "2026-05-25": { json: 4000, docker: 4100, yaml: 4000 },
        "2026-05-26": { python: 4200 },
        "2026-05-27": { typescript: 3500, html: 1700, css: 1600 },
        "2026-05-28": { go: 5000, rust: 4700 },
        "2026-05-29": { sql: 3600 },
        "2026-05-30": { javascript: 3600, python: 3500 },
        "2026-05-31": { typescript: 5400 },
        "2026-06-01": { rust: 4200, c: 4100 },
        "2026-06-02": { yaml: 2900 },
        "2026-06-03": { typescript: 5500, javascript: 5000 },
        "2026-06-04": { docker: 4600 },
        "2026-06-05": { go: 3700, sql: 3600 },
        "2026-06-06": { python: 3100, json: 3000 },
        "2026-06-07": { typescript: 3800 },
        "2026-06-08": { rust: 4700, c: 4500 },
        "2026-06-09": { typescript: 3000, html: 1400, css: 1300 },
        "2026-06-10": { json: 4000, docker: 4000, yaml: 3800 },
        "2026-06-11": { go: 4100 },
        "2026-06-12": { rust: 2500, typescript: 2000 },
        "2026-06-13": { javascript: 1500 },
        "2026-06-14": { javascript: 1800, python: 2000 },
        "2026-06-15": { json: 4000, docker: 5000, yaml: 5500 },
        "2026-06-16": { yaml: 5900 },
        "2026-06-17": { typescript: 2500, rust: 2000 },
        "2026-06-18": { javascript: 4000, typescript: 3500 },
        "2026-06-19": { javascript: 4000, python: 5000, html: 3000 },
        "2026-06-20": { go: 6000, yaml: 3800 },
        "2026-06-21": { go: 6000, docker: 9000 },
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimePerDayOfPeriod",
      ).mockResolvedValue(mockedLanguagesTimesPerDayOfPeriod);

      const getProjectLanguagesGroupedByMonthsSpy = vi.spyOn(
        getProjectLanguagesGroupedByMonthsUtils,
        "getProjectLanguagesGroupedByMonths",
      );

      await projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod(
        mockedEntry,
      );

      expect(getProjectLanguagesGroupedByMonthsSpy).toHaveBeenCalled();
      expect(getProjectLanguagesGroupedByMonthsSpy).toHaveBeenCalledWith(
        mockedTimeSpentPerDayOnProject,
        mockedLanguagesTimesPerDayOfPeriod,
      );
    });
  });

  describe("getProjectDailyStats", () => {
    const mockedEntry = {
      dateString: "2026-06-26",
      name: "mooncode",
      userId: "1",
    };

    it("should return an object containing the expected fields: formattedTotalTimeSpent and finalData", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 8500,
      });

      mockedDrizzle.where.mockResolvedValue([
        {
          timeSpent: 1200,
          languageSlug: "docker",
          projectPath: "/home/user/projects/mooncode/api/Dockerfile",
        },
        {
          timeSpent: 900,
          languageSlug: "typescript",
          projectPath:
            "/home/user/projects/mooncode/api/src/auth/auth.service.ts",
        },
        {
          timeSpent: 800,
          languageSlug: "typescript",
          projectPath:
            "/home/user/projects/mooncode/api/src/auth/auth.service.test.ts",
        },
        {
          timeSpent: 750,
          languageSlug: "css",
          projectPath: "/home/user/projects/mooncode/dashboard/src/index.css",
        },
        {
          timeSpent: 700,
          languageSlug: "typescript",
          projectPath: "/home/user/mooncode/api/src/app.module.ts",
        },
        {
          timeSpent: 650,
          languageSlug: "typescript",
          projectPath:
            "/home/user/projects/mooncode/api/src/files/files.module.ts",
        },
        {
          timeSpent: 600,
          languageSlug: "json",
          projectPath: "/home/user/mooncode/vscode-extension/package.json",
        },
        {
          timeSpent: 550,
          languageSlug: "yaml",
          projectPath:
            "/home/user/mooncode/.github/workflows/build-and-deploy.yaml",
        },
        {
          timeSpent: 500,
          languageSlug: "typescript",
          projectPath: "/home/user/mooncode/api/src/main.ts",
        },
        {
          timeSpent: 450,
          languageSlug: "sql",
          projectPath: "/home/user/mooncode/api/drizzle/0000_whole_glorian.sql",
        },
        {
          timeSpent: 400,
          languageSlug: "json",
          projectPath: "/home/user/mooncode/dashboard/package.json",
        },
      ]);

      projectsService.findOne.mockResolvedValue({
        id: "3",
        name: "mooncode",
        path: "/home/user/mooncode",
        timeSpent: 8500,
      });

      const mockedLanguagesStats = [
        {
          formattedValue: "59 mins",
          languageSlug: "typescript",
          percentage: 41.76,
          timeSpent: 3550,
        },
        {
          formattedValue: "20 mins",
          languageSlug: "docker",
          percentage: 14.12,
          timeSpent: 1200,
        },
        {
          formattedValue: "16 mins",
          languageSlug: "json",
          percentage: 11.76,
          timeSpent: 1000,
        },
        {
          formattedValue: "12 mins",
          languageSlug: "css",
          percentage: 8.82,
          timeSpent: 750,
        },
        {
          formattedValue: "9 mins",
          languageSlug: "yaml",
          percentage: 6.47,
          timeSpent: 550,
        },
        {
          formattedValue: "7 mins",
          languageSlug: "sql",
          percentage: 5.29,
          timeSpent: 450,
        },
      ];

      const { finalData, formattedTotalTimeSpent } =
        await projectsAnalyticsService.getProjectDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("2 hrs 21 mins");

      expect(finalData).toBeDefined();
      expect(finalData).toEqual(mockedLanguagesStats);
    });

    it("should return an empty state if there is no coding data on the day", async () => {
      dailyDataService.findOne.mockResolvedValue(null);

      const { finalData, formattedTotalTimeSpent } =
        await projectsAnalyticsService.getProjectDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("0 secs");

      expect(finalData).toBeDefined();
      expect(finalData).toEqual([]);
    });

    it("should return an empty state if the time spent coding that day is zero", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 0,
      });

      const { finalData, formattedTotalTimeSpent } =
        await projectsAnalyticsService.getProjectDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("0 secs");

      expect(finalData).toBeDefined();
      expect(finalData).toEqual([]);
    });

    it("should return an empty state if there is no files for that project on the day", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 8500,
      });

      mockedDrizzle.where.mockResolvedValue([]);

      const { finalData, formattedTotalTimeSpent } =
        await projectsAnalyticsService.getProjectDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("0 secs");

      expect(finalData).toBeDefined();
      expect(finalData).toEqual([]);
    });

    it("should return an empty state if we can't get the time spent on the project that day (which is technically impossible because we already have some files for the project)", async () => {
      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 8500,
      });

      mockedDrizzle.where.mockResolvedValue([
        {
          timeSpent: 1200,
          languageSlug: "docker",
          projectPath: "/home/user/projects/mooncode/api/Dockerfile",
        },
        {
          timeSpent: 900,
          languageSlug: "typescript",
          projectPath:
            "/home/user/projects/mooncode/api/src/auth/auth.service.ts",
        },
        {
          timeSpent: 800,
          languageSlug: "typescript",
          projectPath:
            "/home/user/projects/mooncode/api/src/auth/auth.service.test.ts",
        },
        {
          timeSpent: 750,
          languageSlug: "css",
          projectPath: "/home/user/projects/mooncode/dashboard/src/index.css",
        },
        {
          timeSpent: 700,
          languageSlug: "typescript",
          projectPath: "/home/user/mooncode/api/src/app.module.ts",
        },
        {
          timeSpent: 650,
          languageSlug: "typescript",
          projectPath:
            "/home/user/projects/mooncode/api/src/files/files.module.ts",
        },
        {
          timeSpent: 600,
          languageSlug: "json",
          projectPath: "/home/user/mooncode/vscode-extension/package.json",
        },
        {
          timeSpent: 550,
          languageSlug: "yaml",
          projectPath:
            "/home/user/mooncode/.github/workflows/build-and-deploy.yaml",
        },
        {
          timeSpent: 500,
          languageSlug: "typescript",
          projectPath: "/home/user/mooncode/api/src/main.ts",
        },
        {
          timeSpent: 450,
          languageSlug: "sql",
          projectPath: "/home/user/mooncode/api/drizzle/0000_whole_glorian.sql",
        },
        {
          timeSpent: 400,
          languageSlug: "json",
          projectPath: "/home/user/mooncode/dashboard/package.json",
        },
      ]);

      projectsService.findOne.mockResolvedValue(null);

      const { finalData, formattedTotalTimeSpent } =
        await projectsAnalyticsService.getProjectDailyStats(mockedEntry);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual("0 secs");

      expect(finalData).toBeDefined();
      expect(finalData).toEqual([]);
    });
  });

  describe("getPeriodGeneralStatsForProject", () => {
    it("should return an empty state if there is no data on the selected period", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        todaysDateString: "2026-06-23",
        periodResolution: "day" as const,
        userId: "1",
        name: "mooncode",
      };

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue([]);

      const mockedOutput = {
        avgTime: "0 secs",
        mostActiveDate: "N/A",
        mostUsedLanguageSlug: "N/A",
        percentageToAvg: 0,
      };

      const data =
        await projectsAnalyticsService.getPeriodGeneralStatsForProject(
          mockedEntry,
        );

      expect(data).toBeDefined();
      expect(data).toEqual(mockedOutput);
    });

    it("should call the getProjectGeneralStatsOnPeriodGroupedByDays utility function if the groupBy is 'days'", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        groupBy: "days" as const,
        todaysDateString: "2026-06-23",
        periodResolution: "day" as const,
        userId: "1",
        name: "mooncode",
      };

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

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getProjectOnPeriod",
      ).mockResolvedValue({
        name: "mooncode",
        totalTimeSpent: 48800,
        path: "/home/user/mooncode",
      });

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimeOnPeriod",
      ).mockResolvedValue({
        typescript: 12000,
        rust: 14000,
        python: 3000,
        go: 13000,
        yaml: 6800,
      });

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 12500,
      });

      projectsService.findOne.mockResolvedValue({
        id: "3",
        name: "mooncode",
        path: "/home/user/mooncode",
        timeSpent: 10000,
      });

      const getProjectGeneralStatsOnPeriodGroupedByDaysSpy = vi.spyOn(
        getProjectGeneralStatsOnPeriodGroupedByDaysUtils,
        "getProjectGeneralStatsOnPeriodGroupedByDays",
      );

      await projectsAnalyticsService.getPeriodGeneralStatsForProject(
        mockedEntry,
      );

      expect(getProjectGeneralStatsOnPeriodGroupedByDaysSpy).toHaveBeenCalled();
    });

    it("should call the getProjectGeneralStatsOnPeriodGroupedByDays utility function if the groupBy is undefined", async () => {
      const mockedEntry = {
        start: "2026-06-17",
        end: "2026-06-21",
        todaysDateString: "2026-06-23",
        periodResolution: "day" as const,
        userId: "1",
        name: "mooncode",
      };

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

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getProjectOnPeriod",
      ).mockResolvedValue({
        name: "mooncode",
        totalTimeSpent: 48800,
        path: "/home/user/mooncode",
      });

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimeOnPeriod",
      ).mockResolvedValue({
        typescript: 12000,
        rust: 14000,
        python: 3000,
        go: 13000,
        yaml: 6800,
      });

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 12500,
      });

      projectsService.findOne.mockResolvedValue({
        id: "3",
        name: "mooncode",
        path: "/home/user/mooncode",
        timeSpent: 10000,
      });

      const getProjectGeneralStatsOnPeriodGroupedByDaysSpy = vi.spyOn(
        getProjectGeneralStatsOnPeriodGroupedByDaysUtils,
        "getProjectGeneralStatsOnPeriodGroupedByDays",
      );

      await projectsAnalyticsService.getPeriodGeneralStatsForProject(
        mockedEntry,
      );

      expect(getProjectGeneralStatsOnPeriodGroupedByDaysSpy).toHaveBeenCalled();
    });

    it("should call the getProjectGeneralStatsOnPeriodGroupedByWeeks utility function if the groupBy is 'weeks'", async () => {
      const mockedEntry = {
        start: "2026-06-12",
        end: "2026-06-21",
        todaysDateString: "2026-06-23",
        groupBy: "weeks" as const,
        periodResolution: "week" as const,
        userId: "1",
        name: "mooncode",
      };

      const mockedTimeSpentPerDayOnProject = [
        { date: "2026-06-12", timeSpent: 4500 },
        { date: "2026-06-13", timeSpent: 1500 },
        { date: "2026-06-14", timeSpent: 3800 },
        { date: "2026-06-15", timeSpent: 14500 },
        { date: "2026-06-16", timeSpent: 5900 },
        { date: "2026-06-17", timeSpent: 4500 },
        { date: "2026-06-18", timeSpent: 7500 },
        { date: "2026-06-19", timeSpent: 12000 },
        { date: "2026-06-20", timeSpent: 9800 },
        { date: "2026-06-21", timeSpent: 15000 },
      ];

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getProjectOnPeriod",
      ).mockResolvedValue({
        name: "mooncode",
        totalTimeSpent: 79000,
        path: "/home/user/mooncode",
      });

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimeOnPeriod",
      ).mockResolvedValue({
        rust: 18000,
        typescript: 16000,
        go: 15800,
        javascript: 13200,
        docker: 7500,
        yaml: 5500,
        python: 3000,
      });

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 42500,
      });

      projectsService.findOne.mockResolvedValue({
        id: "3",
        name: "mooncode",
        path: "/home/user/mooncode",
        timeSpent: 42500,
      });

      const getProjectGeneralStatsOnPeriodGroupedByWeeksSpy = vi.spyOn(
        getProjectGeneralStatsOnPeriodGroupedByWeeksUtils,
        "getProjectGeneralStatsOnPeriodGroupedByWeeks",
      );

      await projectsAnalyticsService.getPeriodGeneralStatsForProject(
        mockedEntry,
      );

      expect(
        getProjectGeneralStatsOnPeriodGroupedByWeeksSpy,
      ).toHaveBeenCalled();
    });

    it("should call the getProjectGeneralStatsOnPeriodGroupedByMonths utility function if the groupBy is 'months'", async () => {
      const mockedEntry = {
        start: "2026-05-12",
        end: "2026-06-21",
        todaysDateString: "2026-06-23",
        groupBy: "months" as const,
        periodResolution: "month" as const,
        userId: "1",
        name: "mooncode",
      };

      const mockedTimeSpentPerDayOnProject = [
        { date: "2026-05-12", timeSpent: 4500 },
        { date: "2026-05-13", timeSpent: 3200 },
        { date: "2026-05-14", timeSpent: 7800 },
        { date: "2026-05-15", timeSpent: 5100 },
        { date: "2026-05-16", timeSpent: 9300 },
        { date: "2026-05-17", timeSpent: 2700 },
        { date: "2026-05-18", timeSpent: 6400 },
        { date: "2026-05-19", timeSpent: 11200 },
        { date: "2026-05-20", timeSpent: 4800 },
        { date: "2026-05-21", timeSpent: 7600 },
        { date: "2026-05-22", timeSpent: 3300 },
        { date: "2026-05-23", timeSpent: 8900 },
        { date: "2026-05-24", timeSpent: 5500 },
        { date: "2026-05-25", timeSpent: 12100 },
        { date: "2026-05-26", timeSpent: 4200 },
        { date: "2026-05-27", timeSpent: 6800 },
        { date: "2026-05-28", timeSpent: 9700 },
        { date: "2026-05-29", timeSpent: 3600 },
        { date: "2026-05-30", timeSpent: 7100 },
        { date: "2026-05-31", timeSpent: 5400 },
        { date: "2026-06-01", timeSpent: 8300 },
        { date: "2026-06-02", timeSpent: 2900 },
        { date: "2026-06-03", timeSpent: 10500 },
        { date: "2026-06-04", timeSpent: 4600 },
        { date: "2026-06-05", timeSpent: 7300 },
        { date: "2026-06-06", timeSpent: 6100 },
        { date: "2026-06-07", timeSpent: 3800 },
        { date: "2026-06-08", timeSpent: 9200 },
        { date: "2026-06-09", timeSpent: 5700 },
        { date: "2026-06-10", timeSpent: 11800 },
        { date: "2026-06-11", timeSpent: 4100 },
        { date: "2026-06-12", timeSpent: 4500 },
        { date: "2026-06-13", timeSpent: 1500 },
        { date: "2026-06-14", timeSpent: 3800 },
        { date: "2026-06-15", timeSpent: 14500 },
        { date: "2026-06-16", timeSpent: 5900 },
        { date: "2026-06-17", timeSpent: 4500 },
        { date: "2026-06-18", timeSpent: 7500 },
        { date: "2026-06-19", timeSpent: 12000 },
        { date: "2026-06-20", timeSpent: 9800 },
        { date: "2026-06-21", timeSpent: 15000 },
      ];

      vi.spyOn(
        projectsAnalyticsService,
        "findProjectByNameOnRange",
      ).mockResolvedValue(mockedTimeSpentPerDayOnProject);

      vi.spyOn(
        projectsAnalyticsService,
        "getProjectOnPeriod",
      ).mockResolvedValue({
        name: "mooncode",
        totalTimeSpent: 282500,
        path: "/home/user/mooncode",
      });

      vi.spyOn(
        projectsAnalyticsService,
        "getLanguagesTimeOnPeriod",
      ).mockResolvedValue({
        typescript: 62000,
        rust: 55000,
        go: 48500,
        javascript: 42000,
        python: 30000,
        docker: 22000,
        yaml: 13500,
        json: 9500,
      });

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 120500,
      });

      projectsService.findOne.mockResolvedValue({
        id: "3",
        name: "mooncode",
        path: "/home/user/mooncode",
        timeSpent: 120500,
      });

      const getProjectGeneralStatsOnPeriodGroupedByMonthsSpy = vi.spyOn(
        getProjectGeneralStatsOnPeriodGroupedByMonthsUtils,
        "getProjectGeneralStatsOnPeriodGroupedByMonths",
      );

      await projectsAnalyticsService.getPeriodGeneralStatsForProject(
        mockedEntry,
      );

      expect(
        getProjectGeneralStatsOnPeriodGroupedByMonthsSpy,
      ).toHaveBeenCalled();
    });
  });
});
