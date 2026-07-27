import { z } from "zod";

import { IsoDateStringSchema } from "@repo/common/types-schemas";

import { PERIODS } from "./constants";

export const PeriodSchema = z.enum([...PERIODS]);

export const IsoDateSchema = IsoDateStringSchema.transform(
  (dateStr) => new Date(dateStr),
);

export type Period = z.infer<typeof PeriodSchema>;
