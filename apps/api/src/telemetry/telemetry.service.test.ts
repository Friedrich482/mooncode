import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { Test } from "@nestjs/testing";

import { TelemetryService } from "./telemetry.service";

describe("TelemetryService", () => {
  let telemetryService: TelemetryService;

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
        TelemetryService,
        {
          provide: DRIZZLE_ASYNC_PROVIDER,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    telemetryService = moduleRef.get(TelemetryService);
  });

  describe("create", () => {
    it("should return the created telemetry event", async () => {
      const mockedEntry = {
        userId: "1",
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      const mockedCreatedTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      mockedDrizzle.returning.mockResolvedValue([mockedCreatedTelemetryEvent]);

      const createdTelemetryEvent = await telemetryService.create(mockedEntry);

      expect(createdTelemetryEvent).toBeDefined();
      expect(createdTelemetryEvent).toEqual(mockedCreatedTelemetryEvent);
    });
  });

  describe("findOne", () => {
    const mockedEntry = {
      userId: "1",
      machineId:
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    };

    it("should return the telemetry event found if it exists", async () => {
      const mockedTelemetryEventFound = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      mockedDrizzle.limit.mockResolvedValue([mockedTelemetryEventFound]);

      const telemetryEventFound = await telemetryService.findOne(mockedEntry);

      expect(telemetryEventFound).toBeDefined();
      expect(telemetryEventFound).toEqual(mockedTelemetryEventFound);
    });

    it("should return null if the telemetry event doesn't exists", async () => {
      mockedDrizzle.limit.mockResolvedValue([]);

      const telemetryEventFound = await telemetryService.findOne(mockedEntry);

      expect(telemetryEventFound).toBeDefined();
      expect(telemetryEventFound).toBeNull();
    });
  });
});
