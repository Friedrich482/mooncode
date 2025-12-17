import z from "zod";

export const DeletePasswordResetAfterResetDto = z.object({
  email: z.email(),
});

export const GetPasswordResetDto = z.object({
  id: z.ulid(),
});

export type DeletePasswordResetAfterResetDtoType = z.infer<
  typeof DeletePasswordResetAfterResetDto
>;
export type GetPasswordResetDtoType = z.infer<typeof GetPasswordResetDto>;
