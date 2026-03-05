import z from "zod";

export const FindByIdDto = z.object({
  id: z.ulid(),
});

export const DeletePasswordResetDto = z.object({
  id: z.ulid(),
});

export type FindByIdDtoType = z.infer<typeof FindByIdDto>;
export type DeletePasswordResetDtoType = z.infer<typeof DeletePasswordResetDto>;
