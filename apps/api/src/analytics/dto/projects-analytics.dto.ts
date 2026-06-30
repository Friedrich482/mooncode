import { z } from "zod";

import { DateStringDto } from "@/common/dto";
import { UserId } from "@repo/common/types-schemas";

import {
  BaseDto,
  DateRangeDto,
  refineAndTransformDto,
  refineDto,
} from "./common";

export const FindProjectByNameOnRangeDto = z.object({
  userId: z.ulid(),
  start: DateStringDto,
  end: DateStringDto,
  name: z.string().min(1),
});

export const GetProjectLanguagesTimePerDayOfPeriodDto = z.object({
  userId: z.ulid(),
  start: DateStringDto,
  end: DateStringDto,
  name: z.string().min(1),
});

export const GetProjectDailyStatsDto = z.object({
  dateString: DateStringDto,
  name: z.string().min(1),
});

export const GetPeriodGeneralStatsForProjectDto = refineAndTransformDto(
  z.object({
    ...BaseDto.shape,
    name: z.string().min(1),
    todaysDateString: DateStringDto,
  }),
);

export const GetProjectFilesOnPeriodBaseDto = z.object({
  ...refineDto(
    z.object({
      ...DateRangeDto.shape,
      name: z.string().min(1),
    }),
  ).shape,
});

export const GetProjectFilesOnPeriodPaginatedDto = z.object({
  ...GetProjectFilesOnPeriodBaseDto.shape,
  page: z.number().int().positive(),
  languages: z.array(z.string()).min(1).optional(),
  type: z.literal("paginated"),
  search: z.string().min(1).max(20).optional(),
});

export const GetProjectFilesOnPeriodNormalDto = z.object({
  ...GetProjectFilesOnPeriodBaseDto.shape,
  amount: z.number().int().nonnegative(),
  type: z.literal("normal"),
});

export const GetProjectFilesOnPeriodDto = z.discriminatedUnion("type", [
  GetProjectFilesOnPeriodPaginatedDto,
  GetProjectFilesOnPeriodNormalDto,
]);

export const CheckProjectExistsDto = z.object({
  name: z.string().min(1),
});

export const GetPeriodProjectsDto = refineDto(
  z.object({ ...DateRangeDto.shape, page: z.number().int().positive() }),
);

export const GetProjectOnPeriodDto = refineDto(
  z.object({
    ...DateRangeDto.shape,
    name: z.string().min(1),
  }),
);

export const GetProjectPerDayOfPeriodDto = refineAndTransformDto(
  z.object({
    ...BaseDto.shape,
    name: z.string().min(1),
  }),
);

export const GetProjectLanguagesTimeOnPeriodDto = refineDto(
  z.object({
    ...DateRangeDto.shape,
    name: z.string().min(1),
  }),
);

export const GetProjectLanguagesPerDayOfPeriodDto = refineAndTransformDto(
  z.object({
    ...BaseDto.shape,
    name: z.string().min(1),
  }),
);

export type FindProjectByNameOnRangeDtoType = z.infer<
  typeof FindProjectByNameOnRangeDto
>;

export type GetProjectLanguagesTimeOnPeriodDtoType = z.infer<
  typeof GetProjectLanguagesTimeOnPeriodDto
> &
  UserId;

export type GetProjectLanguagesTimePerDayOfPeriodDtoType = z.infer<
  typeof GetProjectLanguagesTimePerDayOfPeriodDto
>;

export type GetProjectDailyStatsDtoType = z.infer<
  typeof GetProjectDailyStatsDto
> &
  UserId;

export type GetPeriodGeneralStatsForProjectDtoType = z.infer<
  typeof GetPeriodGeneralStatsForProjectDto
> &
  UserId;

export type GetProjectFilesOnPeriodDtoType = z.infer<
  typeof GetProjectFilesOnPeriodDto
> &
  UserId;

export type CheckProjectExistsDtoType = z.infer<typeof CheckProjectExistsDto> &
  UserId;

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
