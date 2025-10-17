import { DateStingDto } from "@repo/common/schemas";
import { z } from "zod";

export const CreateDailyDataDto = z.object({
  targetedDate: DateStingDto,
  userId: z.ulid(),
  timeSpent: z.number().int().positive(),
});

export const findOneDailyDataDto = z.object({
  date: DateStingDto,
  userId: z.ulid(),
});

export const UpdateDailyDataDto = CreateDailyDataDto;

export const FindRangeDailyDataDto = z.object({
  userId: z.ulid(),
  start: DateStingDto,
  end: DateStingDto,
});

export type CreateDailyDataDtoType = z.infer<typeof CreateDailyDataDto>;

export type UpdateDailyDataDtoType = z.infer<typeof UpdateDailyDataDto>;

export type FindOneDailyDataDtoType = z.infer<typeof findOneDailyDataDto>;

export type FindRangeDailyDataDtoType = z.infer<typeof FindRangeDailyDataDto>;
