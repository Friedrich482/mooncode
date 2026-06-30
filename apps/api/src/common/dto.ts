import { IsoDateStringSchema } from "@repo/common/types-schemas";
import { JwtPayload as JwtPayloadDtoType } from "@repo/common/types-schemas";
import * as trpcExpress from "@trpc/server/adapters/express";

export const DateStringDto = IsoDateStringSchema;

export const environmentEnum = ["development", "production"] as const;

export type Environment = (typeof environmentEnum)[number];

export type TrpcContext = {
  req: trpcExpress.CreateExpressContextOptions["req"];
  res: trpcExpress.CreateExpressContextOptions["res"];
  user?: Pick<JwtPayloadDtoType, "sub">;
};
