import { ZodError } from "zod";

import { environmentEnum } from "@/common/dto";
import { formatZodError } from "@repo/common/format-zod-error";
import { TRPCError } from "@trpc/server";
import { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";

export const errorFormatter = ({
  environment,
  error,
  shape,
}: {
  environment: (typeof environmentEnum)[number];
  error: TRPCError;
  shape: DefaultErrorShape;
}) => {
  const isDev = environment === "development";

  return {
    ...shape,
    message:
      error.cause instanceof ZodError
        ? formatZodError(error.cause)
        : error.message,

    data: {
      code: shape.data.code,
      httpStatus: shape.data.httpStatus,
      path: shape.data.path,
      ...(isDev && { stack: shape.data.stack }),
    },
  };
};
