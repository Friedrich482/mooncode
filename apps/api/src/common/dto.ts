import z from "zod";

import { IsoDateStringSchema } from "@repo/common/types-schemas";
import { JwtPayload as JwtPayloadDtoType } from "@repo/common/types-schemas";
import * as trpcExpress from "@trpc/server/adapters/express";

export const DateStringDto = IsoDateStringSchema;

export const environmentEnum = ["development", "production"] as const;
export const SemVerDto = z
  .string()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    { error: "Must be a semantic version" },
  );

export type Environment = (typeof environmentEnum)[number];

export type TrpcContext = {
  req: trpcExpress.CreateExpressContextOptions["req"];
  res: trpcExpress.CreateExpressContextOptions["res"];
  user?: Pick<JwtPayloadDtoType, "sub">;
};
