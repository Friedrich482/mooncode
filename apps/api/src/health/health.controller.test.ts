import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController", () => {
  let healthController: HealthController;

  let healthService: {
    ping: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    healthService = { ping: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthController,
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    healthController = moduleRef.get(HealthController);
  });

  describe("ping", () => {
    it("should call the ping method of the healthService", () => {
      healthController.ping();

      expect(healthService.ping).toHaveBeenCalled();
    });
  });
});
