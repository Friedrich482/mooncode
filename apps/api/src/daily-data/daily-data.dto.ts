import { dateStringDto } from "@repo/common/schemas";
import { z } from "zod";

export const CreateDailyDataDto = z.object({
  targetedDate: dateStringDto,
  userId: z.ulid(),
  timeSpent: z.number().int().positive(),
});

export const findOneDailyDataDto = z.object({
  date: dateStringDto,
  userId: z.ulid(),
});

export const UpdateDailyDataDto = CreateDailyDataDto;

export const FindRangeDailyDataDto = z.object({
  userId: z.ulid(),
  start: dateStringDto,
  end: dateStringDto,
});

export type CreateDailyDataDtoType = z.infer<typeof CreateDailyDataDto>;

export type UpdateDailyDataDtoType = z.infer<typeof UpdateDailyDataDto>;

export type FindOneDailyDataDtoType = z.infer<typeof findOneDailyDataDto>;

export type FindRangeDailyDataDtoType = z.infer<typeof FindRangeDailyDataDto>;
