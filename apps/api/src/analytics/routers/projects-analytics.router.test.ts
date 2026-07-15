import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { DailyDataModule } from "@/daily-data/daily-data.module";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { ProjectsModule } from "@/projects/projects.module";
import { TrpcModule } from "@/trpc/trpc.module";
import { TrpcService } from "@/trpc/trpc.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { ProjectsAnalyticsService } from "../services/projects-analytics.service";
import { ProjectsAnalyticsRouter } from "./projects-analytics.router";

describe("ProjectsAnalyticsRouter", () => {
  let projectsAnalyticsRouter: ProjectsAnalyticsRouter;
  let trpcService: TrpcService;

  let projectsAnalyticsService: {
    findProjectByNameOnRange: Mock<Procedure>;
    getLanguagesTimeOnPeriod: Mock<Procedure>;
    getLanguagesTimePerDayOfPeriod: Mock<Procedure>;
    checkProjectExists: Mock<Procedure>;
    getPeriodProjects: Mock<Procedure>;
    getProjectOnPeriod: Mock<Procedure>;
    getProjectBranchesOnPeriod: Mock<Procedure>;
    getProjectPerDayOfPeriod: Mock<Procedure>;
    getProjectLanguagesTimeOnPeriod: Mock<Procedure>;
    getProjectLanguagesPerDayOfPeriod: Mock<Procedure>;
    getProjectDailyStats: Mock<Procedure>;
    getPeriodGeneralStatsForProject: Mock<Procedure>;
    getFilesOnPeriod: Mock<Procedure>;
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
    ReturnType<
      ProjectsAnalyticsRouter["procedures"]
    >["projects"]["createCaller"]
  >;

  beforeEach(async () => {
    vi.clearAllMocks();

    projectsAnalyticsService = {
      findProjectByNameOnRange: vi.fn(),
      getLanguagesTimeOnPeriod: vi.fn(),
      getLanguagesTimePerDayOfPeriod: vi.fn(),
      checkProjectExists: vi.fn(),
      getPeriodProjects: vi.fn(),
      getProjectOnPeriod: vi.fn(),
      getProjectBranchesOnPeriod: vi.fn(),
      getProjectPerDayOfPeriod: vi.fn(),
      getProjectLanguagesTimeOnPeriod: vi.fn(),
      getProjectLanguagesPerDayOfPeriod: vi.fn(),
      getProjectDailyStats: vi.fn(),
      getPeriodGeneralStatsForProject: vi.fn(),
      getFilesOnPeriod: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [TrpcModule, ProjectsModule, DailyDataModule, DrizzleModule],
      providers: [
        ProjectsAnalyticsRouter,
        {
          provide: ProjectsAnalyticsService,
          useValue: projectsAnalyticsService,
        },
      ],
    }).compile();

    projectsAnalyticsRouter = moduleRef.get(ProjectsAnalyticsRouter);
    trpcService = moduleRef.get(TrpcService);

    caller = trpcService.trpc.createCallerFactory(
      projectsAnalyticsRouter.procedures().projects,
    )(mockedCtx);

    vi.spyOn(trpcService, "getPayload").mockResolvedValue(mockedPayload);
  });

  describe("checkProjectExists", () => {
    const mockedEntry = {
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = true;

    it("should call the checkProjectExists method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.checkProjectExists.mockResolvedValue(
        mockedOutput,
      );

      await caller.checkProjectExists(mockedEntry);

      expect(projectsAnalyticsService.checkProjectExists).toHaveBeenCalled();
      expect(projectsAnalyticsService.checkProjectExists).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return a boolean", async () => {
      projectsAnalyticsService.checkProjectExists.mockResolvedValue(
        mockedOutput,
      );

      const doesProjectExists = await caller.checkProjectExists(mockedEntry);

      expect(doesProjectExists).toBeDefined();
      expect(doesProjectExists).toEqual(mockedOutput);
    });
  });

  describe("getPeriodProjects", () => {
    const mockedEntry = {
      page: 1,
      start: "2026-06-17",
      end: "2026-06-21",
      userId: mockedPayload.sub,
    };

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

    it("should call the getPeriodProjects method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getPeriodProjects.mockResolvedValue(
        mockedOutput,
      );

      await caller.getPeriodProjects(mockedEntry);

      expect(projectsAnalyticsService.getPeriodProjects).toHaveBeenCalled();
      expect(projectsAnalyticsService.getPeriodProjects).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return an object containing the expected properties", async () => {
      projectsAnalyticsService.getPeriodProjects.mockResolvedValue(
        mockedOutput,
      );

      const { hasNext, periodProjects } =
        await caller.getPeriodProjects(mockedEntry);

      expect(hasNext).toBeDefined();
      expect(hasNext).toEqual(mockedOutput.hasNext);

      expect(periodProjects).toBeDefined();
      expect(periodProjects).toEqual(mockedOutput.periodProjects);
    });
  });

  describe("getProjectOnPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      name: "mooncode",
      path: "/home/user/projects/mooncode",
      totalTimeSpent: 24000,
    };

    it("should call the getProjectOnPeriod method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getProjectOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      await caller.getProjectOnPeriod(mockedEntry);

      expect(projectsAnalyticsService.getProjectOnPeriod).toHaveBeenCalled();
      expect(projectsAnalyticsService.getProjectOnPeriod).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return an object containing the expected properties", async () => {
      projectsAnalyticsService.getProjectOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      const { name, path, totalTimeSpent } =
        await caller.getProjectOnPeriod(mockedEntry);

      expect(name).toBeDefined();
      expect(name).toEqual(mockedOutput.name);

      expect(path).toBeDefined();
      expect(path).toEqual(mockedOutput.path);

      expect(totalTimeSpent).toBeDefined();
      expect(totalTimeSpent).toEqual(mockedOutput.totalTimeSpent);
    });
  });

  describe("getProjectBranchesOnPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = [
      {
        name: "main",
        timeSpent: 1200,
      },
      {
        name: "test",
        timeSpent: 4500,
      },
    ];

    it("should call the getProjectBranchesOnPeriod method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getProjectBranchesOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      await caller.getProjectBranchesOnPeriod(mockedEntry);

      expect(
        projectsAnalyticsService.getProjectBranchesOnPeriod,
      ).toHaveBeenCalled();
      expect(
        projectsAnalyticsService.getProjectBranchesOnPeriod,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the data under the expected shape", async () => {
      projectsAnalyticsService.getProjectBranchesOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      const projectBranchesOnPeriod =
        await caller.getProjectBranchesOnPeriod(mockedEntry);

      expect(projectBranchesOnPeriod).toBeDefined();
      expect(projectBranchesOnPeriod).toEqual(mockedOutput);
    });
  });

  describe("getProjectPerDayOfPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      groupBy: "days" as const,
      periodResolution: "day" as const,
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = [
      {
        date: "Wednesday",
        originalDate: "Wed Jun 17 2026",
        timeSpentArea: 4500,
        timeSpentBar: 4500,
        timeSpentLine: 4500,
        value: "1 hr 15 mins",
      },
      {
        date: "Thursday",
        originalDate: "Thu Jun 18 2026",
        timeSpentArea: 7500,
        timeSpentBar: 7500,
        timeSpentLine: 7500,
        value: "2 hrs 5 mins",
      },
      {
        date: "Friday",
        originalDate: "Fri Jun 19 2026",
        timeSpentArea: 12000,
        timeSpentBar: 12000,
        timeSpentLine: 12000,
        value: "3 hrs 20 mins",
      },
      {
        date: "Saturday",
        originalDate: "Sat Jun 20 2026",
        timeSpentArea: 9800,
        timeSpentBar: 9800,
        timeSpentLine: 9800,
        value: "2 hrs 43 mins",
      },
      {
        date: "Sunday",
        originalDate: "Sun Jun 21 2026",
        timeSpentArea: 15000,
        timeSpentBar: 15000,
        timeSpentLine: 15000,
        value: "4 hrs 10 mins",
      },
    ];

    it("should call the getProjectPerDayOfPeriod method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getProjectPerDayOfPeriod.mockResolvedValue(
        mockedOutput,
      );

      await caller.getProjectPerDayOfPeriod(mockedEntry);

      expect(
        projectsAnalyticsService.getProjectPerDayOfPeriod,
      ).toHaveBeenCalled();
      expect(
        projectsAnalyticsService.getProjectPerDayOfPeriod,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the data under the expected shape", async () => {
      projectsAnalyticsService.getProjectPerDayOfPeriod.mockResolvedValue(
        mockedOutput,
      );

      const result = await caller.getProjectPerDayOfPeriod(mockedEntry);

      expect(result).toBeDefined();
      expect(result).toEqual(mockedOutput);
    });
  });

  describe("getProjectLanguagesTimeOnPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      name: "mooncode",
      userId: mockedPayload.sub,
    };

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

    it("should call the getProjectLanguagesTimeOnPeriod method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getProjectLanguagesTimeOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      await caller.getProjectLanguagesTimeOnPeriod(mockedEntry);

      expect(
        projectsAnalyticsService.getProjectLanguagesTimeOnPeriod,
      ).toHaveBeenCalled();
      expect(
        projectsAnalyticsService.getProjectLanguagesTimeOnPeriod,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the data under the expected shape", async () => {
      projectsAnalyticsService.getProjectLanguagesTimeOnPeriod.mockResolvedValue(
        mockedOutput,
      );

      const result = await caller.getProjectLanguagesTimeOnPeriod(mockedEntry);

      expect(result).toBeDefined();
      expect(result).toEqual(mockedOutput);
    });
  });

  describe("getProjectLanguagesPerDayOfPeriod", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      groupBy: "days" as const,
      periodResolution: "day" as const,
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = [
      {
        date: "Wednesday",
        originalDate: "Wed Jun 17 2026",
        rust: 2000,
        timeSpent: 4500,
        typescript: 2500,
      },
      {
        date: "Thursday",
        javascript: 4000,
        originalDate: "Thu Jun 18 2026",
        timeSpent: 7500,
        typescript: 3500,
      },
      {
        date: "Friday",
        html: 3000,
        javascript: 4000,
        originalDate: "Fri Jun 19 2026",
        python: 5000,
        timeSpent: 12000,
      },
      {
        date: "Saturday",
        go: 6000,
        originalDate: "Sat Jun 20 2026",
        timeSpent: 9800,
        yaml: 3800,
      },
      {
        date: "Sunday",
        docker: 9000,
        go: 6000,
        originalDate: "Sun Jun 21 2026",
        timeSpent: 15000,
      },
    ];

    it("should call the getProjectLanguagesPerDayOfPeriod method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod.mockResolvedValue(
        mockedOutput,
      );

      await caller.getProjectLanguagesPerDayOfPeriod(mockedEntry);

      expect(
        projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod,
      ).toHaveBeenCalled();
      expect(
        projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the data under the expected shape", async () => {
      projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod.mockResolvedValue(
        mockedOutput,
      );

      const result =
        await caller.getProjectLanguagesPerDayOfPeriod(mockedEntry);

      expect(result).toBeDefined();
      expect(result).toEqual(mockedOutput);
    });
  });

  describe("getProjectDailyStats", () => {
    const mockedEntry = {
      name: "mooncode",
      userId: mockedPayload.sub,
      dateString: "2026-06-17",
    };

    const mockedOutput = {
      finalData: [
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
      ],
      formattedTotalTimeSpent: "2 hrs 21 mins",
    };

    it("should call the getProjectDailyStats method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getProjectDailyStats.mockResolvedValue(
        mockedOutput,
      );

      await caller.getProjectDailyStats(mockedEntry);

      expect(projectsAnalyticsService.getProjectDailyStats).toHaveBeenCalled();
      expect(
        projectsAnalyticsService.getProjectDailyStats,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return an object containing the expected properties", async () => {
      projectsAnalyticsService.getProjectDailyStats.mockResolvedValue(
        mockedOutput,
      );

      const { finalData, formattedTotalTimeSpent } =
        await caller.getProjectDailyStats(mockedEntry);

      expect(finalData).toBeDefined();
      expect(finalData).toEqual(mockedOutput.finalData);

      expect(formattedTotalTimeSpent).toBeDefined();
      expect(formattedTotalTimeSpent).toEqual(
        mockedOutput.formattedTotalTimeSpent,
      );
    });
  });

  describe("getPeriodGeneralStatsForProject", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      groupBy: "days" as const,
      periodResolution: "day" as const,
      todaysDateString: "2026-06-23",
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      avgTime: "1 hr 56 mins",
      mostActiveDate: "Fri Jun 19 2026",
      percentageToAvg: 27.87,
      mostUsedLanguageSlug: "typescript",
    };

    it("should call the getPeriodGeneralStatsForProject method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getPeriodGeneralStatsForProject.mockResolvedValue(
        mockedOutput,
      );

      await caller.getPeriodGeneralStatsForProject(mockedEntry);

      expect(
        projectsAnalyticsService.getPeriodGeneralStatsForProject,
      ).toHaveBeenCalled();
      expect(
        projectsAnalyticsService.getPeriodGeneralStatsForProject,
      ).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return an object containing the expected properties", async () => {
      projectsAnalyticsService.getPeriodGeneralStatsForProject.mockResolvedValue(
        mockedOutput,
      );

      const { avgTime, mostActiveDate, mostUsedLanguageSlug, percentageToAvg } =
        await caller.getPeriodGeneralStatsForProject(mockedEntry);

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

  describe("getProjectFilesOnPeriod", () => {
    const mockedEntry = {
      page: 1,
      type: "paginated" as const,
      start: "2026-06-17",
      end: "2026-06-21",
      name: "mooncode",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      projectFilesOnPeriod: {
        "/home/user/mooncode/apps/vscode-extension/package.json": {
          languageSlug: "json",
          name: "package.json",
          totalTimeSpent: 579,
        },
        "/home/user/mooncode/package.json": {
          languageSlug: "json",
          name: "package.json",
          totalTimeSpent: 18,
        },
        "/home/user/mooncode/packages/ui/src/colors.json": {
          languageSlug: "json",
          name: "colors.json",
          totalTimeSpent: 515,
        },
        "/home/user/mooncode/packages/ui/src/go.asm": {
          languageSlug: "go",
          name: "go.asm",
          totalTimeSpent: 38,
        },
        "/home/user/mooncode/packages/ui/src/go.mod": {
          languageSlug: "go",
          name: "go.mod",
          totalTimeSpent: 429,
        },
        "/home/user/mooncode/packages/ui/src/go.sum": {
          languageSlug: "go",
          name: "go.sum",
          totalTimeSpent: 51,
        },
        "/home/user/mooncode/packages/ui/src/go.tmpl": {
          languageSlug: "go",
          name: "go.tmpl",
          totalTimeSpent: 648,
        },
        "/home/user/mooncode/packages/ui/src/go.work": {
          languageSlug: "go",
          name: "go.work",
          totalTimeSpent: 196,
        },
      },
      hasNext: false,
    };

    it("should call the getProjectFilesOnPeriod method of the ProjectsAnalyticsService", async () => {
      projectsAnalyticsService.getFilesOnPeriod.mockResolvedValue(mockedOutput);

      await caller.getProjectFilesOnPeriod(mockedEntry);

      expect(projectsAnalyticsService.getFilesOnPeriod).toHaveBeenCalled();
      expect(projectsAnalyticsService.getFilesOnPeriod).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return an object containing the expect properties", async () => {
      projectsAnalyticsService.getFilesOnPeriod.mockResolvedValue(mockedOutput);

      const { hasNext, projectFilesOnPeriod } =
        await caller.getProjectFilesOnPeriod(mockedEntry);

      expect(hasNext).toBeDefined();
      expect(hasNext).toEqual(mockedOutput.hasNext);

      expect(projectFilesOnPeriod).toBeDefined();
      expect(projectFilesOnPeriod).toEqual(mockedOutput.projectFilesOnPeriod);
    });
  });
});
