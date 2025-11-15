import { z } from "zod";
import {
  BaseSchema,
  DateRangeSchema,
  refineAndTransformSchema,
  refineSchema,
  UserId,
} from "src/common/dto";

import { DateStringDto } from "@repo/common/types-schemas";

export const GetDailyFilesStatsForExtensionDto = z.object({
  dateString: DateStringDto,
});

export const UpsertFilesDto = z.object({
  timeSpentPerProject: z.record(
    z.string().min(1),
    z.number().int().nonnegative()
  ),
  filesData: z.record(
    z.string().min(1),
    z.object({
      timeSpent: z.number().int().nonnegative(),
      languageSlug: z.string().min(1),
      projectName: z.string().min(1),
      projectPath: z.string().min(1),
      fileName: z.string().min(1),
    })
  ),
  targetedDate: DateStringDto,
});

export const GetPeriodProjectsDto = refineSchema(DateRangeSchema);

export const GetProjectOnPeriodDto = refineSchema(
  z.object({
    ...DateRangeSchema.shape,
    name: z.string().min(1),
  })
);

export const GetProjectPerDayOfPeriodDto = refineAndTransformSchema(
  z.object({
    ...BaseSchema.shape,
    name: z.string().min(1),
  })
);
export const GetProjectLanguagesTimeOnPeriodDto = GetProjectOnPeriodDto;
export const GetProjectLanguagesPerDayOfPeriodDto = GetProjectPerDayOfPeriodDto;
export const GetProjectFilesOnPeriodDto = refineSchema(
  z.object({
    ...DateRangeSchema.shape,
    name: z.string().min(1),
    amount: z.number().int().nonnegative().optional(),
    languages: z.array(z.string().min(1)).optional(),
  })
);

export type GetDailyFilesStatsForExtensionDtoType = z.infer<
  typeof GetDailyFilesStatsForExtensionDto
> &
  UserId;

export type UpsertFilesStatsDtoType = z.infer<typeof UpsertFilesDto> & UserId;

export type GetPeriodProjectsDtoType = z.infer<typeof GetPeriodProjectsDto> &
  UserId;

export type GetProjectOnPeriodDtoType = z.infer<typeof GetProjectOnPeriodDto> &
  UserId;

export type GetProjectPerDayOfPeriodDtoType = z.infer<
  typeof GetProjectPerDayOfPeriodDto
> &
  UserId;

export type GetProjectLanguagesTimeOnPeriodType = z.infer<
  typeof GetProjectLanguagesTimeOnPeriodDto
> &
  UserId;

export type GetProjectLanguagesPerDayOfPeriodDtoType = z.infer<
  typeof GetProjectLanguagesPerDayOfPeriodDto
> &
  UserId;

export type GetProjectFilesOnPeriodDtoType = z.infer<
  typeof GetProjectFilesOnPeriodDto
> &
  UserId;
