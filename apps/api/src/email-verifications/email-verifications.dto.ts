import { z } from "zod";

import { RegisterUserSchema } from "@repo/common/types-schemas";

export const FindOneEmailVerificationDto = RegisterUserSchema.omit({
  callbackUrl: true,
});

export const DeleteEmailVerificationDto = z.object({
  email: z.email(),
});

export type FindOneEmailVerificationDtoType = z.infer<
  typeof FindOneEmailVerificationDto
>;

export type DeleteEmailVerificationDtoType = z.infer<
  typeof DeleteEmailVerificationDto
>;
