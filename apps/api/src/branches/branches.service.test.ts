import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { Test } from "@nestjs/testing";

import { BranchesService } from "./branches.service";

describe("branchesService", () => {
  let branchesService: BranchesService;

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
        BranchesService,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    branchesService = moduleRef.get(BranchesService);
  });

  describe("create", () => {
    it("should return the created branch", async () => {
      const mockedEntry = {
        projectId: "1",
        name: "main",
        timeSpent: 800,
      };

      const mockedCreatedBranch = {
        id: "2",
        name: "main",
        timeSpent: 800,
      };

      mockedDrizzle.returning.mockResolvedValue([mockedCreatedBranch]);

      const createdBranch = await branchesService.create(mockedEntry);

      expect(createdBranch).toBeDefined();
      expect(createdBranch).toEqual(mockedCreatedBranch);
    });
  });

  describe("findOne", () => {
    const mockedEntry = {
      name: "main",
      projectId: "1",
    };

    it("should return the branch found if it exists", async () => {
      const mockedBranchFound = {
        id: "2",
        name: "main",
        timeSpent: 800,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedBranchFound]);

      const branchFound = await branchesService.findOne(mockedEntry);

      expect(branchFound).toBeDefined();
      expect(branchFound).toEqual(mockedBranchFound);
    });

    it("should return null if the branch doesn't exists", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const branchFound = await branchesService.findOne(mockedEntry);

      expect(branchFound).toBeDefined();
      expect(branchFound).toBeNull();
    });
  });

  describe("update", () => {
    it("should return the updated branch", async () => {
      const mockedEntry = {
        projectId: "1",
        timeSpent: 800,
        name: "main",
      };

      const mockedUpdatedBranch = {
        name: "main",
        timeSpent: 800,
        projectId: "1",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedUpdatedBranch]);

      const updatedBranch = await branchesService.update(mockedEntry);

      expect(updatedBranch).toBeDefined();
      expect(updatedBranch).toEqual(mockedUpdatedBranch);
    });
  });
});
