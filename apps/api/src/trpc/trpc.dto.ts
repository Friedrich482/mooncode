import { JwtPayload as JwtPayloadDtoType } from "@repo/common/types-schemas";
import * as trpcExpress from "@trpc/server/adapters/express";

export type TrpcContext = {
  req: trpcExpress.CreateExpressContextOptions["req"];
  res: trpcExpress.CreateExpressContextOptions["res"];
  user?: Pick<JwtPayloadDtoType, "sub">;
};

export type RateLimiterParams = {
  key: string;
  windowMs?: number;
  max?: number;
};
