import z from "zod";

export const DeletePasswordResetDto = z.object({
  email: z.email(),
});

export const FindOnePasswordResetDto = z.object({
  id: z.ulid(),
});

export type FindOnePasswordResetDtoType = z.infer<
  typeof FindOnePasswordResetDto
>;
export type DeletePasswordResetDtoType = z.infer<typeof DeletePasswordResetDto>;
