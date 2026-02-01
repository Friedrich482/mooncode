import { z } from "zod";

import { PERIODS } from "./constants";

export const PeriodSchema = z.enum([...PERIODS]);
export type Period = z.infer<typeof PeriodSchema>;
