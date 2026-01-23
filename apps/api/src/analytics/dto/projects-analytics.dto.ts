import { z } from "zod";
import { DateStringDto, UserId } from "src/common/dto";

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

export const GetProjectFilesOnPeriodDto = z.object({
  ...refineDto(
    z.object({
      ...DateRangeDto.shape,
      name: z.string().min(1),
    })
  ).shape,
  amount: z.number().optional(),
  languages: z.array(z.string()).optional(),
});

export const CheckProjectExistsDto = z.object({
  name: z.string().min(1),
});

export const GetPeriodProjectsDto = refineDto(DateRangeDto);

export const GetProjectOnPeriodDto = refineDto(
  z.object({
    ...DateRangeDto.shape,
    name: z.string().min(1),
  })
);

export const GetProjectPerDayOfPeriodDto = refineAndTransformDto(
  z.object({
    ...BaseDto.shape,
    name: z.string().min(1),
  })
);

export const GetProjectLanguagesTimeOnPeriodDto = refineDto(
  z.object({
    ...DateRangeDto.shape,
    name: z.string().min(1),
  })
);

export const GetProjectLanguagesPerDayOfPeriodDto = refineAndTransformDto(
  z.object({
    ...BaseDto.shape,
    name: z.string().min(1),
  })
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
