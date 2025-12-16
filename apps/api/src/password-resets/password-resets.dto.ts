import z from "zod";

export const DeletePasswordResetAfterResetDto = z.object({
  email: z.email(),
});

export type DeletePasswordResetAfterResetDtoType = z.infer<
  typeof DeletePasswordResetAfterResetDto
>;
