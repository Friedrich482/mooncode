import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { Test } from "@nestjs/testing";

import * as constants from "./constants";
import { ProjectsService } from "./projects.service";

describe("projectsService", () => {
  let projectsService: ProjectsService;

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
    };

    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: DrizzleAsyncProvider,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    projectsService = moduleRef.get(ProjectsService);
  });

  describe("create", () => {
    it("should return the created project", async () => {
      const mockedProjectFields = {
        dailyDataId: "1",
        name: "mooncode",
        path: "home/user/projects/mooncode",
        timeSpent: 5000,
      };

      const mockedCreatedProject = {
        id: "2",
        name: "mooncode",
        timeSpent: 5000,
      };

      mockedDrizzle.returning.mockResolvedValue([mockedCreatedProject]);

      const createdProject = await projectsService.create(mockedProjectFields);

      expect(createdProject).toBeDefined();
      expect(createdProject).toEqual(mockedCreatedProject);
    });
  });

  describe("findOne", () => {
    const mockedProjectFields = {
      dailyDataId: "1",
      name: "mooncode",
      path: "/home/user/projects/mooncode",
    };

    it("should return the project found", async () => {
      const mockedFoundProject = {
        id: "2",
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        timeSpent: 6500,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundProject]);

      const foundProject = await projectsService.findOne(mockedProjectFields);

      expect(foundProject).toBeDefined();
      expect(foundProject).toEqual(mockedFoundProject);
    });

    it("should return null if the project is not found", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const foundProject = await projectsService.findOne(mockedProjectFields);

      expect(foundProject).toBeNull();
    });
  });

  describe("checkExists", () => {
    const mockedProjectFields = {
      name: "mooncode",
      userId: "1",
    };

    it("should return true when the project exists", async () => {
      const mockedProjectFound = { name: "mooncode" };

      mockedDrizzle.where.mockResolvedValue([mockedProjectFound]);

      const doesProjectExists =
        await projectsService.checkExists(mockedProjectFields);

      expect(doesProjectExists).toBeDefined();
      expect(doesProjectExists).toBe(true);
    });

    it("should return false when the project doesn't exist", async () => {
      mockedDrizzle.where.mockResolvedValue([]);

      const doesProjectExists =
        await projectsService.checkExists(mockedProjectFields);

      expect(doesProjectExists).toBeDefined();
      expect(doesProjectExists).toBe(false);
    });
  });

  describe("findRange", () => {
    const mockedEntry = {
      userId: "1",
      start: "2026-05-01",
      end: "2026-05-03",
      page: 1,
    };

    const mockedProjectsFound = [
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
    ];

    const mockedTotal = 3;

    it("should return the time spent per project in the time range", async () => {
      mockedDrizzle.from
        .mockReturnValueOnce(mockedDrizzle)
        .mockReturnValueOnce(mockedDrizzle)
        .mockResolvedValue([{ count: mockedTotal }]);

      mockedDrizzle.limit.mockResolvedValue(mockedProjectsFound);

      const { timeSpentPerProject } =
        await projectsService.findRange(mockedEntry);

      expect(timeSpentPerProject).toBeDefined();
      expect(timeSpentPerProject).toEqual(mockedProjectsFound);
    });

    it("should return true as hasNext when there are more pages remaining", async () => {
      vi.spyOn(constants, "NUMBER_OF_PROJECTS_PER_PAGE", "get").mockReturnValue(
        // @ts-ignore
        2,
      );

      mockedDrizzle.from
        .mockReturnValueOnce(mockedDrizzle)
        .mockReturnValueOnce(mockedDrizzle)
        .mockResolvedValue([{ count: mockedTotal }]);

      mockedDrizzle.limit.mockResolvedValue(mockedProjectsFound);

      const { hasNext } = await projectsService.findRange(mockedEntry);

      expect(hasNext).toBeDefined();
      expect(hasNext).toBe(true);
    });

    it("should return false as hasNext when there are no more pages remaining", async () => {
      mockedDrizzle.from
        .mockReturnValueOnce(mockedDrizzle)
        .mockReturnValueOnce(mockedDrizzle)
        .mockResolvedValue([{ count: mockedTotal }]);

      mockedDrizzle.limit.mockResolvedValue(mockedProjectsFound);

      const { hasNext } = await projectsService.findRange(mockedEntry);

      expect(hasNext).toBeDefined();
      expect(hasNext).toBe(false);
    });
  });

  describe("update", () => {
    it("should return the updated project", async () => {
      const mockedEntry = {
        dailyDataId: "1",
        timeSpent: 400,
        name: "mooncode",
        path: "/home/user/projects/mooncode",
      };

      const mockedUpdatedProject = {
        dailyDataId: "1",
        timeSpent: 800,
        name: "mooncode",
        path: "/home/user/projects/mooncode",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedUpdatedProject]);

      const updatedProject = await projectsService.update(mockedEntry);

      expect(updatedProject).toBeDefined();
      expect(updatedProject).toEqual(mockedUpdatedProject);
    });
  });
});
