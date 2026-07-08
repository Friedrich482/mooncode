import { z } from "zod";

export const CreateBranchDto = z.object({
  projectId: z.ulid(),
  name: z.string().min(1),
  timeSpent: z.number().int().positive(),
});

export const FindBranchDto = z.object({
  projectId: z.ulid(),
  name: z.string().min(1),
});

export const UpdateBranchDto = z.object({
  projectId: z.ulid(),
  name: z.string().min(1),
  timeSpent: z.number().int().positive(),
});

export type CreateBranchDtoType = z.infer<typeof CreateBranchDto>;

export type FindBranchDtoType = z.infer<typeof FindBranchDto>;

export type UpdateBranchDtoType = z.infer<typeof UpdateBranchDto>;
