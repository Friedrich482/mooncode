import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { DailyDataModule } from "@/daily-data/daily-data.module";
import { FilesModule } from "@/files/files.module";
import { LanguagesModule } from "@/languages/languages.module";
import { ProjectsModule } from "@/projects/projects.module";
import { TrpcModule } from "@/trpc/trpc.module";
import { TrpcService } from "@/trpc/trpc.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { ExtensionRouter } from "./extension.router";
import { ExtensionService } from "./extension.service";

describe("ExtensionRouter", () => {
  let extensionRouter: ExtensionRouter;
  let trpcService: TrpcService;

  let extensionService: {
    getLanguagesTimeForDay: Mock<Procedure>;
    getFilesForDay: Mock<Procedure>;
    upsertLanguages: Mock<Procedure>;
    upsertFiles: Mock<Procedure>;
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
    ReturnType<ExtensionRouter["procedures"]>["extension"]["createCaller"]
  >;

  beforeEach(async () => {
    vi.clearAllMocks();

    extensionService = {
      getLanguagesTimeForDay: vi.fn(),
      getFilesForDay: vi.fn(),
      upsertLanguages: vi.fn(),
      upsertFiles: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        TrpcModule,
        DailyDataModule,
        LanguagesModule,
        ProjectsModule,
        FilesModule,
      ],
      providers: [
        ExtensionRouter,
        {
          provide: ExtensionService,
          useValue: extensionService,
        },
      ],
    }).compile();

    extensionRouter = moduleRef.get(ExtensionRouter);
    trpcService = moduleRef.get(TrpcService);

    caller = trpcService.trpc.createCallerFactory(
      extensionRouter.procedures().extension,
    )(mockedCtx);

    vi.spyOn(trpcService, "getPayload").mockResolvedValue(mockedPayload);
  });

  describe("getLanguagesTimeForDay", () => {
    const mockedEntry = {
      dateString: "2026-06-22",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      timeSpent: 10000,
      dayLanguagesTime: {
        rust: 8000,
        typescript: 2000,
      },
    };

    it("should call the getLanguagesTimeForDay method of the extensionService", async () => {
      extensionService.getLanguagesTimeForDay.mockResolvedValue(mockedOutput);

      await caller.getLanguagesTimeForDay(mockedEntry);

      expect(extensionService.getLanguagesTimeForDay).toHaveBeenCalled();
      expect(extensionService.getLanguagesTimeForDay).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return the time spent coding for the day", async () => {
      extensionService.getLanguagesTimeForDay.mockResolvedValue(mockedOutput);

      const { timeSpent } = await caller.getLanguagesTimeForDay(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(mockedOutput.timeSpent);
    });

    it("should return the time spent by language for the day", async () => {
      extensionService.getLanguagesTimeForDay.mockResolvedValue(mockedOutput);

      const { dayLanguagesTime } =
        await caller.getLanguagesTimeForDay(mockedEntry);

      expect(dayLanguagesTime).toBeDefined();
      expect(dayLanguagesTime).toEqual(mockedOutput.dayLanguagesTime);
    });
  });

  describe("getFilesForDay", () => {
    const mockedEntry = {
      dateString: "2026-06-22",
      userId: mockedPayload.sub,
      type: "old" as const,
    };

    const mockedOutput = {
      "/home/user/projects/mooncode/apps/api/package.json": {
        languageSlug: "json",
        timeSpent: 600,
        fileName: "package.json",
        projectName: "mooncode",
        projectPath: "/home/user/projects/mooncode",
        branchName: "main",
      },
      "/home/user/projects/mooncode/apps/api/main.ts": {
        languageSlug: "typescript",
        timeSpent: 2000,
        fileName: "main.ts",
        projectName: "mooncode",
        projectPath: "/home/user/projects/mooncode",
        branchName: "test",
      },
      "/home/user/projects/factory/Dockerfile": {
        languageSlug: "docker",
        timeSpent: 1200,
        fileName: "Dockerfile",
        projectName: "factory",
        projectPath: "/home/user/projects/factory",
        branchName: "main",
      },
    };

    it("should call the getFilesForDay method of the extensionService", async () => {
      extensionService.getFilesForDay.mockResolvedValue(mockedOutput);

      await caller.getFilesForDay(mockedEntry);

      expect(extensionService.getFilesForDay).toHaveBeenCalled();
      expect(extensionService.getFilesForDay).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the time spent by file for the day", async () => {
      extensionService.getFilesForDay.mockResolvedValue(mockedOutput);

      const filesData = await caller.getFilesForDay(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual(mockedOutput);
    });
  });

  describe("upsertLanguages", () => {
    const mockedEntry = {
      timeSpentPerLanguage: {
        rust: 8000,
        typescript: 2000,
      },
      timeSpentOnDay: 10000,
      targetedDate: "2026-06-22",
      userId: mockedPayload.sub,
    };

    const mockedOutput = {
      dailyDataId: "1",
      timeSpentOnDay: 10000,
      languages: {
        rust: 8000,
        typescript: 2000,
      },
      date: "2026-06-22",
    };

    it("should call the upsertLanguages method of the extensionService", async () => {
      extensionService.upsertLanguages.mockResolvedValue(mockedOutput);

      await caller.upsertLanguages(mockedEntry);

      expect(extensionService.upsertLanguages).toHaveBeenCalled();
      expect(extensionService.upsertLanguages).toHaveBeenCalledWith(
        mockedEntry,
      );
    });

    it("should return the dailyDataId of the day", async () => {
      extensionService.upsertLanguages.mockResolvedValue(mockedOutput);

      const { dailyDataId } = await caller.upsertLanguages(mockedEntry);

      expect(dailyDataId).toBeDefined();
      expect(dailyDataId).toEqual(mockedOutput.dailyDataId);
    });

    it("should return the date", async () => {
      extensionService.upsertLanguages.mockResolvedValue(mockedOutput);

      const { date } = await caller.upsertLanguages(mockedEntry);

      expect(date).toBeDefined();
      expect(date).toEqual(mockedOutput.date);
    });

    it("should return the time spent on the day", async () => {
      extensionService.upsertLanguages.mockResolvedValue(mockedOutput);

      const { timeSpentOnDay } = await caller.upsertLanguages(mockedEntry);

      expect(timeSpentOnDay).toBeDefined();
      expect(timeSpentOnDay).toEqual(mockedOutput.timeSpentOnDay);
    });

    it("should return the updated languages times", async () => {
      extensionService.upsertLanguages.mockResolvedValue(mockedOutput);

      const { languages } = await caller.upsertLanguages(mockedEntry);

      expect(languages).toBeDefined();
      expect(languages).toEqual(mockedOutput.languages);
    });
  });

  describe("upsertFiles", () => {
    const mockedEntry = {
      filesData: {
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 600,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
          branchName: "main",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 2000,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
          branchName: "test",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1200,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
          branchName: "main",
        },
      },
      targetedDate: "2026-06-22",
      userId: mockedPayload.sub,
      type: "old" as const,
    };

    const mockedOutput = {
      "/home/user/projects/mooncode/apps/api/package.json": {
        languageSlug: "json",
        timeSpent: 600,
        fileName: "package.json",
        projectName: "mooncode",
        projectPath: "/home/user/projects/mooncode",
        branchName: "main",
      },
      "/home/user/projects/mooncode/apps/api/main.ts": {
        languageSlug: "typescript",
        timeSpent: 2000,
        fileName: "main.ts",
        projectName: "mooncode",
        projectPath: "/home/user/projects/mooncode",
        branchName: "test",
      },
      "/home/user/projects/factory/Dockerfile": {
        languageSlug: "docker",
        timeSpent: 1200,
        fileName: "Dockerfile",
        projectName: "factory",
        projectPath: "/home/user/projects/factory",
        branchName: "main",
      },
    };

    it("should call the upsertFiles method of the ExtensionService", async () => {
      extensionService.upsertFiles.mockResolvedValue(mockedOutput);

      await caller.upsertFiles(mockedEntry);

      expect(extensionService.upsertFiles).toHaveBeenCalled();
      expect(extensionService.upsertFiles).toHaveBeenCalledWith(mockedEntry);
    });

    it("should return the updated files data", async () => {
      extensionService.upsertFiles.mockResolvedValue(mockedOutput);

      const filesData = await caller.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual(mockedOutput);
    });
  });
});
