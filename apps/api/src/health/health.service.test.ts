import { beforeEach, describe, expect, it, vi } from "vitest";

import { Test } from "@nestjs/testing";

import { HealthService } from "./health.service";

describe("HealthService", () => {
  let healthService: HealthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    healthService = moduleRef.get(HealthService);
  });

  describe("ping", () => {
    it("should return an OK status", () => {
      const { status } = healthService.ping();
      expect(status).toBeDefined();
      expect(status).toEqual("OK");
    });
  });
});
