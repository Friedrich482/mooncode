import { beforeEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

import * as utils from "@repo/common/format-zod-error";
import { TRPCError } from "@trpc/server";

import { errorFormatter } from "./error-formatter";

describe("errorFormatter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const errorMessage = "Field missing";
  const trpcErrorCodeKey = "BAD_GATEWAY" as const;
  const errorHttpStatusCode = 400;
  const errorCode = -32600 as const;
  const errorStack = "Error stack";
  const errorPath = "Error path";

  const mockedError = new TRPCError({
    code: trpcErrorCodeKey,
    message: errorMessage,
  });

  const errorShape = {
    message: errorMessage,
    code: errorCode,
    data: {
      stack: errorStack,
      path: errorPath,
      code: trpcErrorCodeKey,
      httpStatus: errorHttpStatusCode,
    },
  };

  it("should return an object including the message, the code and the data", () => {
    const mockedErrorResult = {
      code: errorCode,
      message: errorMessage,
      data: {
        code: trpcErrorCodeKey,
        httpStatus: errorHttpStatusCode,
        path: errorPath,
      },
    };

    const errorObject = errorFormatter({
      environment: "development",
      error: mockedError,
      shape: errorShape,
    });

    expect(errorObject).toBeDefined();
    expect(errorObject).toEqual({
      ...mockedErrorResult,
      data: expect.objectContaining(mockedErrorResult.data),
    });
  });

  it("should include the error stack in development", () => {
    const mockedErrorResult = {
      code: errorCode,
      message: errorMessage,
      data: {
        code: trpcErrorCodeKey,
        httpStatus: errorHttpStatusCode,
        path: errorPath,
        stack: errorStack,
      },
    };

    const errorObject = errorFormatter({
      environment: "development",
      error: mockedError,
      shape: errorShape,
    });

    expect(errorObject).toBeDefined();
    expect(errorObject).toEqual(mockedErrorResult);
  });

  it("should NOT include the error stack in production", () => {
    const mockedErrorResult = {
      code: errorCode,
      message: errorMessage,
      data: {
        code: trpcErrorCodeKey,
        httpStatus: errorHttpStatusCode,
        path: errorPath,
      },
    };

    const errorObject = errorFormatter({
      environment: "production",
      error: mockedError,
      shape: errorShape,
    });

    expect(errorObject).toBeDefined();
    expect(errorObject).toEqual(mockedErrorResult);
  });

  it("should handle zod errors properly", () => {
    const error = z.string().safeParse(12).error;

    const errorMessage = "Expected string, received number";
    const trpcErrorCodeKey = "BAD_GATEWAY" as const;
    const errorHttpStatusCode = 400;
    const errorStack = "Error stack";
    const errorPath = "Error path";

    const mockedError = new TRPCError({
      code: trpcErrorCodeKey,
      cause: error,
    });

    const errorShape = {
      message: errorMessage,
      code: -32600 as const,
      data: {
        stack: errorStack,
        path: errorPath,
        code: trpcErrorCodeKey,
        httpStatus: errorHttpStatusCode,
      },
    };

    const mockedErrorResult = {
      code: errorCode,
      message: errorMessage,
      data: {
        code: trpcErrorCodeKey,
        httpStatus: errorHttpStatusCode,
        path: errorPath,
      },
    };

    const formatZodErrorSpy = vi
      .spyOn(utils, "formatZodError")
      .mockReturnValue(errorMessage);

    const errorObject = errorFormatter({
      environment: "development",
      error: mockedError,
      shape: errorShape,
    });

    expect(errorObject).toBeDefined();
    expect(formatZodErrorSpy).toHaveBeenCalled();
    expect(errorObject).toEqual({
      ...mockedErrorResult,
      data: expect.objectContaining(mockedErrorResult.data),
    });
  });
});
