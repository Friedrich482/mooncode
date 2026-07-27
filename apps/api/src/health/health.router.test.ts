import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { TrpcModule } from "@/trpc/trpc.module";
import { TrpcService } from "@/trpc/trpc.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { HealthRouter } from "./health.router";
import { HealthService } from "./health.service";

describe("HealthRouter", () => {
  let healthRouter: HealthRouter;
  let trpcService: TrpcService;

  let healthService: {
    ping: Mock<Procedure>;
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
    ReturnType<HealthRouter["procedures"]>["health"]["createCaller"]
  >;

  beforeEach(async () => {
    vi.clearAllMocks();

    healthService = {
      ping: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [TrpcModule],
      providers: [
        HealthRouter,
        {
          provide: HealthService,
          useValue: healthService,
        },
      ],
    }).compile();

    healthRouter = moduleRef.get(HealthRouter);
    trpcService = moduleRef.get(TrpcService);

    caller = trpcService.trpc.createCallerFactory(
      healthRouter.procedures().health,
    )(mockedCtx);
    vi.spyOn(trpcService, "getPayload").mockResolvedValue(mockedPayload);
  });

  describe("ping", () => {
    const mockedOutput = {
      status: "OK",
    };

    it("should call the ping method of the healthService", async () => {
      healthService.ping.mockReturnValue(mockedOutput);

      await caller.ping();

      expect(healthService.ping).toHaveBeenCalled();
    });

    it("should return a status object", async () => {
      healthService.ping.mockReturnValue(mockedOutput);

      const statusObj = await caller.ping();

      expect(statusObj).toBeDefined();
      expect(statusObj).toEqual(mockedOutput);
    });
  });
});
