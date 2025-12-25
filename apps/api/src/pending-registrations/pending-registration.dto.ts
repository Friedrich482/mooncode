import z from "zod";

import { RegisterUserDto } from "@repo/common/types-schemas";

export const FindOnePendingRegistrationDto = RegisterUserDto.omit({
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
