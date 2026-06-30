import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { EnvService } from "@/env/env.service";
import { createMock } from "@golevelup/ts-vitest";
import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { AuthGuard } from "./auth.guard";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;

  let jwtService: {
    verifyAsync: Mock<Procedure>;
  };

  let envService: {
    get: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    jwtService = {
      verifyAsync: vi.fn(),
    };

    envService = {
      get: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: EnvService,
          useValue: envService,
        },
      ],
    }).compile();

    authGuard = moduleRef.get(AuthGuard);
  });

  describe("canActivate", () => {
    it("should return true", async () => {
      const mockedRequest = { cookies: { auth_token: "auth" } };

      const mockedPayload = {
        sub: "01kv1aqeffy49vc8bzq19nwvhh",
        iat: 1780458967,
        exp: 1782878167,
      };

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockedRequest);

      jwtService.verifyAsync.mockResolvedValue(mockedPayload);

      const returnValue = await authGuard.canActivate(mockExecutionContext);

      expect(returnValue).toBeDefined();
      expect(returnValue).toBe(true);
    });

    it("should attach the user to the request", async () => {
      const mockedRequest = { cookies: { auth_token: "auth" } };

      const mockedPayload = {
        sub: "01kv1aqeffy49vc8bzq19nwvhh",
        iat: 1780458967,
        exp: 1782878167,
      };
      const mockedUser = {
        sub: mockedPayload.sub,
      };

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockedRequest);

      jwtService.verifyAsync.mockResolvedValue(mockedPayload);

      await authGuard.canActivate(mockExecutionContext);

      const user = mockExecutionContext
        .switchToHttp()
        .getRequest<{ user: typeof mockedUser }>().user;

      expect(user).toBeDefined();
      expect(user).toEqual(mockedUser);
    });

    it("should throw an error if there is no authentication cookie in the request", async () => {
      const mockedRequest = { cookies: {} };

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockedRequest);

      const error = await authGuard
        .canActivate(mockExecutionContext)
        .catch((e) => e);

      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error)
        .property("message")
        .match(/cookie/i);
    });

    it("should throw an error if the jwt is expired or invalid", async () => {
      const mockedRequest = { cookies: { auth_token: "auth" } };

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockedRequest);

      jwtService.verifyAsync.mockThrow(
        new TokenExpiredError("jwt expired", new Date()),
      );

      const error = await authGuard
        .canActivate(mockExecutionContext)
        .catch((e) => e);

      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error).property("message").match(/token/i);
    });

    it("should throw an error if the payload decoded from the jwt has an invalid shape", async () => {
      const mockedRequest = { cookies: { auth_token: "auth" } };

      const mockedInvalidPayload = {
        something: "something",
      };

      const mockExecutionContext = createMock<ExecutionContext>();
      mockExecutionContext
        .switchToHttp()
        .getRequest.mockReturnValue(mockedRequest);

      jwtService.verifyAsync.mockResolvedValue(mockedInvalidPayload);

      const error = await authGuard
        .canActivate(mockExecutionContext)
        .catch((e) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error)
        .property("message")
        .match(/payload/i);
    });
  });
});
