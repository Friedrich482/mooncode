import { z } from "zod";

import { DateStringDto } from "@/common/dto";
import { UserId } from "@repo/common/types-schemas";

export const GetLanguagesTimeForDayDto = z.object({
  dateString: DateStringDto,
});

export const GetFilesForDayDto = z.object({
  dateString: DateStringDto,
});

export const UpsertLanguagesDto = z.object({
  targetedDate: DateStringDto,
  timeSpentOnDay: z.number().int(),
  timeSpentPerLanguage: z.record(z.string().min(1), z.number().int()),
});

export const UpsertFilesDto = z.object({
  timeSpentPerProject: z.record(
    z.string().min(1),
    z.number().int().nonnegative(),
  ),
  filesData: z.record(
    z.string().min(1),
    z.object({
      timeSpent: z.number().int().nonnegative(),
      languageSlug: z.string().min(1),
      projectName: z.string().min(1),
      projectPath: z.string().min(1),
      fileName: z.string().min(1),
    }),
  ),
  targetedDate: DateStringDto,
});

export type GetLanguagesTimeForDayDtoType = z.infer<
  typeof GetLanguagesTimeForDayDto
> &
  UserId;

export type UpsertLanguagesDtoType = z.infer<typeof UpsertLanguagesDto> &
  UserId;

export type GetFilesForDayDtoType = z.infer<typeof GetFilesForDayDto> & UserId;

export type UpsertFilesDtoType = z.infer<typeof UpsertFilesDto> & UserId;
