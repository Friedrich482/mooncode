import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { Test } from "@nestjs/testing";

import { FilesService } from "./files.service";

describe("filesService", () => {
  let filesService: FilesService;

  let mockedDrizzle: MockedDrizzle;

  beforeEach(async () => {
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
      orderBy: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      as: vi.fn(),
      execute: vi.fn(),
    };

    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    filesService = moduleRef.get(FilesService);
  });

  describe("create", () => {
    it("should return the created file", async () => {
      const mockedEntry = {
        languageId: "1",
        branchId: "2",
        name: "package.json",
        timeSpent: 300,
        path: "/home/user/projects/mooncode/apps/api/package.json",
      };

      const mockedCreatedFile = {
        name: "package.json",
        timeSpent: 300,
        path: "/home/user/projects/mooncode/apps/api/package.json",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedCreatedFile]);

      const createdFile = await filesService.create(mockedEntry);

      expect(createdFile).toBeDefined();
      expect(createdFile).toEqual(mockedCreatedFile);
    });
  });

  describe("findOne", () => {
    const mockedEntry = {
      languageId: "1",
      branchId: "2",
      name: "package.json",
      path: "/home/user/projects/mooncode/apps/api/package.json",
    };

    it("should return the file found", async () => {
      const mockedFoundFile = {
        name: "package.json",
        path: "/home/user/projects/mooncode/apps/api/package.json",
        timeSpent: 800,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundFile]);

      const foundFile = await filesService.findOne(mockedEntry);

      expect(foundFile).toBeDefined();
      expect(foundFile).toEqual(mockedFoundFile);
    });

    it("should return null if the file is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const foundFile = await filesService.findOne(mockedEntry);

      expect(foundFile).toBeNull();
    });
  });

  describe("findAllOnDay", () => {
    it("should return all the files found for that day", async () => {
      const mockedFilesFound = [
        {
          languageSlug: "json",
          timeSpent: 600,
          fileName: "package.json",
          filePath: "/home/user/projects/mooncode/apps/api/package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
          branchName: "branching",
        },

        {
          languageSlug: "typescript",
          timeSpent: 2000,
          fileName: "main.ts",
          filePath: "/home/user/projects/mooncode/apps/api/main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
          branchName: "branching",
        },

        {
          languageSlug: "docker",
          timeSpent: 1200,
          fileName: "Dockerfile",
          filePath: "/home/user/projects/factory/Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
          branchName: "main",
        },
      ];

      mockedDrizzle.orderBy.mockResolvedValue(mockedFilesFound);

      const filesFound = await filesService.findAllOnDay({ dailyDataId: "1" });

      expect(filesFound).toBeDefined();
      expect(filesFound).toEqual(mockedFilesFound);
    });
  });

  describe("update", () => {
    it("should return the updated file", async () => {
      const mockedEntry = {
        name: "main.ts",
        path: "/home/user/projects/mooncode/apps/api/main.ts",
        timeSpent: 800,
        branchId: "1",
        languageId: "5",
      };

      const mockedUpdateFile = {
        name: "main.ts",
        path: "/home/user/projects/mooncode/apps/api/main.ts",
        timeSpent: 800,
      };

      mockedDrizzle.returning.mockResolvedValue([mockedUpdateFile]);

      const updatedFile = await filesService.update(mockedEntry);

      expect(updatedFile).toBeDefined();
      expect(updatedFile).toEqual(mockedUpdateFile);
    });
  });
});
