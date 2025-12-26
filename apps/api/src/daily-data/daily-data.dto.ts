import { z } from "zod";
import { DateStringDto } from "src/common/dto";

export const CreateDailyDataDto = z.object({
  targetedDate: DateStringDto,
  userId: z.ulid(),
  timeSpent: z.number().int().positive(),
});

export const FindOneDailyDataDto = z.object({
  date: DateStringDto,
  userId: z.ulid(),
});

export const UpdateDailyDataDto = CreateDailyDataDto;

export const FindRangeDailyDataDto = z.object({
  userId: z.ulid(),
  start: DateStringDto,
  end: DateStringDto,
});

export type CreateDailyDataDtoType = z.infer<typeof CreateDailyDataDto>;

export type UpdateDailyDataDtoType = z.infer<typeof UpdateDailyDataDto>;

export type FindOneDailyDataDtoType = z.infer<typeof FindOneDailyDataDto>;

export type FindRangeDailyDataDtoType = z.infer<typeof FindRangeDailyDataDto>;
