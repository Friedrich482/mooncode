import { Request, Response } from "express";
import { ulid } from "ulid";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EnvService } from "@/env/env.service";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { TRPCError } from "@trpc/server";
import { Procedure } from "@vitest/spy";

import { TrpcService } from "./trpc.service";

describe("TrpcService", () => {
  let trpcService: TrpcService;

  let envService: { get: Mock<Procedure> };
  let jwtService: { verifyAsync: Mock<Procedure> };
  let trpc: { procedure: { use: Mock<Procedure> } };
  let limiters: Map<string, unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();

    envService = {
      get: vi.fn(),
    };

    jwtService = {
      verifyAsync: vi.fn(),
    };

    trpc = {
      procedure: {
        use: vi.fn(),
      },
    };

    limiters = new Map();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TrpcService,
        {
          provide: EnvService,
          useValue: envService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: "trpc",
          useValue: trpc,
        },
        {
          provide: "limiters",
          useValue: limiters,
        },
      ],
    }).compile();

    trpcService = moduleRef.get(TrpcService);

    // disable logging (especially errors) during testing
    moduleRef.useLogger(false);
  });

  describe("rateLimiter", () => {
    const mockedEntry = {
      key: "endpoint",
      windowMs: 5 * 60 * 1000,
      max: 10,
    };

    it("should return the limiter if the cache key already exists", () => {
      const rateLimitFunction = () => "rate limit function";

      limiters.set(
        `${mockedEntry.key}-${mockedEntry.windowMs}-${mockedEntry.max}`,
        rateLimitFunction,
      );

      const limiter = trpcService.rateLimiter(mockedEntry);

      expect(limiter).toBeDefined();
      expect(limiter).toEqual(rateLimitFunction);
    });

    it("should not recreate the limiter if the cache key already exists", () => {
      const rateLimitFunction = () => "rate limit function";

      limiters.set(
        `${mockedEntry.key}-${mockedEntry.windowMs}-${mockedEntry.max}`,
        rateLimitFunction,
      );

      const spySet = vi.spyOn(limiters, "set");

      trpcService.rateLimiter(mockedEntry);

      expect(spySet).not.toHaveBeenCalled();
    });

    it("should return the limiter if the cache key doesn't already exists", () => {
      const limiter = trpcService.rateLimiter(mockedEntry);

      expect(limiter).toBeDefined();
    });

    it("should create the limiter if the cache key doesn't already exists", () => {
      const spySet = vi.spyOn(limiters, "set");

      trpcService.rateLimiter(mockedEntry);

      expect(spySet).toHaveBeenCalled();
    });
  });

  describe("publicProcedure", () => {
    it("should return the procedure", () => {
      const mockedProcedure = {
        input: {},
      };
      trpc.procedure.use.mockReturnValue(mockedProcedure);

      const publicProcedure = trpcService.publicProcedure();

      expect(publicProcedure).toBeDefined();
      expect(publicProcedure).toEqual(mockedProcedure);
    });

    it("should use the rateLimiter with default args when nothing is passed on argument to the method", () => {
      const rateLimiterSpy = vi.spyOn(trpcService, "rateLimiter");

      trpcService.publicProcedure();

      expect(rateLimiterSpy).toHaveBeenCalled();
      expect(rateLimiterSpy).toHaveBeenCalledWith({ key: "global" });
    });

    it("should use the rateLimiter with the parameter passed", () => {
      const mockedEntry = {
        key: "module",
        max: 3,
        windowMs: 4 * 60 * 1000,
      };

      const rateLimiterSpy = vi.spyOn(trpcService, "rateLimiter");

      trpcService.publicProcedure(mockedEntry);

      expect(rateLimiterSpy).toHaveBeenCalled();
      expect(rateLimiterSpy).toHaveBeenCalledWith(mockedEntry);
    });
  });

  describe("protectedProcedure", () => {
    it("should return the procedure", () => {
      const mockedProcedure = {
        input: {},
      };

      trpc.procedure.use
        .mockReturnValueOnce(trpc.procedure)
        .mockReturnValueOnce(mockedProcedure);

      const protectedProcedure = trpcService.protectedProcedure();

      expect(protectedProcedure).toBeDefined();
      expect(protectedProcedure).toEqual(mockedProcedure);
    });

    it("should use the rateLimiter with default args when nothing is passed on argument to the method", () => {
      const mockedProcedure = {
        input: {},
      };

      trpc.procedure.use
        .mockReturnValueOnce(trpc.procedure)
        .mockReturnValueOnce(mockedProcedure);

      const rateLimiterSpy = vi.spyOn(trpcService, "rateLimiter");

      trpcService.protectedProcedure();

      expect(rateLimiterSpy).toHaveBeenCalled();
      expect(rateLimiterSpy).toHaveBeenCalledWith({ key: "global" });
    });

    it("should use the rateLimiter with the parameter passed", () => {
      const mockedEntry = {
        key: "module",
        max: 3,
        windowMs: 4 * 60 * 1000,
      };

      const mockedProcedure = {
        input: {},
      };

      trpc.procedure.use
        .mockReturnValueOnce(trpc.procedure)
        .mockReturnValueOnce(mockedProcedure);

      const rateLimiterSpy = vi.spyOn(trpcService, "rateLimiter");

      trpcService.protectedProcedure(mockedEntry);

      expect(rateLimiterSpy).toHaveBeenCalled();
      expect(rateLimiterSpy).toHaveBeenCalledWith(mockedEntry);
    });

    it("should use the authMiddleware", () => {
      const mockedProcedure = {
        input: {},
      };

      trpc.procedure.use
        .mockReturnValueOnce(trpc.procedure)
        .mockReturnValueOnce(mockedProcedure);

      const useSpy = vi.spyOn(trpc.procedure, "use");

      trpcService.protectedProcedure();

      expect(useSpy).toHaveBeenCalledTimes(2);

      // Verify the second call includes the auth middleware function
      const secondCallArg = useSpy.mock.calls[1][0];
      expect(secondCallArg).toBeDefined();
      expect(typeof secondCallArg).toBe("function");
      expect(secondCallArg.toString()).toMatch(/authMiddleware/);
    });

    it("should use the authMiddleware AFTER the rateLimiter", () => {
      const mockedProcedure = {
        input: {},
      };

      trpc.procedure.use
        .mockReturnValueOnce(trpc.procedure)
        .mockReturnValueOnce(mockedProcedure);

      const useSpy = vi.spyOn(trpc.procedure, "use");
      const rateLimiterSpy = vi.spyOn(trpcService, "rateLimiter");

      trpcService.protectedProcedure();

      const firstCallArg = useSpy.mock.calls[0][0];
      const secondCallArg = useSpy.mock.calls[1][0];

      expect(firstCallArg).toEqual(rateLimiterSpy.mock.results[0].value);
      expect(secondCallArg.toString()).toMatch(/authMiddleware/);
    });
  });

  describe("authMiddleware", () => {
    it("should pass the context", async () => {
      const mockedPayload = {
        sub: "1",
        iat: 1780008123,
        exp: 1782427323,
      };

      const nextSpy = vi.fn();
      const getPayloadSpy = vi.spyOn(trpcService, "getPayload");

      getPayloadSpy.mockResolvedValue(mockedPayload);

      const mockedEntry = {
        ctx: { req: {} as Request, res: {} as Response, user: undefined },
        getRawInput: async () => {},
        input: "",
        meta: {},
        path: "",
        signal: new AbortController().signal,
        type: "query" as const,
        next: nextSpy,
      };

      await trpcService.authMiddleware(mockedEntry);

      expect(nextSpy).toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalledWith({
        ctx: {
          ...mockedEntry.ctx,
          user: { sub: mockedPayload.sub },
        },
      });
    });
  });

  describe("getPayload", () => {
    it("should return the decoded jwt payload when coming from the browser (cookies)", async () => {
      const mockedEntry = {
        req: {
          cookies: { auth_token: "token" } as Record<string, string>,
          ip: "192.168.25.44",
        } as Request,
        res: {} as Response,
      };

      const mockedPayload = {
        sub: ulid().toLowerCase(),
        iat: 1780008123,
        exp: 1782427323,
      };

      envService.get.mockImplementation((key: string) =>
        key === "NODE_ENV" ? "development" : (process.env[key] ?? "string"),
      );

      jwtService.verifyAsync.mockResolvedValue(mockedPayload);

      const payload = await trpcService.getPayload(mockedEntry);

      expect(payload).toBeDefined();
      expect(payload).toEqual(mockedPayload);
    });

    it("should return the decoded jwt payload when coming from the extension (bearer token)", async () => {
      const mockedEntry = {
        req: {
          headers: { authorization: "Bearer token" } as Record<string, string>,
          ip: "192.168.25.44",
        } as Request,
        res: {} as Response,
      };

      const mockedPayload = {
        sub: ulid().toLowerCase(),
        iat: 1780008123,
        exp: 1782427323,
      };

      envService.get.mockImplementation((key: string) =>
        key === "NODE_ENV" ? "development" : (process.env[key] ?? "string"),
      );

      jwtService.verifyAsync.mockResolvedValue(mockedPayload);

      const payload = await trpcService.getPayload(mockedEntry);

      expect(payload).toBeDefined();
      expect(payload).toEqual(mockedPayload);
    });

    it("should throw an error if there is no jwt found either in the cookies or in the authorization headers", async () => {
      const mockedEntry = {
        req: {} as Request,
        res: {} as Response,
      };

      const error = await trpcService.getPayload(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("UNAUTHORIZED");
      expect(error)
        .property("message")
        .match(/cookie/)
        .match(/token/);
    });

    it("should throw an error if the jwt is expired or invalid", async () => {
      const mockedEntry = {
        req: {
          cookies: { auth_token: "token" } as Record<string, string>,
          ip: "192.168.25.44",
        } as Request,
        res: {} as Response,
      };

      envService.get.mockImplementation((key: string) => {
        switch (key) {
          case "NODE_ENV":
            return "development";
          case "JWT_SECRET":
            return "secret";
          default:
            return process.env[key] ?? "string";
        }
      });

      jwtService.verifyAsync.mockThrow(
        new TokenExpiredError("jwt expired", new Date()),
      );

      const error = await trpcService.getPayload(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("UNAUTHORIZED");
      expect(error).property("message").match(/token/);
    });

    it("should throw an error if the payload decoded from the jwt has an invalid shape", async () => {
      const mockedEntry = {
        req: {
          cookies: { auth_token: "token" } as Record<string, string>,

          ip: "192.168.25.44",
        } as Request,
        res: {} as Response,
      };

      envService.get.mockImplementation((key: string) => {
        switch (key) {
          case "NODE_ENV":
            return "development";
          case "JWT_SECRET":
            return "secret";
          default:
            return process.env[key] ?? "string";
        }
      });

      const mockedInvalidPayload = {
        something: "something",
      };

      jwtService.verifyAsync.mockResolvedValue(mockedInvalidPayload);

      const error = await trpcService.getPayload(mockedEntry).catch((e) => e);

      expect(error).toBeInstanceOf(TRPCError);
      expect(error).property("code").eql("BAD_REQUEST");
      expect(error)
        .property("message")
        .match(/payload/i);
    });
  });
});
