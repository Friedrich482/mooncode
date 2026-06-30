import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { EnvService } from "./env.service";

describe("envService", () => {
  let envService: EnvService;
  let configService: { get: Mock<Procedure> };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();

    configService = {
      get: vi.fn().mockImplementation((key: string) => process.env[key]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EnvService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    envService = moduleRef.get(EnvService);
  });

  describe("get", () => {
    const environmentVariableKey = "DATABASE_URL";
    const environmentVariableValue =
      "postgresql://postgres:postgres@host:5432/project";

    it("should return the proper value for an environment variable", () => {
      vi.stubEnv(environmentVariableKey, environmentVariableValue);

      const result = envService.get(environmentVariableKey);

      expect(result).toBeDefined();
      expect(result).toBe(environmentVariableValue);
    });

    it("should call the ConfigService.get method to retrieve the environment variable", () => {
      envService.get(environmentVariableKey);

      expect(configService.get).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledWith(
        environmentVariableKey,
        expect.anything(),
      );
    });
  });
});
