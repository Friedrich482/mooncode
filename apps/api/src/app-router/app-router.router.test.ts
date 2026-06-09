import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as trpcExpress from "@trpc/server/adapters/express";
import { Procedure } from "@vitest/spy";

import { AppRouterRouter } from "./app-router.router";

describe("trpcRouter", () => {
  let trpcRouter: AppRouterRouter;

  let appRouter: Mock<Procedure>;
  let mockedApp: INestApplication;

  beforeEach(async () => {
    vi.clearAllMocks();

    appRouter = vi.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppRouterRouter,
        {
          provide: "appRouter",
          useValue: appRouter,
        },
      ],
    }).compile();

    trpcRouter = moduleRef.get(AppRouterRouter);

    mockedApp = moduleRef.createNestApplication();
  });

  describe("applyMiddleware", () => {
    it("should register /trpc as the root path", () => {
      const useSpy = vi.spyOn(mockedApp, "use");
      trpcRouter.applyMiddleware(mockedApp);

      expect(useSpy).toHaveBeenCalled();
      expect(useSpy).toHaveBeenCalledWith("/trpc", expect.anything());
    });

    it("should pass the appRouter to the express middleware", () => {
      const expressAdapterSpy = vi.spyOn(
        trpcExpress,
        "createExpressMiddleware",
      );
      trpcRouter.applyMiddleware(mockedApp);

      expect(expressAdapterSpy).toHaveBeenCalled();
      expect(expressAdapterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          router: appRouter,
        }),
      );
    });
  });
});
