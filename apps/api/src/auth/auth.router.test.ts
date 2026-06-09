import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { TrpcService } from "@/trpc/trpc.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { AuthRouter } from "./auth.router";
import { AuthService } from "./auth.service";

describe("AuthRouter", async () => {
  let authRouter: AuthRouter;

  let authService: { signIn: Mock<Procedure> };

  let trpcService: {
    publicProcedure: Mock<Procedure>;
    privateProcedure: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    authService = {
      signIn: vi.fn(),
    };

    trpcService = {
      publicProcedure: vi.fn(),
      privateProcedure: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthRouter,
        {
          provide: TrpcService,
          useValue: trpcService,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authRouter = moduleRef.get(AuthRouter);
  });

  describe("signIn", () => {
    it("should call the signIn method of the authService", async () => {
      const mockedEntry = {
        ctx: { req: {} as Request, res: {} as Response, user: undefined },
        getRawInput: async () => {},
        input: "",
        meta: {},
        path: "",
        signal: new AbortController().signal,
        type: "query" as const,
      };

      authRouter.procedures().auth.signIn(mockedEntry);

      expect(authService.signIn).toHaveBeenCalled();
    });
  });
});
