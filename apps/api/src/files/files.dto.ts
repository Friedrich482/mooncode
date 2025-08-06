import { z } from "zod";

export const CreateFileDto = z.object({
  projectId: z.ulid(),
  languageId: z.ulid(),
  path: z.string().min(1),
  name: z.string().min(1),
  timeSpent: z.number().int(),
});

export const UpdateFileDto = z.object({
  projectId: z.ulid(),
  languageId: z.ulid(),
  timeSpent: z.number().int(),
  path: z.string().min(1),
  name: z.string().min(1),
});

export const FindOneFileDto = z.object({
  languageId: z.ulid(),
  projectId: z.ulid(),
  name: z.string().min(1),
  path: z.string().min(1),
});

export const FindAllFilesOnDayDto = z.object({
  dailyDataId: z.ulid(),
});

export type CreateFileDtoType = z.infer<typeof CreateFileDto>;

export type UpdateFileDtoType = z.infer<typeof UpdateFileDto>;

export type FindOneFileDtoType = z.infer<typeof FindOneFileDto>;

export type FindAllFilesOnDayDtoType = z.infer<typeof FindAllFilesOnDayDto>;
