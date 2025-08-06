import { ZodError, z } from "zod";
import { $ZodIssue } from "zod/v4/core/errors.cjs";
import { EnvService } from "src/env/env.service";
import { TRPCError } from "@trpc/server";

type ErrorShape = {
  data: {
    stack?: string | undefined;
    path?: string | undefined;
    zodIssues?: $ZodIssue[] | undefined;
    code: string;
    httpStatus: number;
  };
  message: string;
};

const errorFormatter = (
  envService: EnvService,
  {
    shape,
    error,
  }: {
    shape: ErrorShape;
    error: unknown;
  },
) => {
  const isDev = envService.get("NODE_ENV") === "development";

  if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
    if (error.cause && isZodError(error.cause)) {
      return {
        ...shape,
        message: z.prettifyError(error.cause),
        data: {
          code: shape.data.code,
          httpStatus: shape.data.httpStatus,
          ...(isDev && {
            stack: shape.data.stack,
            path: shape.data.path,
            zodIssues: error.cause.issues,
          }),
        },
      };
    }
  }

  // Handle direct Zod errors
  if (isZodError(error)) {
    return {
      ...shape,
      message: z.prettifyError(error),
      data: {
        code: shape.data.code,
        httpStatus: shape.data.httpStatus,
        ...(isDev && {
          stack: shape.data.stack,
          path: shape.data.path,
          zodIssues: error.issues,
        }),
      },
    };
  }

  // Other errors
  let cleanMessage = "An error occurred";

  if (error instanceof Error) {
    cleanMessage = error.message;
    try {
      if (error.message.startsWith("[") && error.message.endsWith("]")) {
        const parsedErrors = JSON.parse(error.message);
        if (Array.isArray(parsedErrors)) {
          cleanMessage = parsedErrors
            .map((err) => `${err.path?.join(".") || "field"}: ${err.message}`)
            .join("; ");
        }
      }
    } catch {
      // Keep original message if parsing fails
    }
  }

  return {
    ...shape,
    message: cleanMessage,
    data: {
      code: shape.data.code,
      httpStatus: shape.data.httpStatus,
      ...(isDev && {
        stack: shape.data.stack,
        path: shape.data.path,
      }),
    },
  };
};

const isZodError = (error: unknown) => {
  return error instanceof ZodError;
};

export { errorFormatter };
