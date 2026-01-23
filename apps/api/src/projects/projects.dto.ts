import { z } from "zod";
import { DateStringDto } from "src/common/dto";

export const CreateProjectDto = z.object({
  dailyDataId: z.ulid(),
  name: z.string().min(1),
  path: z.string().min(1),
  timeSpent: z.number().int().positive(),
});

export const FindProjectDto = z.object({
  dailyDataId: z.ulid(),
  name: z.string().min(1),
  path: z.string().min(1),
});

export const CheckProjectExistsDto = z.object({
  name: z.string().min(1),
  userId: z.ulid(),
});

export const FindRangeProjectsDto = z.object({
  userId: z.ulid(),
  start: DateStringDto,
  end: DateStringDto,
});

export const UpdateProjectDto = z.object({
  dailyDataId: z.ulid(),
  timeSpent: z.number().int().positive(),
  name: z.string().min(1),
  path: z.string().min(1),
});

export type CreateProjectDtoType = z.infer<typeof CreateProjectDto>;

export type FindProjectDtoType = z.infer<typeof FindProjectDto>;

export type CheckProjectExistsDtoType = z.infer<typeof CheckProjectExistsDto>;

export type FindRangeProjectsDtoType = z.infer<typeof FindRangeProjectsDto>;

export type UpdateProjectDtoType = z.infer<typeof UpdateProjectDto>;
