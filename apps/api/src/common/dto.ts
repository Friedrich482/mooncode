import { IsoDateStringSchema } from "@repo/common/types-schemas";

export const DateStringDto = IsoDateStringSchema;

export type UserId = { userId: string };
export type Environment = "development" | "production";
