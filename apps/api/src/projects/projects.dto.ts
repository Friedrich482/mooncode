import { z } from "zod";

import { DateStringDto } from "@repo/common/types-schemas";

export const CreateProjectDto = z.object({
  dailyDataId: z.ulid(),
  name: z.string().min(1),
  path: z.string().min(1),
  timeSpent: z.number().int().positive(),
});

export const UpdateProjectDto = z.object({
  dailyDataId: z.ulid(),
  timeSpent: z.number().int().positive(),
  name: z.string().min(1),
  path: z.string().min(1),
});

export const FindProjectDto = z.object({
  dailyDataId: z.ulid(),
  name: z.string().min(1),
  path: z.string().min(1),
});

export const FindProjectByNameOnRangeDto = z.object({
  userId: z.ulid(),
  start: DateStringDto,
  end: DateStringDto,
  name: z.string().min(1),
});

export const CheckProjectExistsDto = z.object({
  name: z.string().min(1),
  userId: z.ulid(),
});

export const FindAllRangeProjectsDto = z.object({
  userId: z.ulid(),
  start: DateStringDto,
  end: DateStringDto,
});

export const GroupAndAggregateProjectByNameDto = FindProjectByNameOnRangeDto;

export const getProjectLanguagesTimeOnPeriodDto = FindProjectByNameOnRangeDto;

export const getProjectLanguagesTimePerDayOfPeriodDto =
  FindProjectByNameOnRangeDto;

export const GetAllProjectFilesOnPeriodDto = z.object({
  ...FindProjectByNameOnRangeDto.shape,
  amount: z.number().optional(),
  languages: z.array(z.string()).optional(),
});

export type CreateProjectDtoType = z.infer<typeof CreateProjectDto>;

export type UpdateProjectDtoType = z.infer<typeof UpdateProjectDto>;

export type FindProjectDtoType = z.infer<typeof FindProjectDto>;

export type FindProjectByNameOnRangeDtoType = z.infer<
  typeof FindProjectByNameOnRangeDto
>;

export type CheckProjectExistsDtoType = z.infer<typeof CheckProjectExistsDto>;

export type FindAllRangeProjectsDtoType = z.infer<
  typeof FindAllRangeProjectsDto
>;

export type GroupAndAggregateProjectByNameDtoType = z.infer<
  typeof GroupAndAggregateProjectByNameDto
>;

export type GetProjectLanguagesTimeOnPeriodDtoType = z.infer<
  typeof getProjectLanguagesTimeOnPeriodDto
>;

export type GetProjectLanguagesTimePerDayOfPeriodDtoType = z.infer<
  typeof getProjectLanguagesTimePerDayOfPeriodDto
>;

export type GetAllProjectFilesOnPeriodDtoType = z.infer<
  typeof GetAllProjectFilesOnPeriodDto
>;
