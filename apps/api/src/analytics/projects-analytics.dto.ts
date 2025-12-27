import { z } from "zod";
import {
  BaseDto,
  DateRangeDto,
  refineAndTransformDto,
  refineDto,
  UserId,
} from "src/common/dto";
import { FindProjectByNameOnRangeDto } from "src/projects/projects.dto";

export const GetProjectLanguagesTimeOnPeriodDto = FindProjectByNameOnRangeDto;

export const GetProjectLanguagesTimePerDayOfPeriodDto =
  FindProjectByNameOnRangeDto;

export const GetProjectFilesOnPeriodDto = z.object({
  ...FindProjectByNameOnRangeDto.shape,
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

export const GetProjectLanguagesPerDayOfPeriodDto = GetProjectPerDayOfPeriodDto;

export type FindProjectByNameOnRangeDtoType = z.infer<
  typeof FindProjectByNameOnRangeDto
>;

export type GetProjectLanguagesTimeOnPeriodDtoType = z.infer<
  typeof GetProjectLanguagesTimeOnPeriodDto
>;

export type GetProjectLanguagesTimePerDayOfPeriodDtoType = z.infer<
  typeof GetProjectLanguagesTimePerDayOfPeriodDto
>;

export type GetProjectFilesOnPeriodDtoType = z.infer<
  typeof GetProjectFilesOnPeriodDto
>;

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
