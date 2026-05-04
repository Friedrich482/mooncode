import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { Test } from "@nestjs/testing";

import { DailyDataService } from "./daily-data.service";

describe("DailyDataService", () => {
  let dailyDataService: DailyDataService;
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
      orderBy: vi.fn(),
      innerJoin: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      groupBy: vi.fn(),
      as: vi.fn(),
    };

    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DailyDataService,
        {
          provide: DrizzleAsyncProvider,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    dailyDataService = moduleRef.get(DailyDataService);
  });

  describe("create", () => {
    const userId = "1";
    const date = "2026-05-02";
    const timeSpent = 400;

    it("should return the created dailyData", async () => {
      const mockedDailyDataFields = {
        timeSpent,
        userId,
        targetedDate: date,
      };

      const mockedCreatedDailyData = {
        timeSpent,
        date,
        id: "2",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedCreatedDailyData]);

      const createdDailyData = await dailyDataService.create(
        mockedDailyDataFields,
      );

      expect(createdDailyData).toBeDefined();
      expect(createdDailyData).toEqual(mockedCreatedDailyData);
    });
  });

  describe("findOne", () => {
    const userId = "1";
    const date = "2026-05-02";
    const timeSpent = 400;

    it("should return the dailyData found", async () => {
      const mockedDailyDataFields = {
        date,
        userId,
      };

      const mockedFoundDailyData = {
        id: "2",
        timeSpent,
      };

      mockedDrizzle.limit.mockResolvedValue([mockedFoundDailyData]);

      const foundDailyData = await dailyDataService.findOne(
        mockedDailyDataFields,
      );

      expect(foundDailyData).toBeDefined();
      expect(foundDailyData).toEqual(mockedFoundDailyData);
    });

    it("should return null when the dailyData is not found", async () => {
      const mockedDailyDataFields = {
        date,
        userId,
      };

      mockedDrizzle.limit.mockResolvedValue([]);

      const foundDailyData = await dailyDataService.findOne(
        mockedDailyDataFields,
      );

      expect(foundDailyData).toBeNull();
    });
  });

  describe("findRange", () => {
    it("should return the range of dailyData", async () => {
      const mockedEntry = {
        userId: "1",
        start: "2026-04-27",
        end: "2026-05-02",
      };

      const mockedFoundDailyDataRange = [
        {
          id: "1",
          timeSpent: 200,
          date: "2026-04-27",
        },
        {
          id: "2",
          timeSpent: 300,
          date: "2026-04-28",
        },
        {
          id: "3",
          timeSpent: 600,
          date: "2026-04-29",
        },
        {
          id: "4",
          timeSpent: 800,
          date: "2026-04-30",
        },
        {
          id: "5",
          timeSpent: 100,
          date: "2026-05-01",
        },
        {
          id: "6",
          timeSpent: 200,
          date: "2026-05-02",
        },
      ];

      mockedDrizzle.where.mockResolvedValue(mockedFoundDailyDataRange);

      const range = await dailyDataService.findRange(mockedEntry);

      expect(range).toBeDefined();
      expect(range).toEqual(mockedFoundDailyDataRange);
    });

    it("should return the range of dailyData with null ids if necessary", async () => {
      const mockedEntry = {
        userId: "1",
        start: "2026-04-27",
        end: "2026-05-02",
      };

      const mockedFoundDailyDataRange = [
        {
          id: "1",
          timeSpent: 200,
          date: "2026-04-27",
        },
        {
          id: "2",
          timeSpent: 300,
          date: "2026-04-28",
        },
        {
          id: "4",
          timeSpent: 600,
          date: "2026-04-30",
        },
        {
          id: "5",
          timeSpent: 700,
          date: "2026-05-01",
        },
      ];

      mockedDrizzle.where.mockResolvedValue(mockedFoundDailyDataRange);

      const range = await dailyDataService.findRange(mockedEntry);

      expect(range).toBeDefined();
      expect(range).toEqual([
        { id: "1", timeSpent: 200, date: "2026-04-27" },
        {
          id: "2",
          timeSpent: 300,
          date: "2026-04-28",
        },
        {
          id: null,
          date: "2026-04-29",
          timeSpent: 0,
        },
        {
          id: "4",
          timeSpent: 600,
          date: "2026-04-30",
        },
        {
          id: "5",
          timeSpent: 700,
          date: "2026-05-01",
        },
        { id: null, date: "2026-05-02", timeSpent: 0 },
      ]);
    });
  });

  describe("update", () => {
    const userId = "1";
    const timeSpent = 400;
    const targetedDate = "2026-05-02";

    it("should return the updated dailyData", async () => {
      const mockedEntry = {
        userId,
        timeSpent,
        targetedDate,
      };

      const mockedUpdatedDailyData = {
        timeSpent,
        date: targetedDate,
        id: "2",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedUpdatedDailyData]);

      const updatedDailyData = await dailyDataService.update(mockedEntry);

      expect(updatedDailyData).toBeDefined();
      expect(updatedDailyData).toEqual(mockedUpdatedDailyData);
    });
  });
});
