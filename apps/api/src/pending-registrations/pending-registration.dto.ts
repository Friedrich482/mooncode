import z from "zod";

import { RegisterUserSchema } from "@repo/common/types-schemas";

export const FindOnePendingRegistrationDto = RegisterUserSchema.omit({
  callbackUrl: true,
});

export const DeletePendingRegistrationDto = z.object({
  email: z.email(),
});

export type FindOnePendingRegistrationDtoType = z.infer<
  typeof FindOnePendingRegistrationDto
>;

export type DeletePendingRegistrationDtoType = z.infer<
  typeof DeletePendingRegistrationDto
>;
