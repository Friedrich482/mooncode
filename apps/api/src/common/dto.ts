import { IsoDateStringSchema } from "@repo/common/types-schemas";

export const DateStringDto = IsoDateStringSchema;

export const environmentEnum = ["development", "production"] as const;
